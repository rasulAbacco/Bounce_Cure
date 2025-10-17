// server/services/twilioService.js
import Twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an SMS or WhatsApp message via Twilio
 * @param {Object} options
 * @param {string} options.to - Recipient phone number in E.164 format (+91...)
 * @param {string} options.body - Message text
 * @param {string} [options.mediaUrl] - Optional media URL
 * @param {string} options.channel - "sms" or "whatsapp"
 */
export async function sendMessage({ to, body, mediaUrl, channel }) {

  try {
    const from =
      channel === "whatsapp"
        ? process.env.TWILIO_WHATSAPP_FROM
        : process.env.TWILIO_SMS_FROM;

    const payload = {
      from,
      to: channel === "whatsapp" ? `whatsapp:${to}` : to,
      body,
    };

    if (mediaUrl) payload.mediaUrl = [mediaUrl];

    const message = await client.messages.create(payload);
    return { sid: message.sid, status: message.status };
  } catch (error) {
    console.error("Twilio sendMessage error:", error.message);
    throw new Error(error.message);
  }
}
