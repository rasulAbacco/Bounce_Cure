import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";
import { sendNotification } from "../services/notificationService.js";  // ✅ notification service

const router = express.Router();
const prisma = new PrismaClient();

//
// ---------------- Notification Settings (email, sms, push only) ----------------
//
const notifSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  frequency: z.enum(["instant", "daily", "weekly"]),
});

// Get notification settings
router.get("/notifications", async (req, res) => {
  try {
    const userId = req.userId;
    const setting = await prisma.notificationSetting.findUnique({ where: { userId } });

    res.json(
      setting || { email: true, sms: false, push: false, frequency: "daily" }
    );
  } catch (err) {
    console.error("GET /notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notification settings" });
  }
});

// Update notification settings
router.put("/notifications", async (req, res) => {
  try {
    const parsed = notifSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const saved = await prisma.notificationSetting.upsert({
      where: { userId: req.userId },
      update: parsed.data,
      create: { userId: req.userId, ...parsed.data },
    });

    res.json(saved);
  } catch (err) {
    console.error("PUT /notifications error:", err);
    res.status(500).json({ error: "Failed to update notification settings" });
  }
});

//
// ---------------- API Keys ----------------
//
function generateKey() {
  return "sk-" + crypto.randomBytes(20).toString("hex");
}
function maskKey(k) {
  return k.slice(0, 6) + "..." + k.slice(-4);
}

// Get all API keys
router.get("/apikeys", async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(keys.map(k => ({ ...k, value: maskKey(k.key) })));
  } catch (err) {
    console.error("GET /apikeys error:", err);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// ✅ Create a new API key (send notifications: email + sms + push + in-app)
router.post("/apikeys", async (req, res) => {
  try {
    const name = (req.body?.name || "New Key").toString().slice(0, 64);
    const value = generateKey();
    const created = await prisma.apiKey.create({
      data: { name, key: value, userId: req.userId },
    });

    // 🔔 Send notification via all enabled channels
    await sendNotification(req.userId, {
      subject: "New API Key Created",
      message: `Your API key "${name}" was created successfully.`,
    });

    res.status(201).json({ ...created, value });
  } catch (err) {
    console.error("POST /apikeys error:", err);
    res.status(500).json({ error: "Failed to create API key" });
  }
});



// Save a new push subscription
router.post("/push-subscribe", async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: "Subscription is required" });
    }

    await prisma.pushSubscription.create({
      data: {
        userId: req.userId,
        subscription: JSON.stringify(subscription), // save subscription JSON
      },
    });

    res.json({ message: "Push subscription saved" });
  } catch (err) {
    console.error("POST /push-subscribe error:", err);
    res.status(500).json({ error: "Failed to save push subscription" });
  }
});

// Revoke an API key
router.delete("/apikeys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.apiKey.findFirst({ where: { id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: "Key not found" });

    await prisma.apiKey.update({ where: { id }, data: { revoked: true } });

    // 🔔 Send notification for revoked key
    await sendNotification(req.userId, {
      subject: "API Key Revoked",
      message: `Your API key "${existing.name}" has been revoked.`,
    });

    res.json({ message: "Key revoked" });
  } catch (err) {
    console.error("DELETE /apikeys/:id error:", err);
    res.status(500).json({ error: "Failed to revoke API key" });
  }
});

//
// ---------------- Danger Zone (Delete Account) ----------------
//
router.delete("/delete-account", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    await prisma.$transaction(async tx => {
      await tx.apiKey.deleteMany({ where: { userId: req.userId } }).catch(() => {});
      await tx.notificationSetting.delete({ where: { userId: req.userId } }).catch(() => {});
      await tx.session.deleteMany({ where: { userId: req.userId } }).catch(() => {});
      await tx.loginLog.deleteMany({ where: { userId: req.userId } }).catch(() => {});
      await tx.content.deleteMany({ where: { createdBy: req.userId } }).catch(() => {});
      await tx.deletedAccount.create({ data: { userEmail: user.email } });
      await tx.user.delete({ where: { id: req.userId } });
    });

    // 🔔 Send account deletion notification
    await sendNotification(req.userId, {
      subject: "Account Deleted",
      message: "Your account has been permanently deleted.",
    });

    res.json({ message: "Account deleted" });
  } catch (e) {
    console.error("DELETE /delete-account error:", e);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
