// server/routes/conversations.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { sendEmail, initSendGrid } from "../services/mailer.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
initSendGrid();

const router = express.Router();

// ✅ Apply protect middleware to all routes
router.use(protect);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
  }
});

/**
 * GET /conversations
 * Returns all emails for the logged-in user
 */
router.get("/", async (req, res) => {
  try {
    const emails = await prisma.email.findMany({
      where: {
        isReply: false,
        folder: "INBOX",
        account: { userId: req.user.id },
      },
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
            account: { userId: req.user.id },
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
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const email = await prisma.email.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!email || email.account.userId !== req.user.id) {
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
        account: { userId: req.user.id },
      },
      orderBy: { date: "asc" },
      include: { 
        account: true,
        attachments: true
      },
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
      isReply: e.isReply,
      attachments: e.attachments.map(att => ({
        id: att.id,
        filename: att.filename,
        mimetype: att.mimetype,
        size: att.size
      }))
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
 * Handles replies and forwarding with file attachments
 */
router.post("/:id/reply", upload.array("attachments", 5), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { body, fromName, fromEmail, toEmail, inReplyTo, isForward } = req.body;

  console.log('📨 Reply/Forward request received:', {
    conversationId: id,
    fromEmail,
    toEmail,
    isForward,
    hasAttachments: req.files?.length > 0,
    attachmentCount: req.files?.length || 0,
    attachmentNames: req.files?.map(f => f.originalname) || []
  });

  try {
    // Validate required fields
    if (!body || !body.trim()) {
      console.error('❌ Validation failed: Empty body');
      return res.status(400).json({ error: "Message body is required" });
    }

    if (!fromEmail || !fromEmail.trim()) {
      console.error('❌ Validation failed: Missing fromEmail');
      return res.status(400).json({ error: "Sender email is required" });
    }

    if (!toEmail || !toEmail.trim()) {
      console.error('❌ Validation failed: Missing toEmail');
      return res.status(400).json({ error: "Recipient email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fromEmail)) {
      console.error('❌ Validation failed: Invalid fromEmail format:', fromEmail);
      return res.status(400).json({ error: "Invalid sender email format" });
    }
    if (!emailRegex.test(toEmail)) {
      console.error('❌ Validation failed: Invalid toEmail format:', toEmail);
      return res.status(400).json({ error: "Invalid recipient email format" });
    }

    const originalEmail = await prisma.email.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!originalEmail || originalEmail.account.userId !== req.user.id) {
      console.error('❌ Conversation not found or unauthorized');
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messageId = `<${Date.now()}.${uuidv4()}@${process.env.DOMAIN || "localhost"}>`;
    const threadId = originalEmail.threadId || originalEmail.messageId;
    const accountId = originalEmail.accountId;

    const isForwardBool = isForward === 'true' || isForward === true;
    const subject = isForwardBool
      ? `Fwd: ${originalEmail.subject || '(no subject)'}` 
      : `Re: ${originalEmail.subject || '(no subject)'}`;

    console.log('💾 Creating email record in database...');
    console.log('📧 Email details:', { subject, from: fromEmail, to: toEmail, isForward: isForwardBool });

    // Create email record in database
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
        isReply: !isForwardBool,
        messageId,
        folder: "SENT",
        status: "sending",
        source: "web",
      },
    });

    console.log('✅ Email record created in database:', message.id);

    // Save attachments if any
    if (req.files && req.files.length > 0) {
      console.log(`📎 Saving ${req.files.length} attachment(s) to database...`);
      
      const attachmentsData = req.files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer,
        emailId: message.id,
      }));

      await prisma.attachment.createMany({
        data: attachmentsData,
      });

      console.log(`✅ ${req.files.length} attachment(s) saved to database`);
    }

    // Prepare attachments for SendGrid
    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      content: file.buffer.toString('base64'),
      type: file.mimetype,
      disposition: 'attachment',
    })) : [];

    console.log('📎 Attachments for email:', attachments.length);

    // Strip HTML tags for plain text version
    const plainText = body
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    try {
      console.log('📤 Attempting to send email via SendGrid/SMTP...');
      console.log('📧 Email details:', {
        from: fromEmail,
        to: toEmail,
        subject,
        hasAttachments: attachments.length > 0,
        attachmentCount: attachments.length
      });
      
      const result = await sendEmail({
        from: fromEmail,
        fromName: fromName || fromEmail.split('@')[0],
        to: toEmail,
        subject,
        text: plainText,
        html: body,
        inReplyTo: inReplyTo || originalEmail.messageId,
        references: inReplyTo
          ? [inReplyTo, originalEmail.messageId].filter(Boolean).join(" ")
          : originalEmail.messageId,
        messageId,
        attachments,
      }, originalEmail.account);

      console.log('✅ Email sent successfully via', result.method || 'SendGrid');

      // Update status to sent
      await prisma.email.update({
        where: { id: message.id },
        data: { status: "sent" },
      });

      return res.json({ 
        ...message, 
        status: "sent",
        method: result.method || 'sendgrid',
        success: true,
        attachmentCount: attachments.length
      });
    } catch (emailError) {
      console.error("❌ Email sending error:", emailError);
      console.error("Error details:", emailError.message);
      if (emailError.response) {
        console.error("Error response body:", JSON.stringify(emailError.response.body, null, 2));
      }
      
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
    console.error("❌ Error in reply endpoint:", err);
    res.status(500).json({ 
      error: "Failed to create/send message",
      details: err.message 
    });
  }
});

/**
 * GET /conversations/attachments/:id
 * Download an attachment by ID
 */
router.get("/attachments/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { 
        email: {
          include: { account: true }
        }
      },
    });

    if (!attachment || attachment.email.account.userId !== req.user.id) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    res.setHeader('Content-Type', attachment.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.send(attachment.data);
  } catch (err) {
    console.error("Error fetching attachment:", err);
    res.status(500).json({ error: "Failed to fetch attachment" });
  }
});

/**
 * DELETE /conversations/:id
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const email = await prisma.email.findUnique({
      where: { id },
      include: { account: true },
    });

    if (!email || email.account.userId !== req.user.id) {
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
        account: { userId: req.user.id },
      },
    });

    res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error("Failed to delete conversation:", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

/**
 * DELETE /conversations (bulk delete)
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
        include: { account: true },
      });

      if (!email || email.account.userId !== req.user.id) continue;

      const threadId = email.threadId || email.messageId;
      const deleteResult = await prisma.email.deleteMany({
        where: {
          OR: [
            { id: email.id },
            { threadId },
            { inReplyTo: email.messageId },
            { inReplyTo: threadId },
          ],
          account: { userId: req.user.id },
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

/**
 * GET /conversations/match (CRM matching)
 */
router.get("/match", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // Try to find a lead/contact/deal that matches this email
    const lead = await prisma.lead.findFirst({ where: { email } });
    const contact = await prisma.contact.findFirst({ where: { email } });
    const deal = await prisma.deal.findFirst({ where: { email } });

    res.json({
      lead: lead || null,
      contact: contact || null,
      deal: deal || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;