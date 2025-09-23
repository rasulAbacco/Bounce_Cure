import React, { createContext, useState, useContext, useEffect } from "react";

const NotificationContext = createContext();

// Load notifications from localStorage
const loadNotifications = () => {
  try {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      return JSON.parse(savedNotifications);
    }
  } catch (error) {
    console.error("Error loading notifications from localStorage:", error);
  }
  
  // Default notifications if none are saved
  return [
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
    
    // Payment Notifications
    { id: 13, type: "payment", message: "Your payment was successful", time: "Just now", unread: true },
    { id: 14, type: "payment", message: "Your plan will renew in 7 days", time: "1 day ago", unread: false },
    
    // Slot Exhaustion Notification
    { id: 15, type: "slots_exhausted", message: "Your email slots are exhausted", time: "2 hours ago", unread: true },
    
    // Payment Success Notification
    { id: 16, type: "payment_success", message: "Payment successful! Plan activated with 10,000 email slots (9,950 new slots added).", time: "Just now", unread: true },
  ];
};

// Save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  } catch (error) {
    console.error("Error saving notifications to localStorage:", error);
  }
};

export const NotificationProvider = ({ children }) => {
  // Default preferences - now includes slots_exhausted and payment_success
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: false,
    inApp: false,
    payment: true,
    slots_exhausted: true,
    payment_success: true,
  });

  // State for notifications (now mutable and persistent)
  const [allNotifications, setAllNotifications] = useState(loadNotifications());

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    saveNotifications(allNotifications);
  }, [allNotifications]);

  // Function to mark notification as read
  const markAsRead = (id) => {
    setAllNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setAllNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, unread: false }))
    );
  };

  // Function to add a new notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(), // Unique ID based on timestamp
      unread: true,   // New notifications are unread by default
      time: "Just now", // Could be enhanced with actual time formatting
      ...notification  // Include all passed properties
    };
    
    console.log('Adding notification:', newNotification);
    
    setAllNotifications(prevNotifications => [
      newNotification, // Add new notification at the beginning
      ...prevNotifications
    ]);
  };

  // Function to delete a notification
  const deleteNotification = (id) => {
    setAllNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    );
  };

  // Function to delete all notifications
  const clearAllNotifications = () => {
    setAllNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        preferences, 
        setPreferences, 
        allNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        deleteNotification,   
        clearAllNotifications 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);