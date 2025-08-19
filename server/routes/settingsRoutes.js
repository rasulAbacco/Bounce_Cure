import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import crypto from "crypto";

const router = express.Router();
const prisma = new PrismaClient();

//
// ---------------- Notification Settings ----------------
//
const notifSchema = z.object({
  email: z.boolean(),
  sms: z.boolean(),
  push: z.boolean(),
  inApp: z.boolean(),
  frequency: z.enum(["instant", "daily", "weekly"]),
});

// Get notification settings
router.get("/notifications", async (req, res) => {
  const userId = req.userId;
  const setting = await prisma.notificationSetting.findUnique({ where: { userId } });
  res.json(
    setting || { email: true, sms: false, push: true, inApp: false, frequency: "daily" }
  );
});

// Update notification settings
router.put("/notifications", async (req, res) => {
  const parsed = notifSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const saved = await prisma.notificationSetting.upsert({
    where: { userId: req.userId },
    update: parsed.data,
    create: { userId: req.userId, ...parsed.data },
  });
  res.json(saved);
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
  const keys = await prisma.apiKey.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(keys.map(k => ({ ...k, value: maskKey(k.key) })));
});

// Create a new API key
router.post("/apikeys", async (req, res) => {
  const name = (req.body?.name || "New Key").toString().slice(0, 64);
  const value = generateKey();
  const created = await prisma.apiKey.create({
    data: { name, key: value, userId: req.userId },
  });
  res.status(201).json({ ...created, value }); // full key only on create
});

// Revoke an API key
router.delete("/apikeys/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.apiKey.findFirst({ where: { id, userId: req.userId } });
  if (!existing) return res.status(404).json({ error: "Key not found" });

  await prisma.apiKey.update({ where: { id }, data: { revoked: true } });
  res.json({ message: "Key revoked" });
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

    res.json({ message: "Account deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
