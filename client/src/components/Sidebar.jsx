// client/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import {
    Users, Mail, HelpCircle,
    BarChart3, Shield, Wrench, PenTool, Zap,
    UserCheck, Home, X, Lock
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { hasCRMAccess, getUserPlan } from '../utils/PlanAccessControl';

const Sidebar = ({ isOpen, toggleSidebar, pageName }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState('Free');
    const [crmAccess, setCrmAccess] = useState(false);

    useEffect(() => {
        // Function to load and check plan
        const loadPlan = () => {
            const plan = getUserPlan();
            const access = hasCRMAccess();
            
            console.log('🔍 Sidebar - Current Plan:', plan);
            console.log('🔍 Sidebar - CRM Access:', access);
            
            setUserPlan(plan);
            setCrmAccess(access);
        };

        // Load on mount
        loadPlan();

        // Listen for storage changes (plan updates)
        const handleStorageChange = (e) => {
            if (e.key === 'userPlan') {
                console.log('📢 Plan changed in sidebar:', e.newValue);
                loadPlan();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard', requiresCRM: false },
        { id: 'CRM', label: 'CRM', icon: Users, path: '/contacts', requiresCRM: true },
        { id: 'builder', label: 'Email Campaign', icon: PenTool, path: '/email-campaign', requiresCRM: false },
        { id: 'multimedia', label: 'Multimedia Campaigns', icon: Wrench, path: '/MultimediaCampaign', requiresCRM: false },
        { id: 'automation', label: 'Automation', icon: Zap, path: '/automation', requiresCRM: false },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', requiresCRM: false },
        { id: 'verification', label: 'Email Verification', icon: UserCheck, path: '/verification', requiresCRM: false },
        { id: 'auth', label: 'User Authentication', icon: Shield, path: '/auth', requiresCRM: false },
        { id: 'support', label: 'Help & Support', icon: HelpCircle, path: '/support', requiresCRM: false },
    ];

    const handleNavigation = (item) => {
        // Check if CRM access is required and user doesn't have it
        if (item.requiresCRM && !crmAccess) {
            console.log('🔒 CRM access denied, redirecting to pricing');
            // Show upgrade prompt and redirect to pricing
            navigate('/pricingdash', { 
                state: { 
                    message: 'Upgrade to Standard or Premium plan to access CRM features',
                    requiredFeature: 'CRM'
                } 
            });
            toggleSidebar();
            return;
        }

        // Normal navigation
        pageName(item.label);
        toggleSidebar();
    };

    return (
        <div>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className={`fixed left-0 top-0 h-full w-70 bg-white/10 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ease-in-out z-30 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center space-x-3 mt-15">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-[0_4px_10px_rgba(255,215,0,0.7)]">
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

                {/* Sidebar Navigation - Scrollable */}
                <nav className="mt-6 px-4 overflow-y-auto flex-grow">
                    <ul className="space-y-2 pb-4">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = location.pathname === item.path;
                            const isLocked = item.requiresCRM && !crmAccess;

                            return (
                                <li key={item.id}>
                                    {isLocked ? (
                                        // Locked item - show as button with lock icon
                                        <button
                                            onClick={() => handleNavigation(item)}
                                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-400 hover:bg-white/5 hover:text-gray-300 cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <IconComponent className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            <Lock className="w-4 h-4 text-yellow-500" />
                                        </button>
                                    ) : (
                                        // Normal accessible item
                                        <Link
                                            to={item.path}
                                            onClick={() => handleNavigation(item)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-black/30 backdrop-blur-md border border-white/30 text-white p-2 bg-gradient-to-r from-yellow-400/20 via-yellow-300/10 to-yellow-400/20'
                                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/10">
                    {/* Current Plan Badge */}
                    <div className="mb-3 px-4 py-2 bg-black/20 rounded-lg border border-white/20">
                        <p className="text-xs text-gray-400">Current Plan</p>
                        <p className="text-sm font-semibold text-white">{userPlan}</p>
                    </div>

                    {/* Upgrade CTA */}
                    <div className="bg-black/30 backdrop-blur-md border border-white/30 rounded-lg text-white p-2 bg-gradient-to-r from-yellow-400/20 via-yellow-300/10 to-yellow-400/20">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center shadow-[0_4px_10px_rgba(255,215,0,0.7)]">
                                <Wrench className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">
                                    <Link to="/pricingdash">Upgrade Plan</Link>
                                </p>
                                <p className="text-gray-400 text-xs">Unlock premium features</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;