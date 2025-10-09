// src/components/TopNavbar.jsx
import React, { useState, useContext } from "react";
import {
  Bell,
  Menu,
  Search,
  Settings,
  LogOut,
  User,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useNotificationContext } from "./NotificationContext";
import { getCurrentPlanFeatures } from '../utils/PlanAccessControl';

const TopNavbar = ({ toggleSidebar, pageName }) => {
  const { preferences, allNotifications, markAsRead, deleteNotification } = useNotificationContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const planFeatures = getCurrentPlanFeatures();
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  
  // Get purchased contact count from localStorage
  const purchasedContacts = parseInt(localStorage.getItem('totalContacts')) || 0;
  const purchasedEmails = parseInt(localStorage.getItem('totalEmails')) || 0;

  // Filter notifications based on preferences
  const notifications = allNotifications.filter((n) => {
    const shouldShow = preferences[n.type];
    return shouldShow;
  });

  // Count unread notifications
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.clear();
      setUser({ name: "", email: "", profileImage: "" });
      navigate("/");
    }
  };

  const handleNotificationClick = (id) => {
    markAsRead(id);
  };

  const handleClearAllNotifications = () => {
    const confirmed = window.confirm("Are you sure you want to clear all notifications?");
    if (confirmed) {
      notifications.forEach(notification => {
        deleteNotification(notification.id);
      });
    }
  };

  return (
    <div className="relative">
      <nav className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between z-50">
        {/* Left Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white">{pageName}</h1>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns, contacts..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Search Button */}
          <button
            className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
           <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-[#c2831f] text-black px-2 py-0.5 rounded-full font-medium">
                    {user.plan} Plan
                  </span>
                  <span className="text-xs text-gray-400">
                    {purchasedContacts > 0 ? purchasedContacts.toLocaleString() : (user.contactLimit === Infinity ? 'Unlimited' : user.contactLimit)} Contacts
                  </span>
                  <span className="text-xs text-gray-400">
                    {purchasedEmails > 0 ? purchasedEmails.toLocaleString() : (user.emailLimit === Infinity ? 'Unlimited' : user.emailLimit)} Emails
                  </span>
                </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-black backdrop-blur-lg border border-white/50 rounded-lg shadow-xl">
                <div className="p-3 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  <div className="flex space-x-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          notifications.forEach(n => markAsRead(n.id));
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Mark all as read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearAllNotifications}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${notification.unread ? 'bg-blue-900/20' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3" onClick={() => handleNotificationClick(notification.id)}>
                            <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? "bg-blue-500" : "bg-gray-500"}`}></div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-red-500 text-xs hover:text-red-400 ml-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400 text-sm">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative z-[999]">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 sm:space-x-3 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}

              <div className="hidden md:block text-left">
                {user.name && <p className="text-sm font-medium">{user.name}</p>}
                {user.email && (
                  <p className="text-xs text-[#c2831f]">{user.email}</p>
                )}
              </div>
              
            </button>
            

            {showProfileMenu && (
              <div className="absolute right-3 w-[70%] min-w-30 top-17 z-[999] bg-black backdrop-blur-lg border border-white/50 rounded-lg shadow-xl">
                <div className="p-2">
                  <Link
                    to="/auth"
                    className="w-full flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="w-full flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-white/80 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 text-red-600 hover:bg-white/10 p-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 font-bold" />
                    <span className="font-bold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="fixed top-14 left-0 right-0 bg-white/10 mt-3 backdrop-blur-lg px-4 py-2 z-40 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns, contacts..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopNavbar;