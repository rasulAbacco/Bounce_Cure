// routes/emailAccounts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { runSync, sendEmailWithSendGrid, syncEmailsForAccount } from "../services/imapSync.js";

const prisma = new PrismaClient();
const router = express.Router();

// Utility: safe async runner
const safeRun = (fn) => fn.catch((err) => console.error("❌ Async error:", err.message));

/**
 * Add a new email account
 */
router.post("/", async (req, res) => {
  const {
    userId,
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
  } = req.body;

  if (!userId || !email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (!encryptedPass && provider !== "outlook" && (!oauthClientId || !oauthClientSecret || !refreshToken)) {
    return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });
  }

  try {
    const account = await prisma.emailAccount.create({
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
        user: {
          connectOrCreate: {
            where: { id: parseInt(userId, 10) },
            create: {
              email: `user${userId}@example.com`,
              firstName: "Default",
              lastName: "User",
              password: "defaultpassword",
            },
          },
        },
      },
    });

    safeRun(syncEmailsForAccount(prisma, account));
    res.status(201).json(account);
  } catch (err) {
    console.error("❌ Error creating account:", err);
    if (err.code === "P2003") return res.status(400).json({ error: "Invalid userId" });
    res.status(500).json({ error: "Failed to create account" });
  }
});

/**
 * Get all accounts
 */
router.get("/", async (_req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({ orderBy: { createdAt: "desc" }, include: { user: true } });
    res.json(accounts);
  } catch (err) {
    console.error("❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

/**
 * Get emails for an account
 */
router.get("/emails", async (req, res) => {
  const accountId = parseInt(req.query.accountId, 10);
  if (!accountId) return res.status(400).json({ error: "Account ID is required" });

  try {
    const emails = await prisma.email.findMany({ where: { accountId }, orderBy: { date: "desc" } });
    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

/**
 * Trigger sync for one account
 */
router.post("/sync/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    safeRun(syncEmailsForAccount(prisma, account));
    res.status(200).json({ message: "Sync started" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

/**
 * Trigger sync for all accounts
 */
router.post("/sync", async (_req, res) => {
  try {
    safeRun(runSync(prisma));
    res.status(200).json({ message: "Sync started for all accounts" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

/**
 * Send email via SendGrid
 * POST body: { to, subject, text, html }
 */
router.post("/send", async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) return res.status(400).json({ error: "to, subject, text/html are required" });

  try {
    const sent = await sendEmailWithSendGrid({ to, subject, text, html });
    res.status(sent ? 200 : 500).json({ message: sent ? "Email sent via SendGrid" : "Failed to send email" });
  } catch (err) {
    console.error("❌ SendGrid error:", err);
    res.status(500).json({ error: "Failed to send email via SendGrid" });
  }
});

/**
 * Update an account
 */
router.put("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  const { email, provider, imapHost, imapPort, imapUser, smtpHost, smtpPort, smtpUser, encryptedPass, oauthClientId, oauthClientSecret, refreshToken } = req.body;

  if (!email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  try {
    const updatedAccount = await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        email, provider, imapHost, imapPort: parseInt(imapPort, 10), imapUser,
        smtpHost, smtpPort: parseInt(smtpPort, 10), smtpUser, encryptedPass,
        oauthClientId, oauthClientSecret, refreshToken
      },
    });

    safeRun(syncEmailsForAccount(prisma, updatedAccount));
    res.status(200).json(updatedAccount);
  } catch (err) {
    console.error("❌ Error updating account:", err);
    res.status(500).json({ error: "Failed to update account" });
  }
});

/**
 * Delete an account
 */
router.delete("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id, 10);
  try {
    await prisma.email.deleteMany({ where: { accountId } });
    await prisma.emailAccount.delete({ where: { id: accountId } });
    res.status(200).json({ message: "Account and emails deleted" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
