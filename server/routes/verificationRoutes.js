
//verificationRoutes.js
import express from "express";
import AdvancedVerifier from "./advancedVerification.js";
import multer from "multer";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import pLimit from "p-limit";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const verifier = new AdvancedVerifier({
  dnsTimeout: 2000,
  smtpTimeout: 5000,
  retryGreylist: 1,
  cacheTtlMs: 30 * 60 * 1000,
  sgConcurrency: 200
});

const unlinkFile = promisify(fs.unlink);
const upload = multer({ dest: "uploads/" });

// Helper functions remain unchanged
function isExampleOrFakeEmail(email) { /* ... */ }
function firstEmailInObject(row) { /* ... */ }

// ------ Single verify ------
router.post("/verify-single", async (req, res) => {
  const { email } = req.body || {};
  const smtpCheck = (req.body?.smtpCheck ?? req.query?.smtpCheck ?? false) === true;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const userId = req.user?.id; // 👈 Get user ID from token
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await verifier.verify(email, { smtpCheck: Boolean(smtpCheck) });

    console.log("[/verify-single] Verification result:", JSON.stringify(result, null, 2)); // ✅ Log full result

    try {
      await prisma.verification.upsert({
        where: {
          userId_email: {
            userId: req.user.id,
            email: result.email
          }
        },
        update: {
          status: result.status,
          score: result.score ?? 0,
          syntax_valid: result.syntax_valid ?? false,
          domain_valid: result.domain_valid ?? false,
          mailbox_exists: result.mailbox_exists ?? false,
          catch_all: result.catch_all ?? false,
          disposable: result.disposable ?? false,
          role_based: result.role_based ?? false,
          greylisted: result.greylisted ?? false,
          mx: Array.isArray(result.mx) ? result.mx : [result.mx],
          error: result.error || null,
          userId
        },
        create: {
          email: result.email,
          status: result.status,
          score: result.score ?? 0,
          syntax_valid: result.syntax_valid ?? false,
          domain_valid: result.domain_valid ?? false,
          mailbox_exists: result.mailbox_exists ?? false,
          catch_all: result.catch_all ?? false,
          disposable: result.disposable ?? false,
          role_based: result.role_based ?? false,
          greylisted: result.greylisted ?? false,
          mx: Array.isArray(result.mx) ? result.mx : [result.mx],
          error: result.error || null,
          userId
        }
      });
    } catch (dbErr) {
      console.error("[DB] Upsert error (verification):", dbErr.message);
    }

    return res.json(result);
  } catch (err) {
    console.error("[/verify-single] ERROR:", err);
    return res.status(500).json({ error: "Verification error", details: err.message });
  }

});


// ------ Bulk verify ------

router.post("/verify-bulk", async (req, res) => {
  const { emails } = req.body || {};
  const smtpCheck = (req.body?.smtpCheck ?? req.query?.smtpCheck ?? false) === true;

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  console.log(`[/verify-bulk] Received ${emails?.length || 0} emails, smtpCheck=${smtpCheck}`);

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: "Emails array is required" });
  }

  try {
    const chunkSize = 500;
    const emailChunks = [];
    for (let i = 0; i < emails.length; i += chunkSize) {
      emailChunks.push(emails.slice(i, i + chunkSize));
    }

    const allResults = [];
    let totalSummary = {
      total: emails.length,
      validCount: 0,
      invalidCount: 0,
      riskyCount: 0,
      disposable: 0,
      role_based: 0,
      catch_all: 0,
      greylisted: 0,
    };

    for (let i = 0; i < emailChunks.length; i++) {
      const batchId = await verifier.createBatchWithMailsSo(emailChunks[i]);
      const batchResults = await verifier.waitForBatchCompletion(batchId);

      batchResults.forEach((r) => {
        allResults.push(r);

        if (r.status === "valid") totalSummary.validCount++;
        else if (r.status === "invalid") totalSummary.invalidCount++;
        else totalSummary.riskyCount++;

        if (r.disposable) totalSummary.disposable++;
        if (r.role_based) totalSummary.role_based++;
        if (r.catch_all) totalSummary.catch_all++;
        if (r.greylisted) totalSummary.greylisted++;
      });
    }

    // ✅ Save batch in DB with userId
    const batch = await prisma.verificationBatch.create({
      data: {
        source: "bulk",
        name: "Manual Bulk Upload",
        includeOnlyValid: false,
        userId, // ✅ associate batch with user
        total: totalSummary.total,
        validCount: totalSummary.validCount,
        invalidCount: totalSummary.invalidCount,
        riskyCount: totalSummary.riskyCount,
        results: {
          create: allResults.map((r) => {
            let mxValue = r.mx;

            if (Array.isArray(mxValue)) {
              mxValue = mxValue.length > 0 ? mxValue[0] : null;
            } else if (typeof mxValue !== "string" && mxValue !== null) {
              mxValue = null;
            }

            return {
              email: r.email,
              status: r.status || "unknown",
              score: r.score ?? 0,
              syntax_valid: r.syntax_valid ?? false,
              domain_valid: r.domain_valid ?? false,
              mailbox_exists: r.mailbox_exists ?? false,
              catch_all: r.catch_all ?? false,
              disposable: r.disposable ?? false,
              role_based: r.role_based ?? false,
              greylisted: r.greylisted ?? false,
              free_provider: r.free_provider ?? null,
              provider: r.provider ?? null,
              mx: mxValue,
              error: r.error || null,
              userId, // ✅ associate each result with user
            };
          }),
        },
      },
      include: { results: false },
    });

    return res.json({ batchId: batch.id, summary: totalSummary, results: allResults });
  } catch (err) {
    console.error("[/verify-bulk] ERROR", err);
    return res.status(500).json({ error: "Bulk verification failed", details: err.message });
  }
});




// ------ Manual paste verify ------

router.post("/verify-manual", async (req, res) => {
  const { text, includeOnlyValid = false, maxRich = false, name = "manual_paste" } = req.body || {};
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const emails = text
      .split(/\s|,|;/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e));

    const unique = [...new Set(emails)].filter(Boolean);
    const filtered = unique.filter(e => !isExampleOrFakeEmail(e));

    if (!filtered.length) {
      return res.status(400).json({ error: "No valid (non-fake) emails found." });
    }

    const CHUNK_SIZE = 500;
    const CONCURRENCY_LIMIT = 40;
    const limit = pLimit(CONCURRENCY_LIMIT);

    const chunks = [];
    for (let i = 0; i < filtered.length; i += CHUNK_SIZE) {
      chunks.push(filtered.slice(i, i + CHUNK_SIZE));
    }

    let results = [];
    let summary = { total: filtered.length, valid: 0, invalid: 0, risky: 0 };

    const verifyEmail = (email) =>
      limit(async () => {
        try {
          const r = await verifier.verify(email, { smtpCheck: true, maxRich });
          if (includeOnlyValid && r.status !== "valid") return null;
          return r;
        } catch (err) {
          console.error("[manual verify] SMTP error for", email, err.message);
          return { email, status: "invalid", score: 0, error: err.message };
        }
      });

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(email => verifyEmail(email)));
      const filteredResults = chunkResults.filter(r => r !== null);

      filteredResults.forEach(r => {
        results.push(r);
        summary[r.status] = (summary[r.status] || 0) + 1;
      });
    }

    // ✅ Save the batch with userId
    const batch = await prisma.verificationBatch.create({
      data: {
        source: "manual",
        name,
        includeOnlyValid,
        total: summary.total,
        validCount: summary.valid,
        invalidCount: summary.invalid,
        riskyCount: summary.risky,
        userId, // ✅ Attach userId here
        results: {
          create: results.map(r => {
            let mxValue = r.mx;
            if (Array.isArray(mxValue)) {
              mxValue = mxValue.length > 0 ? mxValue[0] : null;
            } else if (typeof mxValue !== 'string' && mxValue !== null) {
              mxValue = null;
            }

            return {
              email: r.email,
              status: r.status || "unknown",
              score: r.score ?? 0,
              syntax_valid: r.syntax_valid ?? false,
              domain_valid: r.domain_valid ?? false,
              mailbox_exists: r.mailbox_exists ?? false,
              catch_all: r.catch_all ?? false,
              disposable: r.disposable ?? false,
              role_based: r.role_based ?? false,
              greylisted: r.greylisted ?? false,
              mx: mxValue,
              error: r.error || null,
              userId // ✅ Also associate each result with user
            };
          }),
        },
      },
      include: { results: false },
    });

    return res.json({
      batchId: batch.id,
      summary: {
        total: summary.total,
        validCount: summary.valid,
        invalidCount: summary.invalid,
        riskyCount: summary.risky,
      },
      results,
    });
  } catch (err) {
    console.error("[/verify-manual] ERROR", err);
    return res.status(500).json({ error: "Manual verification failed", details: err.message });
  }
});



// Get recent batches
router.get("/batches", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { source } = req.query;

  const where = source ? { source, userId } : { userId };

  try {
    const batches = await prisma.verificationBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { results: false } // or true, depending on your UI
    });
    return res.json({ batches });
  } catch (err) {
    console.error("[/batches] ERROR", err);
    return res.status(500).json({ error: "Failed to load batches" });
  }
});


// Get results for a specific batch
router.get("/batches/:id/results", async (req, res) => {
  const userId = req.user?.id;
  const batchId = parseInt(req.params.id, 10);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    // ✅ First, check that batch belongs to the current user
    const batch = await prisma.verificationBatch.findFirst({
      where: { id: batchId, userId },
    });

    if (!batch) {
      return res.status(403).json({ error: "You do not have access to this batch" });
    }

    const results = await prisma.batchResult.findMany({
      where: { batchId },
      orderBy: { createdAt: "asc" }
    });

    return res.json({ results });
  } catch (err) {
    console.error("[/batches/:id/results] ERROR", err);
    return res.status(500).json({ error: "Failed to load results" });
  }
});


export default router;