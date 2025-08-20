import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function notificationMiddleware(req, res, next) {
  try {
    // 👇 normally you'd have auth middleware that sets req.userId
    // for testing we hardcode a demo userId (replace with real auth)
    if (!req.userId) {
      req.userId = 1;
    }

    // load notification settings or create default
    let settings = await prisma.notificationSetting.findUnique({
      where: { userId: req.userId },
    });

    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          userId: req.userId,
          email: true,
          sms: false,
          push: true,
          inApp: true,
          frequency: "daily",
        },
      });
    }

    req.notificationSettings = settings;
    next();
  } catch (err) {
    console.error("Notification middleware error:", err);
    res.status(500).json({ error: "Failed to load notification settings" });
  }
}
