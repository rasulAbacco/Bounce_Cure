import express from "express";
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notificationService.js";

const router = express.Router();

// POST /notifications/send
router.post("/send", async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await sendNotification(userId, { subject, message });

    res.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// GET /notifications/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getUserNotifications(Number(userId));
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PATCH /notifications/read/:id
router.patch("/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationAsRead(Number(id));
    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
