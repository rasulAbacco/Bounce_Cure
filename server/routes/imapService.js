// routes/imapService.js
import { ImapFlow } from "imapflow";
import { prisma } from "../prisma/prismaClient.js";
import { simpleParser } from "mailparser"; // ✅ use named import

export async function fetchAndStoreInboxMails(fromEmail, password, host, port = 993) {
  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: {
      user: fromEmail,
      pass: password,
    },
  });

  try {
    await client.connect();
    let lock = await client.getMailboxLock("INBOX");

    try {
      for await (let msg of client.fetch({ seen: false }, { envelope: true, source: true })) {
        const parsed = await simpleParser(msg.source);

        const mailData = {
          imapUid: msg.uid,
          from: msg.envelope.from[0].address,
          to: msg.envelope.to[0].address,
          subject: msg.envelope.subject,
          message: parsed.text || parsed.html || "(no content)",
          createdAt: msg.envelope.date || new Date(),
        };

        // ⚠️ Avoid duplicate inserts
        const exists = await prisma.reply.findFirst({
          where: {
            fromEmail: mailData.from,
            toEmail: mailData.to,
            subject: mailData.subject,
            createdAt: mailData.createdAt,
          },
        });

        if (!exists) {
          await prisma.reply.create({
            data: {
              contactId: 1, // TODO: match contactId by mailData.from
              campaignId: null,
              fromEmail: mailData.from,
              toEmail: mailData.to,
              subject: mailData.subject,
              message: mailData.message,
              createdAt: mailData.createdAt,
            },
          });
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error("IMAP error:", err);
    throw err;
  }
}
