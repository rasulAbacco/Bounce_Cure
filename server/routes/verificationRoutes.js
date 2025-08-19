import express from "express";
import AdvancedVerifier from "./advancedVerification.js";
import multer from "multer";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { prisma } from "../prisma/prismaClient.js";
import { sendTestEmail } from "../utils/emailVerify.js";

const router = express.Router();
const verifier = new AdvancedVerifier({ dnsTimeout:5000, smtpTimeout:8000, retryGreylist:1 });
const unlinkFile = promisify(fs.unlink);
const upload = multer({ dest:"uploads/" });

// --- Single verification ---
router.post("/verify-single", async (req,res)=>{
  const { email } = req.body;
  if(!email) return res.status(400).json({ error:"Email is required" });

  try {
    const result = await verifier.verify(email);
    const saved = await prisma.verification.create({ data:{ ...result, bounced:false } });

    // send email async for final confirmation
    sendTestEmail(saved.email).catch(console.error);

    res.json(saved);
  } catch(err){
    console.error("VERIFY ERROR:",err);
    res.status(500).json({ error:"Verification error", details: err.message });
  }
});

// --- Bulk verification ---
router.post("/verify-bulk", upload.single("file"), async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ error: "file needed" });

  const ext = path.extname(req.file.originalname).toLowerCase();
  const emails = [];

  try {
    if (ext === ".csv") {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on("data", (row) => {
            const e = row.email || row.Email || row.mail;
            if (e) emails.push(e.trim().toLowerCase());
          })
          .on("end", resolve)
          .on("error", reject);
      });
    } else if (ext === ".xlsx") {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      XLSX.utils.sheet_to_json(sheet).forEach((r) => {
        const e = r.email || r.Email;
        if (e) emails.push(e.trim().toLowerCase());
      });
    }

    const unique = [...new Set(emails)];
    const results = [];
    const summary = {
      total: unique.length,
      valid: 0,
      invalid: 0,
      risky: 0,
      disposable: 0,
      role_based: 0,
      catch_all: 0,
    };

    for (const em of unique) {
      try {
        const r = await verifier.verify(em);
        const rec = await prisma.verification.create({ data: { ...r, bounced: false } });
        sendTestEmail(rec.email).catch(console.error);

        results.push(rec);

        // update summary counts
        if (r.status === "valid") summary.valid++;
        else if (r.status === "risky") summary.risky++;
        else summary.invalid++;

        if (r.disposable) summary.disposable++;
        if (r.role_based) summary.role_based++;
        if (r.catch_all) summary.catch_all++;
      } catch {
        summary.invalid++;
      }
    }

    await unlinkFile(filePath);
    res.json({ results, ...summary });
  } catch (err) {
    if (fs.existsSync(filePath)) await unlinkFile(filePath);
    console.error("BULK VERIFY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- History ---
router.get("/history", async(req,res)=>{
  try {
    const all = await prisma.verification.findMany({ orderBy:{id:"desc"} });
    res.json(all);
  } catch(err){
    console.error("HISTORY ERROR:",err);
    res.status(500).json({ error:"History fetch failed" });
  }
});

// --- Health check ---
router.get("/health",(req,res)=>res.json({ status:"ok" }));

export default router;
