import React, { createContext, useState, useContext } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  // ✅ Default preferences
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: false,
    inApp: false,
  });

  // ✅ Dummy notifications
const allNotifications = [
  // Email Notifications
  { id: 1, type: "email", message: "New email from HR", time: "2 min ago", unread: true },
  { id: 2, type: "email", message: "Monthly performance report available", time: "1 day ago", unread: false },
  { id: 3, type: "email", message: "Team meeting scheduled for Monday", time: "3 days ago", unread: true },

  // SMS Notifications
  { id: 4, type: "sms", message: "OTP: 123456", time: "5 min ago", unread: true },
  { id: 5, type: "sms", message: "Your package has been shipped", time: "6 hours ago", unread: false },
  { id: 6, type: "sms", message: "Your balance is below ₹500", time: "1 day ago", unread: true },

  // Push Notifications
  { id: 7, type: "push", message: "Flash Sale starts now!", time: "1 hour ago", unread: true },
  { id: 8, type: "push", message: "New update available. Tap to install.", time: "8 hours ago", unread: false },
  { id: 9, type: "push", message: "Weather alert: Heavy rain expected", time: "2 days ago", unread: true },

  // In-App Notifications
  { id: 10, type: "inApp", message: "You got a new friend request", time: "3 hours ago", unread: false },
  { id: 11, type: "inApp", message: "Your document was successfully uploaded", time: "1 day ago", unread: true },
  { id: 12, type: "inApp", message: "5 new comments on your post", time: "2 days ago", unread: true },
];


  return (
    <NotificationContext.Provider value={{ preferences, setPreferences, allNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);
