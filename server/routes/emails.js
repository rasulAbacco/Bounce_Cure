// server/routes/emails.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middleware/authMiddleware.js"; // ✅ for multi-user auth

const prisma = new PrismaClient();
const router = express.Router();

// ✅ All routes require auth
router.use(protect);

/**
 * Add a new email (only for logged-in user's account)
 */
router.post("/", async (req, res) => {
  const { from, to, subject, body, date, accountId, folder = "INBOX" } = req.body;

  try {
    // Check if account belongs to logged-in user
    const account = await prisma.account.findUnique({
      where: { id: parseInt(accountId) },
    });

    if (!account || account.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to add email to this account" });
    }

    const email = await prisma.email.create({
      data: {
        from,
        to,
        subject,
        body,
        date: date ? new Date(date) : new Date(),
        accountId: account.id,
        status: "unread",
        source: "imap",
        folder,
      },
    });

    res.status(201).json(email);
  } catch (err) {
    console.error("❌ Error creating email:", err);
    res.status(500).json({ error: "Failed to create email" });
  }
});

/**
 * Get all emails for the logged-in user
 */
router.get("/", async (req, res) => {
  try {
    const accountId = req.query.accountId ? parseInt(req.query.accountId) : null;

    const emails = await prisma.email.findMany({
      where: {
        account: {
          userId: req.user.id, // ✅ restrict to logged-in user
        },
        ...(accountId ? { accountId } : {}),
      },
      orderBy: { date: "desc" },
      take: 50,
      include: { account: true },
    });

    res.json(emails);
  } catch (err) {
    console.error("❌ Error fetching emails:", err);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

/**
 * Get single email (only if belongs to logged-in user)
 */
router.get("/:id", async (req, res) => {
  try {
    const email = await prisma.email.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { account: true },
    });

    if (!email || email.account.userId !== req.user.id) {
      return res.status(404).json({ error: "Email not found or not authorized" });
    }

    res.json(email);
  } catch (err) {
    console.error("❌ Error fetching email:", err);
    res.status(500).json({ error: "Failed to fetch email" });
  }
});

export default router;

// //server/routes/emails.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();
// const router = express.Router();

// // Add a new email
// router.post("/", async (req, res) => {
//   const { from, to, subject, body, date, accountId, folder = "INBOX" } = req.body;

//   try {
//     const email = await prisma.email.create({
//       data: {
//         from,
//         to,
//         subject,
//         body,
//         date: date ? new Date(date) : new Date(),
//         accountId,
//         status: "unread",
//         source: "imap",
//         folder,
//       },
//     });

//     // 🚫 Removed Redis queueing
//     // Email is saved directly to DB

//     res.status(201).json(email);
//   } catch (err) {
//     console.error("Error creating email:", err);
//     res.status(500).json({ error: "Failed to create email" });
//   }
// });

// // Get emails
// router.get("/", async (req, res) => {
//   const accountId = parseInt(req.query.accountId);

//   try {
//     const emails = await prisma.email.findMany({
//       where: accountId ? { accountId } : {},
//       orderBy: { date: "desc" },
//       take: 50,
//       include: { account: true },
//     });

//     res.json(emails);
//   } catch (err) {
//     console.error("Error fetching emails:", err);
//     res.status(500).json({ error: "Failed to fetch emails" });
//   }
// });

// // Get single email
// router.get("/:id", async (req, res) => {
//   try {
//     const email = await prisma.email.findUnique({
//       where: { id: parseInt(req.params.id) },
//       include: { account: true },
//     });

//     if (!email) return res.status(404).json({ error: "Email not found" });

//     res.json(email);
//   } catch (err) {
//     console.error("Error fetching email:", err);
//     res.status(500).json({ error: "Failed to fetch email" });
//   }
// });

// export default router;
