import express from "express";
import { sendEmail } from "../utils/emailService.js"; // Email sending utility

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
            text: message
        });
        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message." });
    }
});

// POST /api/support/ticket
router.post("/ticket", async (req, res) => {
    const { subject, description } = req.body;

    if (!subject?.trim() || !description?.trim()) {
        return res.status(400).json({ error: "Subject and description are required." });
    }

    try {
        await sendEmail({
            to: "abacco83@gmail.com",
            subject: `New Support Ticket: ${subject}`,
            text: description
        });
        res.json({ success: true, message: "Ticket submitted successfully!" });
    } catch (error) {
        console.error("Error submitting ticket:", error);
        res.status(500).json({ error: "Failed to submit ticket." });
    }
});

export default router;
