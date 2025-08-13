// verificationRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import XLSX from "xlsx";
import Papa from "papaparse";
import EmailValidator from "email-deep-validator";
import { PrismaClient } from "@prisma/client"; // ✅ Import Prisma

const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });
const validator = new EmailValidator({
  verifyMailbox: true,
  timeout: 7000,
});

// Save to DB
async function saveVerification(email, status) {
  try {
    await prisma.verification.create({
      data: { email, status },
    });
  } catch (err) {
    console.error(`Error saving ${email}:`, err.message);
  }
}

// Determine email status
function determineStatus({ wellFormed, validDomain, validMailbox }) {
  if (validMailbox) return "valid";
  if (wellFormed && validDomain) return "risky";
  return "invalid";
}

// ✅ Single Email Verify
router.post("/verify-single", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const validationResult = await validator.verify(email);
    const status = determineStatus(validationResult);

    await saveVerification(email, status); // ✅ Save to DB

    res.json({ email, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: Extract emails from file
function extractEmails(filePath, fileName) {
  const ext = fileName.toLowerCase();

  if (ext.endsWith(".csv")) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = Papa.parse(fileContent, { header: true });
    return parsed.data.map(row => row.Email || row.email || row.EMail).filter(Boolean);
  }
  if (ext.endsWith(".xlsx")) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    return jsonData.map(row => row.Email || row.email || row.EMail).filter(Boolean);
  }
  if (ext.endsWith(".txt")) {
    return fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map(e => e.trim())
      .filter(Boolean);
  }
  throw new Error("Unsupported file type");
}

// ✅ Bulk Email Verify
router.post("/verify-bulk", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File required" });

  const filePath = req.file.path;

  try {
    const emails = extractEmails(filePath, req.file.originalname);
    fs.unlinkSync(filePath); // cleanup

    if (!emails.length) {
      return res.status(400).json({ error: "No valid emails found in file" });
    }

    const results = await Promise.all(
      emails.map(async email => {
        try {
          const validationResult = await validator.verify(email);
          const status = determineStatus(validationResult);
          await saveVerification(email, status); // ✅ Save each to DB
          return { email, status };
        } catch {
          return { email, status: "invalid" };
        }
      })
    );

    res.json({ results });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: err.message });
  }
});

export default router;
