import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

const pageNameMap = {
    '/dashboard': 'Dashboard',
    '/contacts': 'Contact Management',
    '/builder': 'Email Campaign',
    '/automation': 'Automation',
    '/analytics': 'Analytics',
    '/verification': 'Email Verification',
    '/settings': 'Settings',
    '/auth': 'User Authentication',
    '/support': 'Help & Support',
};

const DashboardLayout = ({ children }) => {
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageName, setPageName] = useState(pageNameMap[location.pathname] || 'Dashboard');

    useEffect(() => {
        // Update pageName when route changes
        setPageName(pageNameMap[location.pathname] || 'Dashboard');
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const handlePageChange = (newPageName) => {
        setPageName(newPageName);
        setSidebarOpen(false);
    };

    return (

 
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={toggleSidebar}
                pageName={handlePageChange}
            />

            <div className="flex-1 flex flex-col w-full">

                <TopNavbar toggleSidebar={toggleSidebar} pageName={pageName} />
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
