import nodemailer from "nodemailer";

let transporter;

export const initEmail = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "gmail", // <--- simpler & correct for Gmail
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Verify on startup
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ Gmail SMTP connection failed:", err);
    } else {
      console.log("✅ Gmail SMTP ready to send emails");
    }
  });

  return transporter;
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) initEmail();

  try {
    const info = await transporter.sendMail({
      from: `<${process.env.GMAIL_USER}>`,
      to: "",
      subject,
      text: text || "Plain text fallback",
      html: html || "",
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Email failed:", err);
    throw err;
  }
};
