// utils/sendEmail.js

import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to,                                  // Recipient
    from: 'info@abaccotech.com', // Must be a verified sender in SendGrid
    subject,                             // Subject
    text,                                // Plain text content
    html: html || `<p>${text}</p>`,     // HTML content fallback
  };

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    console.error("Error sending email:", error.response?.body || error.message);
    throw new Error("Email send failed");
  }
};

export default sendEmail;
