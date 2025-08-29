import express from "express";
import multer from "multer";
import { prisma } from "../prisma/prismaClient.js";
import { sendEmail } from "../utils/emailService.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import supportMiddleware from "../middleware/supportMiddleware.js";
import jwt from "jsonwebtoken";

const upload = multer();
const router = express.Router();

/**
 * -------------------------------
 *  POST /api/support/message
 * -------------------------------
 */
router.post("/message", authMiddleware, supportMiddleware, async (req, res) => {
  const { name, message } = req.body;
  const { id: userId, email: userEmail } = req.supportUser || {};

  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name and message are required." });
  }

  try {
    // Save to DB with user info
    await prisma.supportMessage.create({
      data: {
        name: name.trim(),
        message: message.trim(),
        userId: userId || null,
        userEmail: userEmail || null,
      },
    });

    // Send email
    await sendEmail({
      to: "abacco83@gmail.com",
      subject: `Support Message from ${name}`,
      text: message,
      html: `
        <h2>New Support Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>User:</b> ${userEmail || "Guest"} (ID: ${userId || "N/A"})</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    res.json({ success: true, message: "Message saved & email sent successfully!" });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error saving support message:", error);
    }
    res.status(500).json({ error: "Failed to save or send message." });
  }
});

/**
 * -------------------------------
 *  POST /api/support/ticket
 * -------------------------------
 */
router.post(
  "/ticket",
  supportMiddleware,
  upload.fields([
    { name: "files", maxCount: 5 },
    { name: "screenshots", maxCount: 5 },
  ]),
  async (req, res) => {
    const { subject, description } = req.body;
    const { id: userId, email: userEmail } = req.supportUser || {};

    const allFiles = [
      ...(req.files?.files || []),
      ...(req.files?.screenshots || []),
    ];

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({ error: "Subject and description are required." });
    }

    try {
      const ticket = await prisma.supportTicket.create({
        data: {
          subject: subject.trim(),
          description: description.trim(),
          userId: userId || null,
          userEmail: userEmail || null,
        },
      });

      if (allFiles.length > 0) {
        await prisma.supportFile.createMany({
          data: allFiles.map((file) => ({
            filename: file.originalname,
            mimetype: file.mimetype,
            data: file.buffer,
            ticketId: ticket.id,
          })),
        });
      }

      await sendEmail({
        to: "abacco83@gmail.com",
        subject: `New Support Ticket: ${subject}`,
        html: `
          <h2>New Support Ticket</h2>
          <p><strong>User:</strong> ${userEmail || "N/A"} (ID: ${userId || "N/A"})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Files:</strong> ${allFiles.length} uploaded</p>
        `,
      });

      res.json({ success: true, message: "Ticket & files saved successfully!" });
    } catch (error) {
      console.error("❌ Error saving ticket:", error);
      res.status(500).json({ error: "Failed to save ticket." });
    }
  }
);

/**
 * -------------------------------
 *  GET /api/support/file/:id
 * -------------------------------
 */
router.get("/file/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const file = await prisma.supportFile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", file.mimetype);
    res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
    res.send(file.data);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Error fetching file:", error);
    }
    res.status(500).json({ error: "Failed to fetch file." });
  }
});

export default router;