// routes/verifiFrontend.js
import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import AdvancedVerifier from "./advancedVerification.js";

const router = express.Router();
const prisma = new PrismaClient();

const SENDGRID_API = "https://api.sendgrid.com/v3/validations/email";
const API_KEY = process.env.SENDGRID_API_KEY;

const verifier = new AdvancedVerifier({
  dnsTimeout: 2000,
  smtpTimeout: 5000,
  retryGreylist: 1,
  cacheTtlMs: 30 * 60 * 1000,
  sgConcurrency: 200,
});

// ===================================================
// FRONTEND EMAIL VERIFICATION with 24h limit (5/day)
// ===================================================
router.post("/verify-single-limit", async (req, res) => {
  const { email } = req.body || {};
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    "unknown";

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 🔹 1️⃣ Count how many verifications done in past 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentCount = await prisma.frontendVerification.count({
      where: {
        ip,
        createdAt: { gte: since }, // only last 24h
        source: { in: ["frontend-sendgrid", "frontend-fallback"] },
      },
    });

    console.log(
      `🧮 IP ${ip} has ${recentCount} verifications in last 24h (limit = 5)`
    );

    // 🔸 2️⃣ Block only if already reached 5
    if (recentCount >= 5) {
      return res.status(429).json({
        success: false,
        error:
          "Daily limit reached — only 5 verifications per 24 hours allowed.",
      });
    }

    // 🔹 3️⃣ Try SendGrid first
    let sgData = null;
    try {
      const sgRes = await axios.post(
        SENDGRID_API,
        { email },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      sgData = sgRes.data?.result;
    } catch (sgErr) {
      console.error("⚠️ SendGrid failed — using fallback:");
      console.error(sgErr.response?.data || sgErr.message);
    }

    let finalResult;
    let source = "frontend-sendgrid";

    if (sgData) {
      finalResult = {
        email: sgData?.email ?? email,
        status: sgData?.verdict?.toLowerCase() ?? "unknown",
        score: sgData?.score ?? null,
        reason: sgData?.verdict ?? "Unknown",
        checks: sgData?.checks ?? {},
      };
    } else {
      // fallback verification
      source = "frontend-fallback";
      const v = await verifier.verify(email, { smtpCheck: true });
      finalResult = {
        email: v.email ?? email,
        status: v.status ?? "unknown",
        score: null,
        reason: v.reason ?? "Local verifier",
        checks: {},
      };
    }

    // 🔹 4️⃣ Save verification result
    await prisma.frontendVerification.create({
      data: {
        email: finalResult.email,
        status: finalResult.status,
        score: finalResult.score,
        syntax_valid: true,
        domain_valid: true,
        mailbox_exists: true,
        catch_all: false,
        disposable: false,
        role_based: false,
        greylisted: false,
        free_provider: false,
        provider: null,
        mx: [],
        error: null,
        ip,
        source,
      },
    });

    // 🔹 5️⃣ Recount after saving to get accurate remaining
    const updatedCount = await prisma.frontendVerification.count({
      where: {
        ip,
        createdAt: { gte: since },
        source: { in: ["frontend-sendgrid", "frontend-fallback"] },
      },
    });

    console.log(
      `✅ After insert: IP ${ip} total verifications in last 24h = ${updatedCount}`
    );

    // 🔹 6️⃣ Respond with proper remaining value
    res.json({
      success: true,
      result: finalResult,
      remaining: Math.max(5 - updatedCount, 0),
    });
  } catch (err) {
    console.error("🔴 verify-single-limit error (FULL):", err);
    res.status(500).json({
      success: false,
      error: "Verification failed",
      details: err.response?.data || err.message,
    });
  }
});

export default router;
