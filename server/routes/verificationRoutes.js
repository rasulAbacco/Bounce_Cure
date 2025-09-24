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

  console.log(`[/verify-single] Email=${email}, smtpCheck=${smtpCheck}`);

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const result = await verifier.verify(email, { smtpCheck: Boolean(smtpCheck) });
    console.log(`[/verify-single] Result:`, result);

    // Add detailed logging for debugging
    console.log("[DEBUG] Full result details:", JSON.stringify(result, null, 2));

    try {
      await prisma.verification.upsert({
        where: { email: result.email },
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
          mx: result.mx || [],
          error: result.error || null
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
          mx: result.mx || [],
          error: result.error || null
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

  console.log(`[/verify-bulk] Received ${emails?.length || 0} emails, smtpCheck=${smtpCheck}`);

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    console.log("[/verify-bulk] Invalid emails input");
    return res.status(400).json({ error: "Emails array is required" });
  }

  try {
    // Split emails into chunks of 500 max (mails.so limit)
    const chunkSize = 500;
    const emailChunks = [];
    for (let i = 0; i < emails.length; i += chunkSize) {
      emailChunks.push(emails.slice(i, i + chunkSize));
    }
    console.log(`[/verify-bulk] Split into ${emailChunks.length} chunk(s)`);

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
      console.log(`[/verify-bulk] Processing chunk ${i + 1}/${emailChunks.length} with ${emailChunks[i].length} emails`);

      const startTime = Date.now();
      const batchId = await verifier.createBatchWithMailsSo(emailChunks[i]);
      console.log(`[/verify-bulk] Created batch ${batchId} for chunk ${i + 1}`);

      const batchResults = await verifier.waitForBatchCompletion(batchId);
      console.log(`[/verify-bulk] Batch ${batchId} completed in ${(Date.now() - startTime) / 1000}s with ${batchResults.length} results`);

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

    console.log(`[/verify-bulk] Total emails processed: ${allResults.length}`);

    // Save batch in DB
    const batch = await prisma.verificationBatch.create({
      data: {
        source: "bulk",
        name: "Manual Bulk Upload",
        includeOnlyValid: false,
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
            };
          }),
        },
      },
      include: { results: false },
    });

    console.log(`[/verify-bulk] Batch saved with id: ${batch.id}`);

    return res.json({ batchId: batch.id, summary: totalSummary, results: allResults });
  } catch (err) {
    console.error("[/verify-bulk] ERROR", err);
    return res.status(500).json({ error: "Bulk verification failed", details: err.message });
  }
});



// ------ Manual paste verify ------

router.post("/verify-manual", async (req, res) => {
  const { text, includeOnlyValid = false, maxRich = false, name = "manual_paste" } = req.body || {};
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

    // Chunk emails
    const chunks = [];
    for (let i = 0; i < filtered.length; i += CHUNK_SIZE) {
      chunks.push(filtered.slice(i, i + CHUNK_SIZE));
    }

    let results = [];
    let summary = { total: filtered.length, valid: 0, invalid: 0, risky: 0 };

    // Function to verify a single email with concurrency limit
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

    // Process each chunk sequentially (to avoid overwhelming), emails inside chunk in parallel
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(chunk.map(email => verifyEmail(email)));
      // Filter out nulls (emails excluded due to includeOnlyValid)
      const filteredResults = chunkResults.filter(r => r !== null);

      // Aggregate results
      filteredResults.forEach(r => {
        results.push(r);
        summary[r.status] = (summary[r.status] || 0) + 1;
      });
    }

    // Save batch
    const batch = await prisma.verificationBatch.create({
      data: {
        source: "manual",
        name,
        includeOnlyValid,
        total: summary.total,
        validCount: summary.valid,
        invalidCount: summary.invalid,
        riskyCount: summary.risky,
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
  const { source } = req.query;
  try {
    const where = source ? { source } : {};
    const batches = await prisma.verificationBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { results: true }
    });
    return res.json({ batches });
  } catch (err) {
    console.error("[/batches] ERROR", err);
    return res.status(500).json({ error: "Failed to load batches" });
  }
});

// Get results for a specific batch
router.get("/batches/:id/results", async (req, res) => {
  const batchId = parseInt(req.params.id, 10);
  try {
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