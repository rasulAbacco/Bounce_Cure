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

const TopNavbar = ({ toggleSidebar, pageName }) => {
  const { preferences, allNotifications } = useNotificationContext();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();


  // ✅ Filter notifications based on preferences
  const notifications = allNotifications.filter((n) => preferences[n.type]);

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (confirmed) {
      localStorage.clear();
      setUser({ name: "", email: "", profileImage: "" }); // clear context
      navigate("/");
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

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.filter((n) => n.unread).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {/* {notifications.filter((n) => n.unread).length} */}
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-black backdrop-blur-lg border border-white/50 rounded-lg shadow-xl">
                <div className="p-3 border-b border-white/10">
                  <h3 className="text-white font-semibold">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 border-b border-white/5 hover:bg-white/5"
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? "bg-blue-500" : "bg-gray-500"
                            }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-white">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                    <span className="font-bold" >Logout</span>
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
