import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendMms(to, body, mediaUrl) {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body,
      mediaUrl: [mediaUrl],
    });
    console.log("Message sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending MMS:", error);
    throw error;
  }
}
