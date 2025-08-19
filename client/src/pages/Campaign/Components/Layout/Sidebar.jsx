import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: "/email-campaign", label: "Dashboard" },
        { path: "/create", label: "Create Campaign" },
    ];

    return (
        <aside className="w-56 bg-gray-900 text-white flex flex-col">
            <div className="h-14 flex items-center justify-center text-xl font-bold border-b border-gray-700">
                Logo
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-3 py-2 rounded ${location.pathname === item.path
                            ? "bg-blue-600"
                            : "hover:bg-gray-700"
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
