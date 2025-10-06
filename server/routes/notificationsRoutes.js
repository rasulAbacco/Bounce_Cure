// server/routes/notificationsRoutes.js
import express from "express";
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../services/notificationService.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ Enforce auth

const router = express.Router();

// ----------------- SEND NOTIFICATION -----------------
// POST /api/notifications/send
router.post("/send", protect, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Attach to logged-in user
    await sendNotification(req.user.id, { subject, message });

    res.json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// ----------------- GET USER NOTIFICATIONS -----------------
// GET /api/notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ----------------- MARK AS READ -----------------
// PATCH /api/notifications/read/:id
router.patch("/read/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Only update if it belongs to this user
    const notification = await markNotificationAsRead(Number(id), req.user.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or not yours" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;

// // server/routes/notificationsRoutes.js
// import express from "express";
// import {
//   sendNotification,
//   getUserNotifications,
//   markNotificationAsRead,
// } from "../services/notificationService.js";
// const router = express.Router();

// // POST /api/notifications/send
// router.post("/send", async (req, res) => {
//   try {
//     const { userId, subject, message } = req.body;
//     if (!userId || !subject || !message) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }
//     await sendNotification(userId, { subject, message });
//     res.json({ success: true, message: "Notification sent" });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).json({ error: "Failed to send notification" });
//   }
// });

// // GET /api/notifications
// router.get("/", async (req, res) => {
//   try {
//     const notifications = await getUserNotifications(req.userId);
//     res.json(notifications);
//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     res.status(500).json({ error: "Failed to fetch notifications" });
//   }
// });

// // PATCH /api/notifications/read/:id
// router.patch("/read/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const notification = await markNotificationAsRead(Number(id));
//     res.json(notification);
//   } catch (error) {
//     console.error("Error marking notification as read:", error);
//     res.status(500).json({ error: "Failed to update notification" });
//   }
// });

// export default router;
