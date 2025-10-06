// server/src/routes/savedReplies.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js"; // ✅ use central client
import { protect } from "../middleware/authMiddleware.js"; // ✅ secure multi-user
const router = express.Router();

// -------------------- GET ALL SAVED REPLIES (User Only) --------------------
router.get("/", protect, async (req, res) => {
    try {
        const replies = await prisma.savedReply.findMany({
            where: { ownerId: req.user.id }, // ✅ only user's replies
            orderBy: { createdAt: "desc" }, // optional: newest first
        });
        res.json(replies);
    } catch (err) {
        console.error("❌ Error fetching saved replies:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// -------------------- CREATE NEW SAVED REPLY --------------------
router.post("/", protect, async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: "Title and body are required" });
        }

        const reply = await prisma.savedReply.create({
            data: {
                title,
                body,
                ownerId: req.user.id, // ✅ enforce logged-in user as owner
            },
        });

        res.status(201).json(reply);
    } catch (err) {
        console.error("❌ Error creating saved reply:", err);
        res.status(500).json({ error: "Failed to create saved reply" });
    }
});

export default router;

// // server/src/routes/savedReplies.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const router = express.Router();

// router.get("/", async (req, res) => {
//     const replies = await prisma.savedReply.findMany();
//     res.json(replies);
// });

// router.post("/", async (req, res) => {
//     const { title, body, ownerId } = req.body;
//     const r = await prisma.savedReply.create({ data: { title, body, ownerId } });
//     res.status(201).json(r);
// });

// export default router;
