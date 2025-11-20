import express from "express";
import sgMail from "@sendgrid/mail";

const router = express.Router();

// Ensure SendGrid key is loaded
if (!process.env.SENDGRID_API_KEY) {
    console.error("❌ SENDGRID_API_KEY missing from .env");
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

// POST: /api/senders/request-verification
router.post("/request-verification", async (req, res) => {
    try {
        console.log("📩 Incoming verification request:", req.body);

        const {
            name,
            replyTo,
            address,
            address2,
            city,
            state,
            zip,
            country,
            nickname,
            message,
            emails,
        } = req.body || {};

        // Validate inputs
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res
                .status(400)
                .json({ message: "At least one email is required." });
        }

        if (!name) {
            return res.status(400).json({ message: "From Name is required." });
        }
 
        const TO_EMAIL = process.env.TO_EMAIL;
        const FROM_EMAIL = process.env.FROM_EMAIL;

        if (!TO_EMAIL) { 
            console.error("❌ TO_EMAIL not set in .env");
            return res
                .status(500)
                .json({ message: "Admin email (TO_EMAIL) is not configured." });
        }

        if (!FROM_EMAIL) {
            console.error("❌ FROM_EMAIL not set in .env");
            return res
                .status(500)
                .json({ message: "Sender email (FROM_EMAIL) is not configured." });
        }

        // Build email content
        const html = `
  <div style="background-color:#f6f8fb;padding:30px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#333;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- Header -->
      <div style="background-color:#e2971f;color:white;padding:20px 30px;">
        <h2 style="margin:0;font-size:22px;">New Sender Verification Request</h2>
      </div>

      <!-- Body -->
      <div style="padding:25px 30px;">
        <p style="font-size:15px;margin:0 0 20px 0;">
          <strong>From Name:</strong> ${name}
        </p>

        <h3 style="color:#e2971f;font-size:16px;margin-bottom:10px;">Emails to Verify:</h3>
        <ul style="margin:0 0 20px 15px;padding:0;list-style-type:disc;">
          ${emails.map((e) => `<li>${e}</li>`).join("")}
        </ul>

        <h3 style="color:#e2971f;font-size:16px;margin-bottom:10px;">Contact Details</h3>
        <table cellpadding="6" cellspacing="0" style="width:100%;font-size:14px;">
          <tr><td style="width:150px;"><strong>Reply-To:</strong></td><td><a href="mailto:${replyTo}" style="color:#1a73e8;text-decoration:none;">${replyTo}</a></td></tr>
          <tr><td><strong>Address:</strong></td><td>${address || ""} ${address2 || ""
            }</td></tr>
          <tr><td><strong>City:</strong></td><td>${city || ""}</td></tr>
          <tr><td><strong>State:</strong></td><td>${state || ""}</td></tr>
          <tr><td><strong>Zip:</strong></td><td>${zip || ""}</td></tr>
          <tr><td><strong>Country:</strong></td><td>${country || ""}</td></tr>
          <tr><td><strong>Nickname:</strong></td><td>${nickname || ""}</td></tr>
        </table>

        <h3 style="color:#e2971f;font-size:16px;margin:25px 0 10px;">Message from User</h3>
        <p style="background:#f1f1f1;padding:15px;border-radius:8px;font-style:italic;">
          ${message || "No message provided."}
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color:#0a0a0a;color:#999;text-align:center;padding:15px;font-size:13px;">
        <p style="margin:0;">© ${new Date().getFullYear()} AbaccoTech | Sender Verification System</p>
      </div>
    </div>
  </div>
`;

        const msg = {
            to: TO_EMAIL, // Admin recipient
            from: FROM_EMAIL, // Verified SendGrid sender
            subject: `New Sender Verification Request from ${name}`,
            html,
            replyTo: replyTo || FROM_EMAIL,
        };

        console.log("📤 Sending email via SendGrid:", msg);

        await sgMail.send(msg);

        res.status(200).json({
            message: `Verification request sent successfully to ${TO_EMAIL}.`,
        });
    } catch (error) {
        console.error("❌ Error sending email:", error);

        res.status(500).json({
            message: "Failed to send verification request.",
            error: error.message,
        });
    }
});

export default router;
