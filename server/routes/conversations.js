// server/routes/conversations.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { sendEmail, initSendGrid } from "../services/mailer.js";

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

// Initialize SendGrid
initSendGrid();

const router = express.Router();

/**
 * GET /conversations
 * Returns all emails mapped as "conversations"
 */
router.get("/", async (req, res) => {
  try {
    const emails = await prisma.email.findMany({
      where: { isReply: false, folder: "INBOX" },
      orderBy: { date: "desc" },
      take: 100,
      include: { account: true },
    });

    const convs = await Promise.all(
      emails.map(async (e) => {
        const threadId = e.threadId || e.messageId;
        const replyCount = await prisma.email.count({
          where: {
            OR: [{ threadId }, { inReplyTo: e.messageId }],
            id: { not: e.id },
          },
        });

        return {
          id: e.id,
          subject: e.subject || "(no subject)",
          lastMessage: e.body ? e.body.slice(0, 120) : "",
          from: e.from,
          to: e.to,
          date: e.date,
          account: e.account,
          messageCount: 1 + replyCount,
          threadId,
        };
      })
    );

    res.json(convs);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * GET /conversations/:id
 * Returns one email with all replies
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const email = await prisma.email.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!email) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const threadId = email.threadId || email.messageId;

    const threadEmails = await prisma.email.findMany({
      where: {
        OR: [
          { id: email.id },
          { threadId },
          { inReplyTo: email.messageId },
          { inReplyTo: threadId },
        ],
      },
      orderBy: { date: "asc" },
      include: { account: true },
    });

    const messages = threadEmails.map(e => ({
        id: e.id,
        messageId: e.messageId,
        from: e.from,
        fromName: e.from,
        to: e.to,
        body: e.bodyHtml || e.body,
        createdAt: e.date,
        isOriginal: e.id === email.id,
        inReplyTo: e.inReplyTo,
        isReply: e.isReply
    }));

    res.json({
      id: email.id,
      subject: email.subject || "(no subject)",
      email: email.from,
      account: email.account,
      messages,
    });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

/**
 * POST /conversations/:id/reply
 * Add a reply to a conversation
 */
router.post("/:id/reply", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { body, fromName, fromEmail, toEmail, inReplyTo } = req.body;

  try {
    if (!body || !fromEmail || !toEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const originalEmail = await prisma.email.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!originalEmail) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    if (!originalEmail.account) {
      return res.status(400).json({ error: "Account not found" });
    }

    const messageId = `<${Date.now()}@${process.env.DOMAIN || "localhost"}>`;
    const threadId = originalEmail.threadId || originalEmail.messageId;
    const accountId = originalEmail.accountId;

    // Prepare email subject
    const subject = inReplyTo
      ? `Re: ${originalEmail.subject}`
      : `Fwd: ${originalEmail.subject}`;

    // Save message in DB first
    const message = await prisma.email.create({
      data: {
        subject,
        body,
        bodyHtml: body,
        from: fromEmail,
        to: toEmail,
        date: new Date(),
        accountId,
        inReplyTo: inReplyTo || null,
        threadId,
        isReply: !!inReplyTo,
        messageId,
        folder: "SENT",
        status: "sending",
        source: "web",
      },
    });

    // Try sending via SendGrid or SMTP
    try {
      const account = originalEmail.account;
      
      // Prepare references for email threading
      const references = inReplyTo
        ? [inReplyTo, originalEmail.messageId].join(" ")
        : originalEmail.messageId;

      // Send email using the universal sendEmail function
      const result = await sendEmail({
        from: fromEmail,
        fromName: fromName || fromEmail.split('@')[0],
        to: toEmail,
        subject,
        text: body.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
        html: body,
        inReplyTo: inReplyTo || originalEmail.messageId,
        references,
        messageId,
      }, account);

      console.log('Email sent successfully:', result);

      // Update status to sent
      await prisma.email.update({
        where: { id: message.id },
        data: { status: "sent" },
      });

      const createdMessage = await prisma.email.findUnique({
        where: { id: message.id },
        include: { account: true },
      });

      return res.json({
        id: createdMessage.id,
        messageId: createdMessage.messageId,
        fromName: fromName || createdMessage.from,
        from: createdMessage.from,
        to: createdMessage.to,
        body: createdMessage.bodyHtml || createdMessage.body,
        createdAt: createdMessage.date,
        inReplyTo: createdMessage.inReplyTo,
        isReply: !!inReplyTo,
        conversationId: id,
        status: "sent",
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);

      // Update status to failed
      await prisma.email.update({
        where: { id: message.id },
        data: { status: "failed" },
      });

      return res.status(500).json({
        error: "Failed to send email",
        details: emailError.message,
        status: "failed"
      });
    }
  } catch (err) {
    console.error("Error in reply endpoint:", err);
    res.status(500).json({ error: "Failed to create/send message" });
  }
});

/**
 * DELETE /conversations/:id
 * Delete one conversation
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const email = await prisma.email.findUnique({ where: { id } });
    if (!email) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const threadId = email.threadId || email.messageId;
    await prisma.email.deleteMany({
      where: {
        OR: [
          { id: email.id },
          { threadId },
          { inReplyTo: email.messageId },
          { inReplyTo: threadId },
        ],
      },
    });
    res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error("Failed to delete conversation:", err);
    res.status(404).json({ error: "Conversation not found" });
  }
});

/**
 * DELETE /conversations
 * Delete multiple conversations
 */
router.delete("/", async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "No conversation IDs provided" });
  }
  try {
    let totalDeletedCount = 0;
    for (const id of ids) {
      const conversationId = parseInt(id, 10);
      if (isNaN(conversationId)) continue;
      const email = await prisma.email.findUnique({
        where: { id: conversationId },
      });
      if (!email) continue;
      const threadId = email.threadId || email.messageId;
      const deleteResult = await prisma.email.deleteMany({
        where: {
          OR: [
            { id: email.id },
            { threadId },
            { inReplyTo: email.messageId },
            { inReplyTo: threadId },
          ],
        },
      });
      totalDeletedCount += deleteResult.count;
    }
    res.json({
      message: "Conversations deleted successfully",
      deletedCount: totalDeletedCount,
      conversationCount: ids.length,
    });
  } catch (err) {
    console.error("Failed to delete conversations:", err);
    res.status(500).json({ error: "Failed to delete conversations" });
  }
});

export default router;