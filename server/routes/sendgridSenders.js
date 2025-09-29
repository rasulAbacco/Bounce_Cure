// server/src/routes/sendgridSenders.js
import express from "express";
import axios from "axios";
import { prisma } from "../prisma/prismaClient.js"; // adjust this import to match your project

const router = express.Router();
const SG_BASE = "https://api.sendgrid.com/v3";

function sgHeaders() {
    if (!process.env.SENDGRID_USER_API_KEY) throw new Error("Missing SENDGRID_USER_API_KEY env var");
    return {
        Authorization: `Bearer ${process.env.SENDGRID_USER_API_KEY}`,
        "Content-Type": "application/json",
    };
}

/**
 * POST /api/senders/create
 * Body: { email, name, address?, city?, state?, zip?, country?, nickname? }
 * Creates a SendGrid sender identity (SendGrid will email the user to confirm)
 */
router.post("/create", async (req, res) => {
    try {
        const { email, name, address, city, state, zip, country, nickname } = req.body;
        if (!email || !name) return res.status(400).json({ error: "email and name are required" });

        const payload = {
            nickname: nickname || `${name}-sender`,
            from: { email, name },
            reply_to: { email, name },
            address: address || "N/A",
            city: city || "N/A",
            state: state || "",
            zip: zip || "",
            country: country || "N/A",
        };

        const sgRes = await axios.post(`${SG_BASE}/senders`, payload, { headers: sgHeaders() });
        const sgData = sgRes.data; // typically contains an `id` and other info

        // Save or update local DB record (store sendgridSenderId)
        await prisma.verifiedSender.upsert({
            where: { email: String(email).toLowerCase() },
            create: {
                email: String(email).toLowerCase(),
                fromName: name,
                sendgridSenderId: sgData.id || null,
                sendgridStatus: sgData.status || JSON.stringify(sgData),
            },
            update: {
                fromName: name,
                sendgridSenderId: sgData.id || null,
                sendgridStatus: sgData.status || JSON.stringify(sgData),
            },
        });

        return res.json({ message: "SendGrid sender created (verification email sent)", sendgridData: sgData });
    } catch (err) {
        console.error("create sender error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to create sender", details: err.response?.data || err.message });
    }
});

/**
 * GET /api/senders/check/:email
 * Checks SendGrid status for a local sender by email.
 * If SendGrid shows verified, we update local DB verified=true.
 */
router.get("/check/:email", async (req, res) => {
    try {
        const email = decodeURIComponent(req.params.email).toLowerCase();
        const record = await prisma.verifiedSender.findUnique({ where: { email } });
        if (!record) return res.status(404).json({ error: "No sender record found" });
        if (!record.sendgridSenderId) {
            // If no sendgridSenderId, the sender was not created via the SendGrid API
            return res.json({ isRegisteredWithSendGrid: false, isVerified: !!record.verified, record });
        }

        // fetch SendGrid sender info
        const sgRes = await axios.get(`${SG_BASE}/senders/${record.sendgridSenderId}`, { headers: sgHeaders() });
        const sgData = sgRes.data;

        // Determine "verified" heuristically:
        const isVerified =
            !!sgData.verified ||
            sgData.status === "verified" ||
            sgData.status === "active" ||
            sgData.status === "approved";

        // update local DB status
        await prisma.verifiedSender.update({
            where: { email },
            data: {
                sendgridStatus: sgData.status || JSON.stringify(sgData),
                ...(isVerified && { verified: true, verifiedAt: new Date() }),
            },
        });

        return res.json({ sendgrid: sgData, isVerified });
    } catch (err) {
        console.error("check sender error:", err.response?.data || err.message);
        return res.status(500).json({ error: "Failed to check sendgrid sender", details: err.response?.data || err.message });
    }
});

// server/src/routes/sendgridSenders.js
router.get("/verified", async (req, res) => {
    try {
        const verified = await prisma.verifiedSender.findMany({
            where: { verified: true },
            orderBy: { verifiedAt: "desc" },
        });
        res.json(verified);
    } catch (err) {
        console.error("fetch verified senders error:", err);
        res.status(500).json({ error: "Failed to fetch verified senders" });
    }
});


export default router;
