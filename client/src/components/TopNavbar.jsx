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

const TopNavbar = ({ toggleSidebar, pageName }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, message: "New campaign completed", time: "2 min ago", unread: true },
    { id: 2, message: "Contact import finished", time: "1 hour ago", unread: true },
    { id: 3, message: "Weekly report ready", time: "3 hours ago", unread: false },
  ];

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
              {notifications.some((n) => n.unread) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 bg-gray-800/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
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
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.unread ? "bg-blue-500" : "bg-gray-500"
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
          <div className="relative">
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
              <div className="absolute right-0 top-14 bg-gray-800/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl">
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
                  <hr className="border-white/10 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 text-red-400 hover:bg-white/10 p-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
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
