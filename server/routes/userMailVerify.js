// src/routes/verifiedEmails.js
import express from "express";
import sgMail from "@sendgrid/mail";
import { v4 as uuidv4 } from "uuid";
// IMPORTANT: use the same relative import line you use in campaigns.js
// e.g. `import { prisma } from "../prisma/prismaClient.js";`
import { prisma } from "../prisma/prismaClient.js";

const router = express.Router();

// set SendGrid key used for sending verification emails (must be able to send FROM your verification sender)
const initSendGrid = () => {
    if (!process.env.SENDGRID_USER_API_KEY) {
        throw new Error("Missing SENDGRID_USER_API_KEY in environment variables");
    }
    sgMail.setApiKey(process.env.SENDGRID_USER_API_KEY);
};

// List all verified senders (used for pre-verified dropdown)
router.get("/", async (req, res) => {
    try {
        const senders = await prisma.verifiedSender.findMany({
            where: { verified: true },
            orderBy: { createdAt: "desc" },
        });
        res.json(senders);
    } catch (err) {
        console.error("Failed to fetch verified senders:", err);
        res.status(500).json({ error: "Failed to fetch verified senders" });
    }
});

// Check verification status for a single email
router.get("/check/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const sender = await prisma.verifiedSender.findUnique({ where: { email } });
        if (!sender) {
            return res.json({ isVerified: false });
        }
        res.json({
            isVerified: !!sender.verified,
            verifiedAt: sender.verifiedAt || null,
            fromName: sender.fromName || null,
        });
    } catch (err) {
        console.error("Error checking verified email:", err);
        res.status(500).json({ error: "Error checking verification status" });
    }
});

// Send verification email to an address (the email you send FROM here must be a verified SendGrid identity / domain)
router.post("/send-verification", async (req, res) => {
    try {
        const { email: rawEmail, fromName } = req.body;
        if (!rawEmail) return res.status(400).json({ error: "email is required" });

        const email = String(rawEmail).toLowerCase();
        initSendGrid();

        // create or update token
        const token = uuidv4();
        const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verifiedSender.upsert({
            where: { email },
            create: {
                email,
                fromName: fromName || null,
                verified: false,
                token,
                tokenExpiresAt,
            },
            update: {
                fromName: fromName || undefined,
                token,
                tokenExpiresAt,
                verified: false,
            },
        });

        // Build verification link to the front-end page that has the Verify component
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5000";
        const verifyLink = `${frontendUrl}/verify-email?token=${token}`;

        // Sender for verification email - this MUST be a SendGrid verified sender identity or verified domain
        const sendFromEmail = process.env.SENDGRID_VERIFICATION_FROM;
        const sendFromName = process.env.SENDGRID_VERIFICATION_FROM_NAME || "No Reply";

        if (!sendFromEmail) {
            return res.status(500).json({ error: "Server missing SENDGRID_VERIFICATION_FROM env var" });
        }

        const msg = {
            to: email,
            from: { email: sendFromEmail, name: sendFromName },
            subject: "Verify your sender email for campaigns",
            html: `
        <p>Hi ${fromName || ""},</p>
        <p>Click the link below to verify that you own <strong>${email}</strong> and allow it to be used as a "From" address for campaigns:</p>
        <p><a href="${verifyLink}">Verify this email</a></p>
        <p>If the link doesn't work copy-paste: ${verifyLink}</p>
        <hr>
        <p>If you didn't request this, ignore this message.</p>
      `,
        };

        await sgMail.send(msg);

        res.json({ message: "Verification email sent" });
    } catch (err) {
        console.error("Error sending verification email:", err);
        res.status(500).json({ error: "Failed to send verification email", details: err.message });
    }
});

// Verify route that the frontend will call (and the user clicks the link to reach the frontend which calls this backend)
router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) return res.status(400).json({ error: "token missing" });

        const sender = await prisma.verifiedSender.findFirst({ where: { token } });
        if (!sender) return res.status(400).json({ error: "Invalid or expired token" });

        if (sender.tokenExpiresAt && sender.tokenExpiresAt < new Date()) {
            return res.status(400).json({ error: "Token expired" });
        }

        await prisma.verifiedSender.update({
            where: { email: sender.email },
            data: { verified: true, verifiedAt: new Date(), token: null, tokenExpiresAt: null },
        });

        // Respond with a friendly message (frontend VerifydEmail.jsx expects JSON)
        res.json({ message: "Email verified successfully", email: sender.email });
    } catch (err) {
        console.error("Verification error:", err);
        res.status(500).json({ error: "Verification failed", details: err.message });
    }
});

// Optional admin helper: add already-verified sender (PROTECT this in production!)
router.post("/add", async (req, res) => {
    try {
        const { email: rawEmail, fromName } = req.body;
        if (!rawEmail) return res.status(400).json({ error: "email required" });
        const email = String(rawEmail).toLowerCase();

        // NOTE: In production protect this endpoint (admin only)
        await prisma.verifiedSender.upsert({
            where: { email },
            create: { email, fromName: fromName || null, verified: true, verifiedAt: new Date() },
            update: { verified: true, verifiedAt: new Date(), fromName: fromName || undefined },
        });

        res.json({ message: "Added/updated verified sender" });
    } catch (err) {
        console.error("Error adding verified sender:", err);
        res.status(500).json({ error: "Failed to add verified sender", details: err.message });
    }
});

export default router;
