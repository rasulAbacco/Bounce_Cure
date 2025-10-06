// server/routes/SendCampaignReply.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { google } from "googleapis";
import { protect } from "../middleware/authMiddleware.js"; // ✅ added

const router = express.Router();

/* -------------------------------
   Normal POST route (SendGrid Inbound Parse style)
-------------------------------- */
router.post("/sendgrid", protect, async (req, res) => {
  try {
    const { from, subject, text } = req.body;

    let contact = await prisma.contact.findUnique({
      where: {
        email_userId: {
          email: from.email,
          userId: req.user.id, // ✅ composite unique constraint (email + userId)
        },
      },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: from.name || from.email,
          email: from.email,
          userId: req.user.id, // ✅ link to logged-in user
        },
      });
    }

    const reply = await prisma.reply.create({
      data: {
        contactId: contact.id,
        message: text || subject || "No content",
        userId: req.user.id, // ✅ reply also linked to user
      },
    });

    res.status(201).json({ success: true, reply });
  } catch (err) {
    console.error("Error saving reply:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

/* -------------------------------
   Gmail Sync (new route)
-------------------------------- */

// load OAuth2 client for Gmail
function getOAuth2Client() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });
  return oAuth2Client;
}

// fetch and save Gmail replies for logged-in user
async function fetchReplies(oAuth2Client, userId) {
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox newer_than:1d", // only today’s emails
  });

  for (const m of res.data.messages || []) {
    const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
    const headers = msg.data.payload.headers;
    const from = headers.find((h) => h.name === "From")?.value;
    const subject = headers.find((h) => h.name === "Subject")?.value;
    const snippet = msg.data.snippet;

    // Try to find contact for this user
    let contact = await prisma.contact.findFirst({
      where: {
        email: { contains: from }, // crude parsing, better use regex
        userId,
      },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: from,
          email: from,
          userId,
        },
      });
    }

    await prisma.reply.create({
      data: {
        contactId: contact.id,
        message: `${from} | ${subject} - ${snippet}`,
        userId, // ✅ link reply to user
      },
    });
  }
}

// manual trigger route
router.get("/sync-gmail-replies", protect, async (req, res) => {
  try {
    const client = getOAuth2Client();
    await fetchReplies(client, req.user.id); // ✅ sync only for logged-in user
    res.json({ success: true, message: "Replies synced from Gmail" });
  } catch (err) {
    console.error("Gmail sync error:", err);
    res.status(500).json({ success: false, error: "Failed to sync replies" });
  }
});

export default router;

// //server/routes/SendCampaignReply.js
// import express from "express";
// import { prisma } from "../prisma/prismaClient.js";
// import { google } from "googleapis";

// const router = express.Router();
 
// /* -------------------------------
//    Normal POST route (SendGrid Inbound Parse style)
// -------------------------------- */
// router.post("/sendgrid", async (req, res) => {
//   try {
//     const { from, subject, text } = req.body;

//     let contact = await prisma.contact.findUnique({
//       where: { email: from.email }
//     });

//     if (!contact) {
//       contact = await prisma.contact.create({
//         data: { name: from.name || from.email, email: from.email }
//       });
//     }

//     const reply = await prisma.reply.create({
//       data: {
//         contactId: contact.id,
//         message: text || subject || "No content"
//       }
//     });

//     res.status(201).json({ success: true, reply });
//   } catch (err) {
//     console.error("Error saving reply:", err);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

// /* -------------------------------
//    Gmail Sync (new route)
// -------------------------------- */

// // load OAuth2 client for Gmail
// function getOAuth2Client() {
//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.GMAIL_CLIENT_ID,
//     process.env.GMAIL_CLIENT_SECRET,
//     process.env.GMAIL_REDIRECT_URI
//   );
//   oAuth2Client.setCredentials({
//     refresh_token: process.env.GMAIL_REFRESH_TOKEN,
//   });
//   return oAuth2Client;
// }

// // fetch and save Gmail replies
// async function fetchReplies(oAuth2Client) {
//   const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

//   const res = await gmail.users.messages.list({
//     userId: "me",
//     q: "in:inbox newer_than:1d", // only today’s emails
//   });

//   for (const m of res.data.messages || []) {
//     const msg = await gmail.users.messages.get({ userId: "me", id: m.id });
//     const headers = msg.data.payload.headers;
//     const from = headers.find((h) => h.name === "From")?.value;
//     const subject = headers.find((h) => h.name === "Subject")?.value;
//     const snippet = msg.data.snippet;

//     // TODO: parse "from" and map to a real contactId
//     await prisma.reply.create({
//       data: {
//         contactId: 1,
//         message: `${from} | ${subject} - ${snippet}`,
//       },
//     });
//   }
// }

// // manual trigger route
// router.get("/sync-gmail-replies", async (req, res) => {
//   try {
//     const client = getOAuth2Client();
//     await fetchReplies(client);
//     res.json({ success: true, message: "Replies synced from Gmail" });
//   } catch (err) {
//     console.error("Gmail sync error:", err);
//     res.status(500).json({ success: false, error: "Failed to sync replies" });
//   }
// });

// export default router;
