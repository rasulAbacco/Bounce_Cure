import express from "express";
import { sendEmail } from "../utils/emailService.js"; // Email sending utility

import multer from "multer";
const upload = multer(); // store in memory, good for email attachments
const router = express.Router();

// POST /api/support/message
router.post("/message", async (req, res) => {
  const { name, message } = req.body;

  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "Name and message are required." });
  }

  try {
    await sendEmail({
      to: "abacco83@gmail.com", // Change to your real email
      subject: `Support Message from ${name}`,
      text: message, // ✅ plain-text fallback
      html: `
        <h2>New Support Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Message:</b> ${message}</p>
      `, // ✅ formatted HTML
    });

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// POST /api/support/ticket

router.post("/ticket", upload.array("screenshots"), async (req, res) => {
  const { subject, description } = req.body;
  const files = req.files || [];

  if (!subject?.trim() || !description?.trim()) {
    return res.status(400).json({ error: "Subject and description are required." });
  }

  try {
    // Prepare attachments with cid (inline display)
    const attachments = files.map((file, idx) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
      cid: `screenshot${idx}@ticket`, // reference for inline HTML
    }));

    // Build screenshots HTML
    const screenshotsHtml =
      files.length === 0
        ? "<p>No screenshots uploaded.</p>"
        : files
            .map(
              (file, idx) => `
          <div style="margin:12px 0;">
            <p><b>${file.originalname}</b></p>
            <img src="cid:screenshot${idx}@ticket"
                 alt="${file.originalname}"
                 style="max-width:560px;border:1px solid #ddd;padding:4px;border-radius:6px;" />
          </div>
        `
            )
            .join("");

    // Send Email
    await sendEmail({
      to: "abacco83@gmail.com",
      subject: `New Support Ticket: ${subject}`,
      html: `
        <h2>New Support Ticket</h2>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Description:</strong> ${description}</p>
        <h3>Screenshots:</h3>
        ${screenshotsHtml}
        <p style="margin-top:20px;color:#666;font-size:12px;">
          (If images don’t show inline, they are also attached below.)
        </p>
      `,
      attachments,
    });

    res.json({ success: true, message: "Ticket submitted successfully!" });
  } catch (error) {
    console.error("Error submitting ticket:", error);
    res.status(500).json({ error: "Failed to submit ticket." });
  }
});




export default router;
