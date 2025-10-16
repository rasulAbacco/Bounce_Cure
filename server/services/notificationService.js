// server/services/notificationService.js
import { prisma } from "../prisma/prismaClient.js";
import nodemailer from "nodemailer";

/**
 * Send in-app and/or email notification.
 * If userId is null, only email is sent.
 */
export async function sendNotification(userId, { subject, message, to }) {
  try {
    // ✅ In-app notification (only if userId exists)
    if (userId) {
      await prisma.inAppNotification.create({
        data: {
          userId,
          subject,
          message,
          read: false,
        },
      });
      console.log(`📩 In-app notification created for user ${userId}`);
    } else {
      console.log("⚠️ Skipping in-app notification (no valid userId)");
    }

    // ✅ Email notification (only if 'to' is provided)
    if (to) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"Bounce Cure" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        html: `<p>${message}</p>`,
      });

      console.log(`📧 Email sent to ${to}`);
    }
  } catch (err) {
    console.error("❌ sendNotification error:", err);
  }
}

/**
 * Get all in-app notifications for a user
 */
export async function getUserNotifications(userId) {
  try {
    return await prisma.inAppNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("❌ getUserNotifications error:", err);
    return [];
  }
}

/**
 * Mark one notification as read
 */
export async function markNotificationAsRead(id, userId) {
  try {
    const notification = await prisma.inAppNotification.findFirst({
      where: { id, userId },
    });

    if (!notification) return null;

    return await prisma.inAppNotification.update({
      where: { id },
      data: { read: true },
    });
  } catch (err) {
    console.error("❌ markNotificationAsRead error:", err);
    return null;
  }
}
