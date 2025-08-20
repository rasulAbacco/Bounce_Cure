import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Save new push subscription
router.post("/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;

  if (!userId || !subscription) {
    return res.status(400).json({ error: "userId and subscription required" });
  }

  try {
    await prisma.pushSubscription.create({
      data: {
        userId,
        subscription: JSON.stringify(subscription), // store as string
      },
    });
    res.json({ success: true, message: "Subscription saved" });
  } catch (err) {
    console.error("Error saving subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

export default router;
