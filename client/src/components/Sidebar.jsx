import React from 'react';
import {
    Users, Mail, HelpCircle,
    BarChart3, Cog, Shield, Wrench, PenTool, Zap,
    UserCheck, Home, X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation(); // get current path

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
        { id: 'contacts', label: 'Contact Management', icon: Users, path: '/contacts' },
        { id: 'builder', label: 'Email Campaign', icon: PenTool, path: '/builder' },
        { id: 'automation', label: 'Automation', icon: Zap, path: '/automation' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
        { id: 'verification', label: 'Email Verification', icon: UserCheck, path: '/verification' },
        { id: 'settings', label: 'Settings', icon: Cog, path: '/settings' },
        { id: 'auth', label: 'User Authentication', icon: Shield, path: '/auth' },
        { id: 'support', label: 'Help & Support', icon: HelpCircle, path: '/support' },
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className={`fixed left-0 top-0 h-full w-65 bg-white/10 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3 mt-[32%]">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">B@unce Cure</span>
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className="text-white hover:bg-white/10 p-1 rounded lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-6 px-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path; // highlight based on current path

                            return (
                                <li key={item.id}>
                                    <Link
                                        to={item.path}
                                        onClick={toggleSidebar} // close sidebar on mobile
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Upgrade Plan</p>
                                <p className="text-gray-400 text-xs">Unlock premium features</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
