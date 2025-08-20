// services/notificationService.js
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";
import twilio from "twilio";

const prisma = new PrismaClient();

// Resend (Email)
const resend = new Resend(process.env.RESEND_API_KEY);

// Twilio (SMS)
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send notification via email, SMS, and in-app
 */
export async function sendNotification(userId, { subject, message }) {
  const settings = await prisma.notificationSetting.findUnique({
    where: { userId },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!settings) return;

  // ---- EMAIL ----
  if (settings.email && user?.email) {
    await resend.emails.send({
      from: "no-reply@yourapp.com",
      to: user.email,
      subject,
      html: `<p>${message}</p>`,
    });
  }

  // ---- SMS ----
  if (settings.sms && user?.phone) {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });
  }

  // ---- IN-APP ----
  await createInAppNotification(userId, subject, message);
}

/**
 * Create an in-app notification only
 */
export async function createInAppNotification(userId, title, message) {
  try {
    const notification = await prisma.inAppNotification.create({
      data: {
        userId,
        title,
        message,
        read: false,
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating in-app notification:", error);
    throw error;
  }
}

/**
 * Get all notifications for a user
 */
export async function getUserNotifications(userId) {
  return prisma.inAppNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  return prisma.inAppNotification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export default {
  sendNotification,
  createInAppNotification,
  getUserNotifications,
  markNotificationAsRead,
};
