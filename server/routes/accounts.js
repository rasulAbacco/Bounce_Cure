// server/routes/accounts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { runSync, sendEmailWithSendGrid, syncEmailsForAccount } from "../services/imapSync.js";
import { protect } from "../middleware/authMiddleware.js"; // example auth middleware

const prisma = new PrismaClient();
const router = express.Router();

// Utility: safe async runner
const safeRun = (fn) => {
  Promise.resolve()
    .then(fn)
    .catch((err) => console.error("[accounts] ❌ Async error:", err));
};

// Basic ownership authorization middleware
async function authorizeAccountAccess(req, res, next) {
  const accountId = Number(req.params.id || req.query.accountId);
  if (isNaN(accountId)) return res.status(400).json({ error: "Invalid account ID" });

  try {
    const account = await prisma.emailAccount.findUnique({ where: { id: accountId } });
    if (!account) return res.status(404).json({ error: "Account not found" });

    // Check ownership
    if (req.user.id !== account.userId) {
      return res.status(403).json({ error: "Forbidden: You don't own this account" });
    }

    // Attach account for later use if needed
    req.account = account;
    next();
  } catch (err) {
    console.error("[accounts] ❌ Authorization error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Add a new email account
 */
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
  } = req.body;

  const userId = req.user.id; // use authenticated userId

  if (
    !userId ||
    !email ||
    !provider ||
    !imapHost ||
    !imapPort ||
    !imapUser ||
    !smtpHost ||
    !smtpPort ||
    !smtpUser
  ) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) {
    return res.status(400).json({ error: "App password is required" });
  }

  if (
    authType === "oauth" &&
    (!oauthClientId || !oauthClientSecret || !refreshToken)
  ) {
    return res
      .status(400)
      .json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });
  }

  try {
    // Use findFirst to check email uniqueness
    const existing = await prisma.emailAccount.findFirst({
      where: { email },
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: `Account with email ${email} already exists` });
    }

    const account = await prisma.emailAccount.create({
      data: {
        userId, // link to user
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

    console.log(`[accounts] ✅ Account created: ${account.email}, starting sync...`);
    safeRun(() => syncEmailsForAccount(prisma, account));

    res.status(201).json(account);
  } catch (err) {
    console.error("[accounts] ❌ Error creating account:", err);

    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ error: `Account with email ${email} already exists` });
    }

    if (err.code === "P2003") {
      return res.status(400).json({ error: "Invalid userId" });
    }

    res.status(500).json({ error: "Failed to create account" });
  }
});

/**
 * Get all accounts for authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      where: { userId: req.user.id }, // only own accounts
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(accounts);
  } catch (err) {
    console.error("[accounts] ❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

/**
 * Get emails for an account with pagination
 */
router.get("/emails", protect, authorizeAccountAccess, async (req, res) => {
  const accountId = req.account.id;

  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const emails = await prisma.email.findMany({
      where: { accountId },
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
    });
    res.json(emails);
  } catch (err) {
    console.error("[accounts] ❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

/**
 * Trigger sync for one account
 */
router.post("/sync/:id", protect, authorizeAccountAccess, async (req, res) => {
  const account = req.account;

  try {
    console.log(`[accounts] 🔄 Manual sync requested for ${account.email}`);
    safeRun(() => syncEmailsForAccount(prisma, account));

    res.status(200).json({ message: "Sync started" });
  } catch (err) {
    console.error("[accounts] ❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

/**
 * Trigger sync for all accounts of the user
 */
router.post("/sync", protect, async (req, res) => {
  try {
    console.log(`[accounts] 🔄 Manual sync requested for ALL accounts of user ${req.user.id}`);
    safeRun(() => runSync(prisma, { userId: req.user.id }));
    res.status(200).json({ message: "Sync started for all accounts" });
  } catch (err) {
    console.error("[accounts] ❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

/**
 * Send email via SendGrid
 */
router.post("/send", protect, async (req, res) => {
  const { to, subject, text, html } = req.body;
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "to, subject, text/html are required" });
  }

  try {
    const sent = await sendEmailWithSendGrid({ to, subject, text, html });
    res.status(sent ? 200 : 500).json({ message: sent ? "Email sent via SendGrid" : "Failed to send email" });
  } catch (err) {
    console.error("[accounts] ❌ SendGrid error:", err);
    res.status(500).json({ error: "Failed to send email via SendGrid" });
  }
});

/**
 * Update an account
 */
router.put("/:id", protect, authorizeAccountAccess, async (req, res) => {
  const accountId = req.account.id;
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
  } = req.body;

  if (!email || !provider || !imapHost || !imapPort || !imapUser || !smtpHost || !smtpPort || !smtpUser) {
    return res.status(400).json({ error: "All connection fields are required" });
  }

  if (authType === "password" && !encryptedPass) {
    return res.status(400).json({ error: "App password is required" });
  }

  if (authType === "oauth" && (!oauthClientId || !oauthClientSecret || !refreshToken)) {
    return res.status(400).json({ error: "OAuth2 requires clientId, clientSecret and refreshToken" });
  }

  try {
    const updatedAccount = await prisma.emailAccount.update({
      where: { id: accountId },
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
      },
    });

    console.log(`[accounts] ✅ Account updated: ${updatedAccount.email}, starting sync...`);
    safeRun(() => syncEmailsForAccount(prisma, updatedAccount));

    res.status(200).json(updatedAccount);
  } catch (err) {
    console.error("[accounts] ❌ Error updating account:", err);

    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ error: `Account with email ${email} already exists` });
    }

    res.status(500).json({ error: "Failed to update account" });
  }
});

/**
 * Delete an account and its emails
 */
router.delete("/:id", protect, authorizeAccountAccess, async (req, res) => {
  const accountId = req.account.id;

  try {
    await prisma.email.deleteMany({ where: { accountId } });
    await prisma.emailAccount.delete({ where: { id: accountId } });
    res.status(200).json({ message: "Account and emails deleted" });
  } catch (err) {
    console.error("[accounts] ❌ Error deleting account:", err);

    if (err.code === "P2025") {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
