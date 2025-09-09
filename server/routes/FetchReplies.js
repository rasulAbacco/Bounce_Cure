import express from "express";
import { ImapFlow } from "imapflow";
import { prisma } from "../prisma/prismaClient.js";
import cron from "node-cron";

const router = express.Router();

export async function fetchRepliesFromGmail() {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: "xemail.test.2025@gmail.com",
      pass: "pkmnunzrelmzqeer" // from Gmail App Password
    }
  });

  await client.connect();
  await client.mailboxOpen("INBOX");

  for await (let msg of client.fetch("1:*", { envelope: true })) {
    const fromEmail = msg.envelope.from[0].address;
    const subject = msg.envelope.subject;
    const date = msg.envelope.date;

    await prisma.reply.create({
      data: {
        contactId: 1, // TODO: map to correct contact by fromEmail
        message: `${subject} (received ${date})`
      }
    });
  }

  await client.logout();
}

// Manual sync API
router.get("/sync-replies", async (req, res) => {
  try {
    await fetchRepliesFromGmail();
    res.json({ success: true, message: "Replies synced from Gmail" });
  } catch (err) {
    console.error("IMAP sync error:", err);
    res.status(500).json({ success: false, error: "Failed to sync replies" });
  }
});

// Auto sync every 5 minutes
cron.schedule("*/5 * * * *", () => {
  console.log("⏳ Auto-syncing Gmail replies...");
  fetchRepliesFromGmail().catch(err => console.error("Cron error:", err));
});

export default router;
