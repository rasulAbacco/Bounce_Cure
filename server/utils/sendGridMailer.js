// sendGridMailer.js
import nodemailer from "nodemailer";

// Create transporter correctly using createTransport
const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: "apikey", // literally the string "apikey"
    pass: process.env.SENDGRID_API_KEY, // your actual SendGrid API key
  },
});

/**
 * Sends a basic verification email
 */
export async function sendVerificationEmail(to) {
  try {
    const info = await transporter.sendMail({
      from: '"Bounce Cure" <verify@yourdomain.com>',
      to,
      subject: "Email Verification",
      text: "This is a verification test to see if your email address is reachable.",
    });

    console.log(`✅ Sent to ${to}: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.warn(`❌ Failed to send to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
}
