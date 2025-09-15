import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /conversations
 * Returns all emails mapped as "conversations"
 */
router.get("/", async (req, res) => {
    try {
        const emails = await prisma.email.findMany({
            orderBy: { date: "desc" },
            take: 100,
            include: { account: true },
        });

        const convs = emails.map((e) => ({
            id: e.id,
            subject: e.subject || "(no subject)",
            lastMessage: e.body ? e.body.slice(0, 120) : "",
            from: e.from,
            to: e.to,
            date: e.date,
            account: e.account,
        }));

        res.json(convs);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

/**
 * GET /conversations/:id
 * Returns one email wrapped as a "conversation"
 */
router.get("/:id", async (req, res) => {
    try {
        const email = await prisma.email.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { account: true },
        });

        if (!email) return res.status(404).json({ error: "Not found" });

        res.json({
            id: email.id,
            subject: email.subject || "(no subject)",
            messages: [
                {
                    id: email.id,
                    fromName: email.from,
                    to: email.to,
                    body: email.body,
                    createdAt: email.date,
                },
            ],
        });
    } catch (err) {
        console.error("Error fetching conversation:", err);
        res.status(500).json({ error: "Failed to fetch conversation" });
    }
});

export default router;
