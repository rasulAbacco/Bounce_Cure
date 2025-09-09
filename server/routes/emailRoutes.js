import express from "express";
import { PrismaClient } from "@prisma/client";
import { syncEmailsForAccount } from "../services/imapSync.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/emails - get recent emails
router.get("/", async (req, res) => {
    try {
        const emails = await prisma.email.findMany({
            orderBy: { date: "desc" },
            take: 50,
        });
        res.json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});

// POST /api/emails - save new email
router.post("/", async (req, res) => {
    try {
        const { from, to, subject, body, date, tags = [], status = "unread", source = "imap", folder = "INBOX", accountId } =
            req.body;

        if (!from || !to || !subject || !body || !date) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const email = await prisma.email.create({
            data: {
                from,
                to,
                subject,
                body,
                date: new Date(date),
                tags,
                status,
                source,
                folder,
                accountId,
            },
        });

        res.status(201).json(email);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create email" });
    }
});

// Manual sync per user
router.get("/sync/:userId", async (req, res) => {
    const failedAccounts = [];
    try {
        const accounts = await prisma.emailAccount.findMany({
            where: { userId: req.params.userId },
        });

        if (!accounts || accounts.length === 0) {
            return res.status(404).json({ error: "No accounts found for user" });
        }

        for (const account of accounts) {
            try {
                await syncEmailsForAccount(account);
            } catch (err) {
                console.error(`❌ Failed to sync account ${account.imapUser}:`, err.message);
                failedAccounts.push({
                    email: account.imapUser,
                    error: err.message,
                });
            }
        }

        if (failedAccounts.length > 0) {
            return res.status(207).json({
                message: "⚠️ Partial sync complete",
                failedAccounts,
            });
        }

        res.send("✅ Manual IMAP sync complete for all accounts");
    } catch (error) {
        console.error("❌ Sync error:", error);
        res.status(500).json({ error: "Failed to sync emails" });
    }
});

export default router;
