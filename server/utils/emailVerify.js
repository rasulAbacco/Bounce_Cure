// server/utils/emailVerify.js
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendTestEmail(to) {
  const msg = {
    to,
    from: "info@abaccotech.com", // verified sender
    subject: "Email Verification Test - Do Not Reply",
    text: "This is a test email for bounce-based verification."
  };
  return sgMail.send(msg);
}
