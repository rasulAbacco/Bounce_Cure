// server/src/routes/savedReplies.js
import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();

router.get("/", async (req, res) => {
    const replies = await prisma.savedReply.findMany();
    res.json(replies);
});

router.post("/", async (req, res) => {
    const { title, body, ownerId } = req.body;
    const r = await prisma.savedReply.create({ data: { title, body, ownerId } });
    res.status(201).json(r);
});

export default router;
