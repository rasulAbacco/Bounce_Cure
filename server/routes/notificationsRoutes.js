// server/routes/notificationsRoutes.js
import express from "express";
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notificationService.js";
import { protect } from "../middleware/authMiddleware.js";
import { prisma } from "../prisma/prismaClient.js"; // ✅ FIXED: Import Prisma

const router = express.Router();

//
// ---------------- SEND NOTIFICATION ----------------
// POST /api/notifications/send
//
router.post("/send", protect, async (req, res) => {
  try {
    const { subject, message, to } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Missing required fields: subject or message" });
    }

    // ✅ Use userId from token, allow optional `to` for email
    await sendNotification(req.user.id, { subject, message, to });

    return res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).json({ error: "Failed to send notification" });
  }
});

//
// ---------------- GET USER NOTIFICATIONS ----------------
// GET /api/notifications
//
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);

    return res.json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

//
// ---------------- MARK AS READ ----------------
// PATCH /api/notifications/read/:id
//
router.patch("/read/:id", protect, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const notification = await markNotificationAsRead(id, req.user.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or not authorized" });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return res.status(500).json({ error: "Failed to update notification" });
  }
});

//
// ---------------- CLEAR ALL ----------------
// DELETE /api/notifications/clear
//
router.delete("/clear", protect, async (req, res) => {
  try {
    // ✅ Properly access Prisma client now
    await prisma.inAppNotification.deleteMany({
      where: { userId: req.user.id },
    });

    return res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    console.error("❌ Error clearing notifications:", error);
    return res.status(500).json({ error: "Failed to clear notifications" });
  }
});

export default router;
