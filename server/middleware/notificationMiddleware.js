// middleware/notificationMiddleware.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function notificationMiddleware(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    // Try to get the user’s notification settings
    let settings = await prisma.notificationSetting.findUnique({
      where: { userId },
    });

    // If not found, create default settings
    if (!settings) {
      settings = await prisma.notificationSetting.create({
        data: {
          userId,
          email: true,
          sms: false,
          push: true,
          inApp: false,
          frequency: "daily",
        },
      });
    }

    // Attach to request for downstream routes
    req.notificationSettings = settings;
    next();
  } catch (err) {
    console.error("Notification middleware error:", err);
    res.status(500).json({ error: "Failed to load notification settings" });
  }
}
