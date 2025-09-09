// server/routes/verificationRoutes.js
import express from "express";
import AdvancedVerifier from "./advancedVerification.js";
import multer from "multer";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { PrismaClient } from "@prisma/client";
import pLimit from "p-limit";
import dayjs from 'dayjs';
import cron from 'node-cron';
const prisma = new PrismaClient();
const router = express.Router();

// Fast defaults: short timeouts, no greylist retry
const verifier = new AdvancedVerifier({
  dnsTimeout: 2000,
  smtpTimeout: 3000,
  retryGreylist: 0,
  cacheTtlMs: 30 * 60 * 1000, // 30 min
  sgConcurrency: 200,         // cap SG parallel calls
});

const unlinkFile = promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });

// Helper to detect fake/example emails (pre-filter noise)
function isExampleOrFakeEmail(email) {
  const fakePatterns = [
    /example/i,
    /test/i,
    /demo/i,
    /fake/i,
    /invalid/i,
    /sample/i,
    /noreply/i,
    /no-reply/i,
    /first@/i,
    /last@/i,
    /first\./i,
    /last\./i,
    /^first$/i,
    /^last$/i,
    /first_last/i,
    /last_first/i,
    /^flast@/i,
    /^f\.last@/i,
    /^last\.first@/i,
    /^first\.last@/i,
    /^last_initial@/i,
    /^test\d*@/i,
    /^test[_.\-]?user@/i,
    /^test[_.\-]?account@/i,
    /^administrator@/i,
    /^j[_.\-]?doe@/i,
    /^john\.doe@/i,
    /^user\d+@/i,
    /^abc@/i,
    /^jsmith@/i,
    /^firstname@/i,
  ];

  const disposableDomains = new Set([
    "example.com", "mailinator.com", "tempmail.com", "fakeemail.com",
    "disposablemail.com", "maildrop.cc", "yopmail.com", "guerrillamail.com"
  ]);

  const [local, domain] = (email || "").toLowerCase().split("@");
  if (!local || !domain) return true;

  if (disposableDomains.has(domain)) return true;

  return fakePatterns.some((pattern) => pattern.test(email));
}

// Extract first email-like field from an object row
function firstEmailInObject(row) {
  for (const val of Object.values(row)) {
    if (typeof val === "string") {
      const m = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (m) return m[0];
    }
  }
  return null;
}

// --------- 1. Single Verify ----------
router.post("/verify-single", async (req, res) => {
  const { email, smtpCheck = false } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const isFake = isExampleOrFakeEmail(email);  // ✅ Use helper function

  if (isFake) {
    const result = {
      email,
      status: "invalid",
      score: 50,
      syntax_valid: true,
      domain_valid: true,
      mailbox_exists: false,
      catch_all: false,
      disposable: false,
      role_based: false,
      greylisted: false,
      error: "Fake/example pattern matched",
    };

    await prisma.verification.upsert({
      where: { email },
      update: result,
      create: result,
    });

    return res.json(result);
  }

  try {
    const result = await verifier.verify(email, {
      smtpCheck: Boolean(smtpCheck),
      isBulk: false,
    });

    await prisma.verification.upsert({
      where: { email: result.email },
      update: {
        status: result.status,
        score: result.score,
        syntax_valid: result.syntax_valid,
        domain_valid: result.domain_valid,
        mailbox_exists: result.mailbox_exists ?? false,
        catch_all: result.catch_all,
        disposable: result.disposable,
        role_based: result.role_based,
        greylisted: result.greylisted,
        error: result.error || null,
      },
      create: {
        email: result.email,
        status: result.status,
        score: result.score,
        syntax_valid: result.syntax_valid,
        domain_valid: result.domain_valid,
        mailbox_exists: result.mailbox_exists ?? false,
        catch_all: result.catch_all,
        disposable: result.disposable,
        role_based: result.role_based,
        greylisted: result.greylisted,
        error: result.error || null,
      },
    });

    res.json(result);
  } catch (err) {
    console.error("[/verify-single] ERROR:", err);
    res.status(500).json({ error: "Verification error", details: err.message });
  }
});


// --------- 2. Bulk Verify (fast path) ----------
router.post("/verify-bulk", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  const ext = path.extname(req.file?.originalname || "").toLowerCase();

  if (!filePath || !req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const emails = [];

  try {
    // Parse file
    if (ext === ".csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            const e = firstEmailInObject(row);
            if (e) emails.push(e.trim().toLowerCase());
          })
          .on("end", resolve)
          .on("error", reject);
      });
    } else if (ext === ".xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      rows.forEach((r) => {
        const e = firstEmailInObject(r);
        if (e) emails.push(e.trim().toLowerCase());
      });
    } else if (ext === ".txt") {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line) => {
        const match = line.trim().match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (match) emails.push(match[0].toLowerCase());
      });
    } else {
      await unlinkFile(filePath);
      return res.status(400).json({ error: "Unsupported file type." });
    }

    // Clean + de-dup + pre-filter obvious fakes
    const uniqueEmails = [...new Set(emails)]
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const filteredEmails = uniqueEmails.filter((e) => !isExampleOrFakeEmail(e));

    if (!filteredEmails.length) {
      await unlinkFile(filePath);
      return res.status(400).json({ error: "No valid (non-fake) emails found in file." });
    }

    // Summary
    const summary = {
      total: filteredEmails.length,
      valid: 0,
      invalid: 0,
      risky: 0,
      disposable: 0,
      role_based: 0,
      catch_all: 0,
      greylisted: 0,
      invalid_domain: 0
    };

    const results = [];
    const batchResults = [];

    const limit = pLimit(500); // concurrency

    const jobs = filteredEmails.map((email) =>
      limit(async () => {
        try {
          const result = await verifier.verify(email, { smtpCheck: false, isBulk: true });

          if (["valid", "invalid", "risky"].includes(result.status)) summary[result.status]++;
          if (result.disposable) summary.disposable++;
          if (result.role_based) summary.role_based++;
          if (result.catch_all) summary.catch_all++;
          if (result.greylisted) summary.greylisted++;
          if (result.reason === "invalid_domain") summary.invalid_domain++;

          results.push(result);
          batchResults.push(result);
        } catch (err) {
          const result = {
            email,
            status: "invalid",
            reason: "exception",
            score: 0,
            syntax_valid: false,
            domain_valid: false,
            mailbox_exists: false,
            catch_all: false,
            disposable: false,
            role_based: false,
            greylisted: false,
            error: err.message,
            mx: []
          };
          summary.invalid++;
          results.push(result);
          batchResults.push(result);
        }
      })
    );

    await Promise.all(jobs);

    // ✅ Save VerificationBatch + child results
    const batch = await prisma.verificationBatch.create({
      data: {
        name: req.file?.originalname || "bulk_upload",
        source: "bulk",
        includeOnlyValid: false,
        maxRich: false,
        total: filteredEmails.length,
        validCount: summary.valid,
        invalidCount: summary.invalid,
        riskyCount: summary.risky,
        results: {
          create: batchResults.map(r => ({
            email: r.email,
            status: r.status,
            score: r.score,
            syntax_valid: r.syntax_valid,
            domain_valid: r.domain_valid,
            mailbox_exists: r.mailbox_exists ?? false,
            catch_all: r.catch_all,
            disposable: r.disposable,
            role_based: r.role_based,
            greylisted: r.greylisted,
            mx: Array.isArray(r.mx) ? r.mx.join(",") : null,
            error: r.error || null
          }))
        }
      },
      include: { results: true }
    });

    // ✅ Upsert into Verification (latest state)
    const chunkSize = 500;
    for (let i = 0; i < batchResults.length; i += chunkSize) {
      const chunk = batchResults.slice(i, i + chunkSize);
      await prisma.$transaction(
        chunk.map((data) =>
          prisma.verification.upsert({
            where: { email: data.email },
            update: {
              status: data.status,
              score: data.score,
              syntax_valid: data.syntax_valid,
              domain_valid: data.domain_valid,
              mailbox_exists: data.mailbox_exists ?? false,
              catch_all: data.catch_all,
              disposable: data.disposable,
              role_based: data.role_based,
              greylisted: data.greylisted,
              error: data.error || null,
            },
            create: {
              email: data.email,
              status: data.status,
              score: data.score,
              syntax_valid: data.syntax_valid,
              domain_valid: data.domain_valid,
              mailbox_exists: data.mailbox_exists ?? false,
              catch_all: data.catch_all,
              disposable: data.disposable,
              role_based: data.role_based,
              greylisted: data.greylisted,
              error: data.error || null,
            },
          })
        )
      );
    }

    await unlinkFile(filePath);

    return res.json({
      batchId: batch.id,
      ...summary,
      results: results.sort((a, b) => b.score - a.score),
      stats: verifier.getStats(),
    });
  } catch (err) {
    if (fs.existsSync(filePath)) await unlinkFile(filePath);
    return res.status(500).json({ error: "Bulk verification failed", details: err.message });
  }
});


// --------- 3. Health Check ----------
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "fast-mx-required",
    features: [
      "syntax_validation",
      "dns_mx_required",
      "sendgrid_integration_with_keepalive",
      "optional_smtp_verification",
      "disposable_detection",
      "role_based_detection",
      "greylist_nonblocking",
      "scoring_v2",
      "stats_endpoint"
    ],
  });
});

// --------- 4. Statistics ----------
router.get("/stats", (req, res) => {
  const stats = verifier.getStats();
  res.json(stats);
});


// ... existing imports (prisma, verifier, etc)

// router.post('/verify-manual', async (req, res) => {
//   const { text = "", includeOnlyValid = false, maxRich = false, name = "manual_paste" } = req.body || {};
//   if (!text || typeof text !== 'string') return res.status(400).json({ error: "text (pasted emails) required" });

//   // extract emails using same regex you used in txt parsing
//   const lines = text.split(/\r?\n/);
//   const emails = new Set();
//   lines.forEach(line => {
//     const match = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g);
//     if (match) match.forEach(m => emails.add(m.trim().toLowerCase()));
//   });

//   const emailList = Array.from(emails);
//   if (!emailList.length) return res.status(400).json({ error: "No emails found in pasted text." });



//   const limit = pLimit(200); // tune as needed

//   const results = [];
//   const summary = { total: emailList.length, valid: 0, invalid: 0, risky: 0, disposable: 0, role_based: 0, catch_all: 0, greylisted: 0 };

//   await Promise.all(
//     emailList.map(e => limit(async () => {
//       try {
//         // If maxRich true, we keep DNS/MX details -- the verifier already returns mx (advancedVerification.js)
//         const r = await verifier.verify(e, { smtpCheck: false, isBulk: false });
//         // Optionally do extra MX resolution when maxRich requested (the verifier.validateDomain already does MX)
//         results.push(r);
//         if (["valid", "invalid", "risky"].includes(r.status)) summary[r.status]++;
//         if (r.disposable) summary.disposable++;
//         if (r.role_based) summary.role_based++;
//         if (r.catch_all) summary.catch_all++;
//         if (r.greylisted) summary.greylisted++;
//       } catch (err) {
//         const rr = { email: e, status: "invalid", score: 0, syntax_valid: false, domain_valid: false, mailbox_exists: false, catch_all: false, disposable: false, role_based: false, greylisted: false, error: err.message };
//         results.push(rr);
//         summary.invalid++;
//       }
//     }))
//   );

//   // Apply includeOnlyValid filter if requested (note: "include only valid" means exclude invalid)
//   const savedResults = includeOnlyValid ? results.filter(r => r.status === "valid" || r.status === "risky") : results;

//   // Persist batch
//   const batch = await prisma.verificationBatch.create({
//     data: {
//       name,
//       source: "manual",
//       includeOnlyValid,
//       maxRich,
//       total: emailList.length,
//       validCount: summary.valid,
//       invalidCount: summary.invalid,
//       riskyCount: summary.risky,
//       results: {
//         create: savedResults.map(r => ({
//           email: r.email,
//           status: r.status,
//           score: r.score,
//           syntax_valid: r.syntax_valid,
//           domain_valid: r.domain_valid,
//           mailbox_exists: r.mailbox_exists ?? false,
//           catch_all: r.catch_all,
//           disposable: r.disposable,
//           role_based: r.role_based,
//           greylisted: r.greylisted,
//           mx: Array.isArray(r.mx) ? r.mx.join(',') : null,
//           error: r.error || null
//         }))
//       }
//     },
//     include: { results: true }
//   });

//   // Upsert latest state to `Verification` (so your quick lookups/upserts continue to work)
//   const chunkSize = 200;
//   for (let i = 0; i < savedResults.length; i += chunkSize) {
//     const chunk = savedResults.slice(i, i + chunkSize);
//     await prisma.$transaction(chunk.map(data => prisma.verification.upsert({
//       where: { email: data.email },
//       update: {
//         status: data.status,
//         score: data.score,
//         syntax_valid: data.syntax_valid,
//         domain_valid: data.domain_valid,
//         mailbox_exists: data.mailbox_exists ?? false,
//         catch_all: data.catch_all,
//         disposable: data.disposable,
//         role_based: data.role_based,
//         greylisted: data.greylisted,
//         error: data.error || null
//       },
//       create: {
//         email: data.email,
//         status: data.status,
//         score: data.score,
//         syntax_valid: data.syntax_valid,
//         domain_valid: data.domain_valid,
//         mailbox_exists: data.mailbox_exists ?? false,
//         catch_all: data.catch_all,
//         disposable: data.disposable,
//         role_based: data.role_based,
//         greylisted: data.greylisted,
//         error: data.error || null
//       }
//     })));
//   }

//   res.json({
//     batchId: batch.id,
//     summary,
//     savedCount: savedResults.length,
//     results: savedResults.sort((a, b) => b.score - a.score)
//   });
// });



// ... existing imports (prisma, verifier, etc)

router.post('/verify-manual', async (req, res) => {
  const { text = "", includeOnlyValid = false, maxRich = false, name = "manual_paste" } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: "text (pasted emails) required" });

  // extract emails using same regex you used in txt parsing
  const lines = text.split(/\r?\n/);
  const emails = new Set();
  lines.forEach(line => {
    const match = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}/g);
    if (match) match.forEach(m => emails.add(m.trim().toLowerCase()));
  });

  const emailList = Array.from(emails);
  if (!emailList.length) return res.status(400).json({ error: "No emails found in pasted text." });

  const limit = pLimit(200); // tune as needed

  const results = [];
  const summary = { total: emailList.length, valid: 0, invalid: 0, risky: 0, disposable: 0, role_based: 0, catch_all: 0, greylisted: 0 };

  await Promise.all(
    emailList.map(e => limit(async () => {
      try {
        // If maxRich true, we keep DNS/MX details -- the verifier already returns mx (advancedVerification.js)
        const r = await verifier.verify(e, { smtpCheck: false, isBulk: false });
        // Optionally do extra MX resolution when maxRich requested (the verifier.validateDomain already does MX)
        results.push(r);
        if (["valid", "invalid", "risky"].includes(r.status)) summary[r.status]++;
        if (r.disposable) summary.disposable++;
        if (r.role_based) summary.role_based++;
        if (r.catch_all) summary.catch_all++;
        if (r.greylisted) summary.greylisted++;
      } catch (err) {
        const rr = { email: e, status: "invalid", score: 0, syntax_valid: false, domain_valid: false, mailbox_exists: false, catch_all: false, disposable: false, role_based: false, greylisted: false, error: err.message };
        results.push(rr);
        summary.invalid++;
      }
    }))
  );

  // Apply includeOnlyValid filter if requested (note: "include only valid" means exclude invalid)
  const savedResults = includeOnlyValid ? results.filter(r => r.status === "valid" || r.status === "risky") : results;

  // Persist batch
  const batch = await prisma.verificationBatch.create({
    data: {
      name,
      source: "manual",
      includeOnlyValid,
      maxRich,
      total: emailList.length,
      validCount: summary.valid,
      invalidCount: summary.invalid,
      riskyCount: summary.risky,
      results: {
        create: savedResults.map(r => ({
          email: r.email,
          status: r.status,
          score: r.score,
          syntax_valid: r.syntax_valid,
          domain_valid: r.domain_valid,
          mailbox_exists: r.mailbox_exists ?? false,
          catch_all: r.catch_all,
          disposable: r.disposable,
          role_based: r.role_based,
          greylisted: r.greylisted,
          mx: Array.isArray(r.mx) ? r.mx.join(',') : null,
          error: r.error || null
        }))
      }
    },
    include: { results: true }
  });

  // Upsert latest state to `Verification` (so your quick lookups/upserts continue to work)
  const chunkSize = 200;
  for (let i = 0; i < savedResults.length; i += chunkSize) {
    const chunk = savedResults.slice(i, i + chunkSize);
    await prisma.$transaction(chunk.map(data => prisma.verification.upsert({
      where: { email: data.email },
      update: {
        status: data.status,
        score: data.score,
        syntax_valid: data.syntax_valid,
        domain_valid: data.domain_valid,
        mailbox_exists: data.mailbox_exists ?? false,
        catch_all: data.catch_all,
        disposable: data.disposable,
        role_based: data.role_based,
        greylisted: data.greylisted,
        error: data.error || null
      },
      create: {
        email: data.email,
        status: data.status,
        score: data.score,
        syntax_valid: data.syntax_valid,
        domain_valid: data.domain_valid,
        mailbox_exists: data.mailbox_exists ?? false,
        catch_all: data.catch_all,
        disposable: data.disposable,
        role_based: data.role_based,
        greylisted: data.greylisted,
        error: data.error || null
      }
    })));
  }

  res.json({
    batchId: batch.id,
    summary,
    savedCount: savedResults.length,
    results: savedResults.sort((a, b) => b.score - a.score)
  });
});

router.get('/batches', async (req, res) => {
  const { source } = req.query;
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const where = { createdAt: { gte: cutoff } };
  if (source) where.source = source;

  const batches = await prisma.verificationBatch.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { results: true }
  });

  // Add computed summary
  const enriched = batches.map(b => {
    const summary = {
      total: b.results.length,
      valid: b.results.filter(r => r.status === "valid").length,
      invalid: b.results.filter(r => r.status === "invalid").length,
      risky: b.results.filter(r => r.status === "risky").length,
      roleBased: b.results.filter(r => r.role_based).length,
      catchAll: b.results.filter(r => r.catch_all).length,
    };
    return { ...b, summary };
  });

  res.json({ batches: enriched });
});



export default router;