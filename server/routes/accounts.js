import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Add a new email account
router.post("/", async (req, res) => {
    const { userId, email, imapHost, imapPort, imapUser, encryptedPass } = req.body;
    try {
        const account = await prisma.emailAccount.create({
            data: {
                userId: parseInt(userId),
                email,
                imapHost,
                imapPort: parseInt(imapPort),
                imapUser,
                encryptedPass,
            },
        });
        res.status(201).json(account);
    } catch (err) {
        console.error("Error creating account:", err);
        res.status(500).json({ error: "Failed to create account" });
    }
});

// Get all email accounts
router.get("/", async (req, res) => {
    try {
        const accounts = await prisma.emailAccount.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(accounts);
    } catch (err) {
        console.error("Error fetching accounts:", err);
        res.status(500).json({ error: "Failed to fetch accounts" });
    }
});

export default router;
