// server/routes/accounts.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { syncEmailsForAccount, runSync } from "../services/imapSync.js"; // Import the sync functions

const prisma = new PrismaClient();
const router = express.Router();

// Add a new email account
router.post("/", async (req, res) => {
  const { userId, email, imapHost, imapPort, imapUser, encryptedPass } = req.body;

  if (!userId || !email || !imapHost || !imapPort || !imapUser || !encryptedPass) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Create the account in the database
    const account = await prisma.emailAccount.create({
      data: {
        email,
        imapHost,
        imapPort: parseInt(imapPort),
        imapUser,
        encryptedPass,
        user: {
          connectOrCreate: {
            where: { id: parseInt(userId) },
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

    // Trigger email sync after account creation
    syncEmailsForAccount(prisma, account).catch((err) => {
      console.error("❌ Email sync failed:", err.message);
    });

    res.status(201).json(account);
  } catch (err) {
    console.error("❌ Error creating account:", err);
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Invalid userId" });
    }
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Get all email accounts
router.get("/", async (req, res) => {
  try {
    const accounts = await prisma.emailAccount.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    res.json(accounts);
  } catch (err) {
    console.error("❌ Error fetching accounts:", err);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// Get emails for a specific account
router.get("/emails", async (req, res) => {
  const { accountId } = req.query;
  
  if (!accountId) {
    return res.status(400).json({ error: "Account ID is required" });
  }
  
  try {
    const emails = await prisma.email.findMany({
      where: { accountId: parseInt(accountId) },
      orderBy: { date: "desc" },
    });
    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Trigger sync for a specific account
router.post("/sync/:id", async (req, res) => {
  const accountId = parseInt(req.params.id);
  
  try {
    const account = await prisma.emailAccount.findUnique({
      where: { id: accountId }
    });
    
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }
    
    // Trigger email sync for this account
    syncEmailsForAccount(prisma, account).catch((err) => {
      console.error("❌ Email sync failed:", err.message);
    });
    
    res.status(200).json({ message: "Sync started" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

// Trigger sync for all accounts
router.post("/sync", async (req, res) => {
  try {
    // Trigger email sync for all accounts
    runSync(prisma).catch((err) => {
      console.error("❌ Email sync failed:", err.message);
    });
    
    res.status(200).json({ message: "Sync started for all accounts" });
  } catch (err) {
    console.error("❌ Error triggering sync:", err);
    res.status(500).json({ error: "Failed to trigger sync" });
  }
});

// Delete (logout) an account
router.delete("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id);

  try {
    // First, delete all emails associated with this account
    await prisma.email.deleteMany({
      where: { accountId: accountId },
    });
    
    // Then delete the account
    await prisma.emailAccount.delete({
      where: { id: accountId },
    });
    
    res.status(200).json({ message: "Account and associated emails deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// Update an account
router.put("/:id", async (req, res) => {
  const accountId = parseInt(req.params.id);
  const { email, imapHost, imapPort, imapUser, encryptedPass } = req.body;

  if (!email || !imapHost || !imapPort || !imapUser || !encryptedPass) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const updatedAccount = await prisma.emailAccount.update({
      where: { id: accountId },
      data: {
        email,
        imapHost,
        imapPort: parseInt(imapPort),
        imapUser,
        encryptedPass,
      },
    });

    // Trigger email sync after account update
    syncEmailsForAccount(prisma, updatedAccount).catch((err) => {
      console.error("❌ Email sync failed:", err.message);
    });

    res.status(200).json(updatedAccount);
  } catch (err) {
    console.error("❌ Error updating account:", err);
    res.status(500).json({ error: "Failed to update account" });
  }
});

export default router;