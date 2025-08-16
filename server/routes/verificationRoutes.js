// server/routes/verificationRoutes.js
import express from "express";
import AdvancedVerifier from "./advancedVerification.js";
import multer from "multer";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const router = express.Router();
const verifier = new AdvancedVerifier({ 
  maxRetries: 5,
  dnsTimeout: 5000,
  smtpTimeout: 8000,
  concurrency: 3
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
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Verification error", details: err.message });
  }
});

// --------- 2. Bulk Verify ----------
router.post("/verify-bulk", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  const ext = path.extname(req.file?.originalname || "").toLowerCase();

  if (!filePath || !req.file) {
    return res.status(400).json({ error: "File is required" });
  }

  const emails = [];

  try {
    // ---- Parse CSV ----
    if (ext === ".csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            const e = row.email || row.Email || row.EMAIL || row.eMail || 
                     row.E_Mail || row["Email Address"] || row["email_address"] ||
                     row.mail || row.Mail || row.MAIL;
            if (e && typeof e === 'string' && e.trim()) {
              emails.push(e.trim().toLowerCase());
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });

    // ---- Parse XLSX ----
    } else if (ext === ".xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      rows.forEach((r) => {
        const e = r.email || r.Email || r.EMAIL || r.eMail || 
                 r.E_Mail || r["Email Address"] || r["email_address"] ||
                 r.mail || r.Mail || r.MAIL;
        if (e && typeof e === 'string' && e.trim()) {
          emails.push(e.trim().toLowerCase());
        }
      });

    // ---- Parse TXT ----
    } else if (ext === ".txt") {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split(/\r?\n/);
      lines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine && cleanLine.includes('@')) {
          const emailMatch = cleanLine.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            emails.push(emailMatch[0].toLowerCase());
          }
        }
      });

    // ---- Unsupported ----
    } else {
      await unlinkFile(filePath);
      return res.status(400).json({
        error: "Unsupported file type. Only CSV, XLSX, or TXT are allowed.",
      });
    }

    const uniqueEmails = [...new Set(emails)];

    if (!uniqueEmails.length) {
      await unlinkFile(filePath);
      return res.status(400).json({ error: "No valid emails found in file." });
    }

    const BATCH_SIZE = 5;
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

    for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
      const batch = uniqueEmails.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (email) => {
        try {
          const result = await verifier.verify(email);
          
          if (result.status === 'valid') summary.valid++;
          else if (result.status === 'invalid') summary.invalid++;
          else if (result.status === 'risky') summary.risky++;
          
          if (result.disposable) summary.disposable++;
          if (result.role_based) summary.role_based++;
          if (result.catch_all) summary.catch_all++;
          if (result.greylisted) summary.greylisted++;

          return result;
        } catch (error) {
          summary.invalid++;
          return {
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
            error: error.message
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          summary.invalid++;
          results.push({
            email: "unknown",
            status: "invalid",
            score: 0,
            syntax_valid: false,
            domain_valid: false,
            mailbox_exists: false,
            catch_all: false,
            disposable: false,
            role_based: false,
            greylisted: false,
            error: "Processing failed"
          });
        }
      }

      if (i + BATCH_SIZE < uniqueEmails.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await unlinkFile(filePath);

    return res.json({
      ...summary,
      results: results.sort((a, b) => b.score - a.score)
    });

  } catch (err) {
    if (fs.existsSync(filePath)) await unlinkFile(filePath);
    res.status(500).json({ 
      error: "Bulk verification failed", 
      details: err.message 
    });
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
