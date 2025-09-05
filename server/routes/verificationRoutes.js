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

const prisma = new PrismaClient();

// Helper function to detect fake/example emails automatically
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
    /admin/i,
    /contact/i,
    /^j[_.\-]?doe@/i, // matches j_doe@, j-doe@, j.doe@ etc.
    /^john\.doe@/i,
    /^user\d+@/i,
    /^abc@/i,
  ];

  const disposableDomains = new Set([
    "example.com",
    "mailinator.com",
    "tempmail.com",
    "fakeemail.com",
    "disposablemail.com",
    "maildrop.cc",
  ]);

  const [local, domain] = email.toLowerCase().split("@");

  if (!local || !domain) return true; // treat as fake/invalid

  if (disposableDomains.has(domain)) return true;

  return fakePatterns.some((pattern) => pattern.test(email));
}
const router = express.Router();
const verifier = new AdvancedVerifier({
  maxRetries: 1,
  dnsTimeout: 200,
  smtpTimeout: 500,
  concurrency: 20
});

const unlinkFile = promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });

// --------- 1. Single Verify ----------
router.post("/verify-single", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await verifier.verify(email.trim().toLowerCase());

    // Save to DB
    await prisma.verification.upsert({
      where: { email: result.email },
      update: {
        status: result.status,
        score: result.score,
        syntax_valid: result.syntax_valid,
        domain_valid: result.domain_valid,
        mailbox_exists: result.mailbox_exists,
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
        mailbox_exists: result.mailbox_exists,
        catch_all: result.catch_all,
        disposable: result.disposable,
        role_based: result.role_based,
        greylisted: result.greylisted,
        error: result.error || null,
      },
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Verification error", details: err.message });
  }
});

// --------- 2. Bulk Verify ----------
import pLimit from "p-limit"; // Add at the top of the file

router.post("/verify-bulk", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  const ext = path.extname(req.file?.originalname || "").toLowerCase();

  if (!filePath || !req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const emails = [];

  try {
    // ---- Parse input file based on extension ----
    if (ext === ".csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            const e = Object.values(row).find(val =>
              typeof val === "string" && val.includes("@")
            );
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
        const e = Object.values(r).find(val =>
          typeof val === "string" && val.includes("@")
        );
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

    const uniqueEmails = [...new Set(emails)];

    if (!uniqueEmails.length) {
      await unlinkFile(filePath);
      return res.status(400).json({ error: "No valid emails found in file." });
    }

    // ---------- NEW OPTIMIZED PROCESSING ----------
    const results = [];
    const summary = {
      total: uniqueEmails.length,
      valid: 0,
      invalid: 0,
      risky: 0,
      disposable: 0,
      role_based: 0,
      catch_all: 0,
      greylisted: 0
    };

    const limit = pLimit(200); // Up to 50 concurrent validations

    const jobs = uniqueEmails.map(email => limit(async () => {
      try {
        // **ENABLED SMTP CHECK**
        const result = await verifier.verify(email, { smtpCheck: true });

        // Update summary
        summary[result.status]++;
        if (result.disposable) summary.disposable++;
        if (result.role_based) summary.role_based++;
        if (result.catch_all) summary.catch_all++;
        if (result.greylisted) summary.greylisted++;

        // Save to DB
        await prisma.verification.upsert({
          where: { email: result.email },
          update: result,
          create: result,
        });

        results.push(result);
      } catch (err) {
        summary.invalid++;
        results.push({
          email,
          status: "invalid",
          score: 0,
          syntax_valid: false,
          domain_valid: false,
          mailbox_exists: false,
          catch_all: false,
          disposable: false,
          role_based: false,
          greylisted: false,
          error: err.message
        });
      }
    }));

    await Promise.all(jobs);
    await unlinkFile(filePath);

    return res.json({
      ...summary,
      results: results.sort((a, b) => b.score - a.score)
    });

  } catch (err) {
    if (fs.existsSync(filePath)) await unlinkFile(filePath);
    return res.status(500).json({ error: "Bulk verification failed", details: err.message });
  }
});




// --------- 3. Health Check Endpoint ----------
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "7-layer-advanced",
    features: [
      "syntax_validation",
      "dns_mx_validation",
      "smtp_verification",
      "greylist_retry",
      "catch_all_detection",
      "disposable_detection",
      "role_based_detection"
    ]
  });
});

// --------- 4. Statistics Endpoint ----------
router.get("/stats", (req, res) => {
  const stats = verifier.getStats();
  res.json(stats);
});

export default router;