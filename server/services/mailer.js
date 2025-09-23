import nodemailer from "nodemailer";

function decryptPassword(encryptedPass) {
  // Replace with real decryption
  return encryptedPass;
}

export async function createTransporter(account) {
  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpPort === 465,
    auth: {
      user: account.smtpUser,
      pass: decryptPassword(account.encryptedPass),
    },
  });
}
