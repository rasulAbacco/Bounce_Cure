// server/routes/accounts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { runSync, sendEmailWithSendGrid, syncEmailsForAccount } from "../services/imapSync.js";
import nodemailer from "nodemailer";
import {
  getOAuth2AccessToken,
  getZohoAccessToken,
  getRediffAccessToken,
  getOutlookAccessToken,
  getYahooAccessToken,
} from "./accountsAuth.js";
import { protect } from "../middleware/authMiddleware.js"; // keep your middleware

const prisma = new PrismaClient();
const router = express.Router();

// Utility: safe async runner
const safeRun = (fn) => {
  Promise.resolve()
    .then(fn)
    .catch((err) => console.error("[accounts] ❌ Async error:", err));
};

// Basic ownership authorization middleware (your existing pattern)
async function authorizeAccountAccess(req, res, next) {
  const accountId = Number(req.params.id || req.query.accountId);
  if (isNaN(accountId)) return res.status(400).json({ error: "Invalid account ID" });
  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: "Account not found" });
    if (req.user.id !== account.userId) return res.status(403).json({ error: "Forbidden: You don't own this account" });
    req.account = account;
    next();
  } catch (err) {
    console.error("[accounts] ❌ Authorization error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ---------------- Send via SMTP ----------------
router.post("/send-via-smtp", protect, async (req, res) => {
  const { accountId, to, subject, text, html, inReplyTo, references } = req.body;

  console.log("📧 Send via SMTP request received");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!accountId) return res.status(400).json({ error: "accountId is required" });
  if (!to) return res.status(400).json({ error: "'to' field is required" });
  if (!subject) return res.status(400).json({ error: "subject is required" });
  if (!text && !html) return res.status(400).json({ error: "Either text or html is required" });

  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: parseInt(accountId, 10) } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    console.log(`[accounts] Sending as ${account.email}`);
    console.log(`Auth type: ${account.authType}`);

    let transporter;

    // ---- Password auth ----
    if (account.authType === "password") {
      console.log("🔐 Using password authentication");

      let transporterOptions = {
        host: account.smtpHost,
        port: account.smtpPort,
        secure: account.smtpPort === 465,
        auth: { user: account.smtpUser, pass: account.encryptedPass },
        logger: true,
        debug: true,
      };

      // Provider quirks (existing Rediff behavior retained)
      if (account.provider === "rediff") {
        const domain = account.email.split("@")[1];
        transporterOptions.name = domain;
        transporterOptions.tls = { rejectUnauthorized: false };
        transporterOptions.connectionTimeout = 10000;
        transporterOptions.greetingTimeout = 10000;
        transporterOptions.socketTimeout = 10000;
      }

      transporter = nodemailer.createTransport(transporterOptions);
    }
    // ---- OAuth auth ----
    else if (account.authType === "oauth") {
      console.log("🔐 Using OAuth2 authentication");

      // Zoho
      if (account.provider === "zoho") {
        const accessToken = await getZohoAccessToken(account.refreshToken, account.oauthClientId, account.oauthClientSecret);
        console.log("✅ Zoho access token obtained");
        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: { type: "OAuth2", user: account.smtpUser, accessToken },
          logger: true,
          debug: true,
        });
      }
      // Rediff
      else if (account.provider === "rediff") {
        const accessToken = await getRediffAccessToken(account.refreshToken, account.oauthClientId, account.oauthClientSecret);
        console.log("✅ Rediff access token obtained");
        const domain = account.email.split("@")[1];
        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: { type: "OAuth2", user: account.smtpUser, accessToken },
          name: domain,
          logger: true,
          debug: true,
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 10000,
        });
      }
      // Outlook (Microsoft)
      else if (account.provider === "outlook") {
        const accessToken = await getOutlookAccessToken(account.refreshToken, account.oauthClientId, account.oauthClientSecret);
        console.log("✅ Outlook access token obtained");
        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: { type: "OAuth2", user: account.smtpUser, accessToken },
          logger: true,
          debug: true,
        });
      }
      // Yahoo (NEW)
      else if (account.provider === "yahoo") {
        const accessToken = await getYahooAccessToken(account.refreshToken, account.oauthClientId, account.oauthClientSecret);
        console.log("✅ Yahoo access token obtained");
        transporter = nodemailer.createTransport({
          host: account.smtpHost || "smtp.mail.yahoo.com",
          port: account.smtpPort || 465,
          secure: (account.smtpPort || 465) === 465,
          auth: { type: "OAuth2", user: account.smtpUser, accessToken },
          logger: true,
          debug: true,
          tls: { rejectUnauthorized: false },
        });
      }
      // Default (Google / others that use getOAuth2AccessToken(account))
      else {
        const accessToken = await getOAuth2AccessToken(account);
        console.log("✅ Generic OAuth2 access token obtained");
        transporter = nodemailer.createTransport({
          host: account.smtpHost,
          port: account.smtpPort,
          secure: account.smtpPort === 465,
          auth: { type: "OAuth2", user: account.smtpUser, accessToken },
          logger: true,
          debug: true,
        });
      }
    } else {
      console.error("❌ Unsupported auth type:", account.authType);
      return res.status(400).json({ error: "Unsupported authentication type" });
    }

    // Build mailOptions
    const mailOptions = { from: account.email, to, subject, text, html };
    if (inReplyTo) mailOptions.inReplyTo = inReplyTo;
    if (references) mailOptions.references = references;

    console.log("📤 Sending email via transporter...");
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! MessageId: ${result.messageId}`);

    res.status(200).json({ success: true, message: "Email sent via SMTP", messageId: result.messageId });
  } catch (err) {
    // Helpful debugging info for "invalid credentials" cases
    console.error("❌ SMTP send error:", err);
    const details = err.response?.data || err.message || err.toString();
    res.status(500).json({ error: "Failed to send email via SMTP", details, status: "failed" });
  }
});

// ---------------- Get all accounts ----------------
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(accounts);
  } catch (err) {
    console.error("[accounts] ❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// ---------------- Get emails for an account ----------------
router.get("/emails", protect, async (req, res) => {
  const accountId = parseInt(req.query.accountId, 10);
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  if (!accountId) return res.status(400).json({ error: "Account ID is required" });

  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== req.user.id) return res.status(404).json({ error: "Account not found" });

    const emails = await prisma.email.findMany({ where: { accountId }, orderBy: { date: "desc" }, take: limit, skip: offset });
    res.json(emails);
  } catch (err) {
    console.error("[accounts] ❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// ---------------- Update an account (NOTE: allows customHost flag) ----------------
router.put("/:id", protect, authorizeAccountAccess, async (req, res) => {
  const {
    email,
    provider,
    imapHost,
    imapPort,
    imapUser,
    smtpHost,
    smtpPort,
    smtpUser,
    encryptedPass,
    oauthClientId,
    oauthClientSecret,
    refreshToken,
    authType,
    customHost, // NEW: flag from frontend to allow custom hostnames
  } = req.body;

  if (!email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) return res.status(400).json({ error: "App password is required" });
  if (authType === "oauth" && (!oauthClientId || !oauthClientSecret || !refreshToken)) return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });

  // Force OAuth for Outlook (keep your rule)
  if (provider === "outlook" && authType === "password") {
    return res.status(400).json({ error: "Outlook requires OAuth authentication (password auth deprecated)" });
  }

  try {
    const existing = await prisma.emailAccount.findFirst({ where: { email, id: { not: req.account.id } } });
    if (existing) return res.status(400).json({ error: `Account with email ${email} already exists` });

    // --- provider specific validation, but allow override with customHost flag ---
    if (!customHost) {
      if (provider === "amazon") {
        if (imapHost !== "imap.mail.us-east-1.awsapps.com") return res.status(400).json({ error: "Amazon WorkMail requires IMAP host imap.mail.us-east-1.awsapps.com" });
        if (imapPort !== 993) return res.status(400).json({ error: "Amazon WorkMail requires IMAP port 993" });
      }

      if (provider === "rediff") {
        if (imapHost !== "imap.rediffmailpro.com") return res.status(400).json({ error: "Rediff Mail Pro requires IMAP host imap.rediffmailpro.com" });
        if (imapPort !== 993) return res.status(400).json({ error: "Rediff Mail Pro requires IMAP port 993" });
        if (smtpHost !== "smtp.rediffmailpro.com") return res.status(400).json({ error: "Rediff Mail Pro requires SMTP host smtp.rediffmailpro.com" });
        if (smtpPort !== 465) return res.status(400).json({ error: "Rediff Mail Pro requires SMTP port 465" });
      }

      if (provider === "zoho") {
        const validHosts = ["imap.zoho.com", "imappro.zoho.in"];
        if (!validHosts.includes(imapHost))
          return res.status(400).json({ error: "Zoho requires IMAP host imap.zoho.com or imappro.zoho.in" });

        const validSmtp = ["smtp.zoho.com", "smtppro.zoho.in"];
        if (!validSmtp.includes(smtpHost))
          return res.status(400).json({ error: "Zoho requires SMTP host smtp.zoho.com or smtppro.zoho.in" });
      }


      if (provider === "outlook") {
        if (imapHost !== "outlook.office365.com" || smtpHost !== "smtp.office365.com") return res.status(400).json({ error: "Outlook requires IMAP host outlook.office365.com and SMTP host smtp.office365.com" });
      }
    } else {
      console.log("[accounts] customHost=true, skipping strict provider hostname checks for paid/custom domain");
    }

    const updatedAccount = await prisma.emailAccount.update({
      where: { id: req.account.id },
      data: {
        email,
        provider,
        imapHost,
        imapPort: parseInt(imapPort, 10),
        imapUser,
        smtpHost,
        smtpPort: parseInt(smtpPort, 10),
        smtpUser,
        encryptedPass,
        oauthClientId,
        oauthClientSecret,
        refreshToken,
        authType,
        userId,
      },
    });

    console.log(`[accounts] ✅ Account updated: ${updatedAccount.email}, starting sync.`);
    safeRun(() => syncEmailsForAccount(prisma, updatedAccount));
    res.status(200).json(updatedAccount);
  } catch (err) {
    console.error("❌ Error updating account:", err);
    if (err.code === "P2002") return res.status(400).json({ error: `Account with email ${email} already exists` });
    res.status(500).json({ error: "Failed to update account" });
  }
});

// ---------------- Create account (also supports customHost) ----------------
router.post("/", protect, async (req, res) => {
  const {
    email,
    provider,
    imapHost,
    imapPort,
    imapUser,
    smtpHost,
    smtpPort,
    smtpUser,
    encryptedPass,
    oauthClientId,
    oauthClientSecret,
    refreshToken,
    authType,
    customHost, // allow creating paid domain accounts
  } = req.body;

  if (!email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) return res.status(400).json({ error: "App password is required" });
  if (authType === "oauth" && (!oauthClientId || !oauthClientSecret || !refreshToken)) return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });

  if (provider === "outlook" && authType === "password") return res.status(400).json({ error: "Outlook requires OAuth authentication (password auth deprecated)" });

  try {
    const exists = await prisma.emailAccount.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: `Account with email ${email} already exists` });

    if (!customHost) {
      // same provider checks as update
      if (provider === "amazon") {
        if (imapHost !== "imap.mail.us-east-1.awsapps.com") return res.status(400).json({ error: "Amazon WorkMail requires IMAP host imap.mail.us-east-1.awsapps.com" });
      }
      if (provider === "rediff") {
        if (imapHost !== "imap.rediffmailpro.com") return res.status(400).json({ error: "Rediff Mail Pro requires IMAP host imap.rediffmailpro.com" });
      }
      if (provider === "zoho") {
        const validHosts = ["imap.zoho.com", "imappro.zoho.in"];
        if (!validHosts.includes(imapHost))
          return res.status(400).json({ error: "Zoho requires IMAP host imap.zoho.com or imappro.zoho.in" });

        const validSmtp = ["smtp.zoho.com", "smtppro.zoho.in"];
        if (!validSmtp.includes(smtpHost))
          return res.status(400).json({ error: "Zoho requires SMTP host smtp.zoho.com or smtppro.zoho.in" });
      }

      if (provider === "outlook") {
        if (imapHost !== "outlook.office365.com" || smtpHost !== "smtp.office365.com") return res.status(400).json({ error: "Outlook requires IMAP host outlook.office365.com and SMTP host smtp.office365.com" });
      }
    } else {
      console.log("[accounts] customHost=true at create, skipping strict checks");
    }

    const newAccount = await prisma.emailAccount.create({
      data: {
        userId: req.user.id,
        email,
        provider,
        imapHost,
        imapPort: parseInt(imapPort, 10),
        imapUser,
        smtpHost,
        smtpPort: parseInt(smtpPort, 10),
        smtpUser,
        encryptedPass,
        oauthClientId,
        oauthClientSecret,
        refreshToken,
        authType,
      },
    });

    console.log(`[accounts] ✅ Created account ${newAccount.email}, starting initial sync.`);
    safeRun(() => syncEmailsForAccount(prisma, newAccount));
    res.status(201).json(newAccount);
  } catch (err) {
    console.error("[accounts] ❌ Error creating account:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// ---------------- Delete an account ----------------
router.delete("/:id", protect, authorizeAccountAccess, async (req, res) => {
  try {
    await prisma.email.deleteMany({ where: { accountId: req.account.id } });
    await prisma.emailAccount.delete({ where: { id: req.account.id } });
    res.status(200).json({ message: "Account and emails deleted" });
  } catch (err) {
    console.error("[accounts] ❌ Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;