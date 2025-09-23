import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Add a new email
router.post("/", async (req, res) => {
  const { from, to, subject, body, date, accountId, folder = "INBOX" } = req.body;

  try {
    const email = await prisma.email.create({
      data: {
        from,
        to,
        subject,
        body,
        date: date ? new Date(date) : new Date(),
        accountId,
        status: "unread",
        source: "imap",
        folder,
      },
    });

    // 🚫 Removed Redis queueing
    // Email is saved directly to DB

    res.status(201).json(email);
  } catch (err) {
    console.error("Error creating email:", err);
    res.status(500).json({ error: "Failed to create email" });
  }
});

// Get emails
router.get("/", async (req, res) => {
  const accountId = parseInt(req.query.accountId);

  try {
    const emails = await prisma.email.findMany({
      where: accountId ? { accountId } : {},
      orderBy: { date: "desc" },
      take: 50,
      include: { account: true },
    });

    res.json(emails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

// Get single email
router.get("/:id", async (req, res) => {
  try {
    const email = await prisma.email.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { account: true },
    });

    if (!email) return res.status(404).json({ error: "Email not found" });

    res.json(email);
  } catch (err) {
    console.error("Error fetching email:", err);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

export default router;
