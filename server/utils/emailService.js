import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// utils/sendEmail.js
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,              // use passed value
      subject,         // use passed value
      text,            // plain text fallback
      html: html || `<p>${text}</p>`, // ensure html always exists
    });

    console.log("Email sent:", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email send failed");
  }
};

export default sendEmail;
