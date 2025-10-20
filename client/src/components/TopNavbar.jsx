import React, { useState, useContext,useEffect  } from "react";
import { Bell, Menu, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { useNotificationContext } from "./NotificationContext";
import { getCurrentPlanFeatures } from "../utils/PlanAccessControl";

const TopNavbar = ({ toggleSidebar, pageName }) => {
  const { preferences, allNotifications, markAsRead, deleteNotification } =
    useNotificationContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();


  // 🩵 Initialize Free Plan defaults if missing
useEffect(() => {
  const planName =
    localStorage.getItem("planName") ||
    localStorage.getItem("userPlan") ||
    "Free";

  const hasVerifications = localStorage.getItem("emailVerificationCredits");
  const hasEmails = localStorage.getItem("totalEmails");

  if (!hasVerifications && planName.toLowerCase() === "free") {
    console.log("🆕 Setting default Free Plan counts...");
    localStorage.setItem("emailVerificationCredits", 50);
    localStorage.setItem("totalEmails", 50);
  }
}, []);

useEffect(() => {
  const syncCredits = () => {
    setCredits({
      emails: parseInt(localStorage.getItem("totalEmails")) || 0,
      verifications: parseInt(localStorage.getItem("emailVerificationCredits")) || 0,
    });
  };
  window.addEventListener("storage", syncCredits);
  return () => window.removeEventListener("storage", syncCredits);
}, []);


  // ===== Load totals =====
  const totalEmails = parseInt(localStorage.getItem("totalEmails")) || 0;
  const totalVerifications =
    localStorage.getItem("emailVerificationCredits") === "Unlimited"
      ? "Unlimited"
      : parseInt(localStorage.getItem("emailVerificationCredits")) || 0;

  const notifications = allNotifications.filter((n) => preferences[n.type]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.clear();
      setUser({ name: "", email: "", profileImage: "" });
      navigate("/");
    }
  };

  const handleClearAllNotifications = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      notifications.forEach((n) => deleteNotification(n.id));
    }
  };

  
  return (
    <div className="relative">
      <nav className="fixed top-0 left-0 right-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between z-50">
        {/* Left */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white">
            {pageName}
          </h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Totals Display */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs bg-[#c2831f] text-black px-2 py-0.5 rounded-full font-medium">
              {user.plan || "Free"} Plan
            </span>

            <span className="text-xs text-gray-400">
              {totalVerifications
                ? totalVerifications === "Unlimited"
                  ? "Unlimited Email Verifications"
                  : `${totalVerifications} Email Verifications`
                : "0 Email Verifications"}
            </span>

            <span className="text-xs text-gray-400">
              {totalEmails
                ? totalEmails === "Unlimited"
                  ? "Unlimited Send Emails"
                  : `${totalEmails} Send Emails`
                : "0 Send Emails"}
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
              <div className="absolute right-0 top-12 w-72 bg-black border border-white/50 rounded-lg shadow-xl">
                <div className="p-3 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-white font-semibold">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 border-b border-white/5 hover:bg-white/5 ${
                          n.unread ? "bg-blue-900/20" : ""
                        }`}
                      >
                        <p className="text-sm text-white">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
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

          {/* Profile */}
          <div className="relative z-[999]">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
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
              <div className="absolute right-3 top-14 bg-black border border-white/50 rounded-lg shadow-xl">
                <div className="p-2">
                  <Link
                    to="/auth"
                    className="flex items-center text-white hover:bg-white/10 p-2 rounded-lg"
                  >
                    <User className="w-4 h-4" />
                    <span className="ml-2">Profile</span>
                  </Link>
                  <hr className="border-white/80 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:bg-white/10 p-2 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="ml-2 font-bold">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopNavbar;
