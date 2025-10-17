import express from "express";
import { sendMessage } from "../services/twilioService.js";

const router = express.Router();

/**
 * POST /api/multimedia-campaign/send
 * Body: { channel: "sms" | "whatsapp", recipients: [numbers], message, mediaUrl?, schedule? }
 */
router.post("/send", async (req, res) => {
    const { channel, recipients, message, mediaUrl, schedule } = req.body;

    if (!recipients?.length || !message) {
        return res.status(400).json({ error: "Recipients and message are required" });
    }

    const results = [];

    // 🔹 Function to send messages immediately
    const sendNow = async () => {
        for (const to of recipients) {
            try {
                const result = await sendMessage({ to, body: message, mediaUrl, channel });
                results.push({ to, ...result });
            } catch (err) {
                console.error("Error sending to:", to, err.message);
                results.push({ to, error: err.message });
            }
        }
    };

    try {
        // 🕒 If schedule is provided
        if (schedule) {
            const sendTime = new Date(schedule).getTime();
            const now = Date.now();

            // Handle invalid or past schedules
            if (isNaN(sendTime)) {
                return res.status(400).json({ error: "Invalid schedule time format" });
            }

            const delay = sendTime - now;

            if (delay > 0) {
                // Schedule for future
                setTimeout(async () => {
                    console.log(`⏰ Sending scheduled campaign at ${new Date().toISOString()}`);
                    await sendNow();
                }, delay);

                console.log(`✅ Campaign scheduled for ${schedule} (in ${Math.round(delay / 1000)}s)`);
                return res.json({
                    success: true,
                    scheduled: true,
                    scheduledFor: schedule,
                    message: "Campaign scheduled successfully!",
                });
            } else {
                console.log("⚠️ Schedule time is in the past, sending immediately...");
            }
        }

        // 🚀 If no schedule or schedule time passed, send now
        await sendNow();
        return res.json({ success: true, scheduled: false, results });

    } catch (error) {
        console.error("Campaign send error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
