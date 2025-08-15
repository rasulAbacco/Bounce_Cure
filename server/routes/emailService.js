// emailService.js
import nodemailer from "nodemailer";

let transporter;

export const initEmail = async () => {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

export const sendEmail = async ({ to, subject,text }) => {
  if (!transporter) throw new Error("Email transporter not initialized");
  await transporter.sendMail({
    from: `"Bounce Cure" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

export default { initEmail, sendEmail };
