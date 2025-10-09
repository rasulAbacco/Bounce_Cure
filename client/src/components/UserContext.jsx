// client/src/components/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { getUserPlan, getCurrentPlanFeatures, getContactUsage } from '../utils/PlanAccessControl';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        name: '',
        email: '',
        profileImage: '',
        plan: 'Free',
        contactLimit: 500,
        emailLimit: 1000,
        contactsUsed: 0,
        contactsRemaining: 500
    });

    // Load user data from localStorage on mount
    useEffect(() => {
        const loadUserData = () => {
            try {
                // Get basic user info
                const userName = localStorage.getItem('userName') || '';
                const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
                const profileImage = localStorage.getItem('profileImage') || '';
                
                // Get plan information
                const planName = getUserPlan();
                const planFeatures = getCurrentPlanFeatures();
                const contactUsage = getContactUsage();
                
                console.log('📊 Loading user data:', {
                    plan: planName,
                    features: planFeatures,
                    usage: contactUsage
                });
                
                setUser({
                    name: userName,
                    email: userEmail,
                    profileImage: profileImage,
                    plan: planName,
                    contactLimit: planFeatures.maxContacts,
                    emailLimit: planFeatures.maxEmails,
                    contactsUsed: contactUsage.used,
                    contactsRemaining: contactUsage.remaining
                });
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();

        // Set up event listener for storage changes (for cross-tab sync)
        const handleStorageChange = (e) => {
            if (e.key === 'userPlan' || e.key === 'totalContacts' || e.key === 'usedContacts') {
                console.log('🔄 Storage changed, reloading user data');
                loadUserData();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Poll for updates every 30 seconds
        const interval = setInterval(loadUserData, 30000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    // Method to manually refresh user data
    const refreshUserData = () => {
        const planName = getUserPlan();
        const planFeatures = getCurrentPlanFeatures();
        const contactUsage = getContactUsage();
        
        setUser(prev => ({
            ...prev,
            plan: planName,
            contactLimit: planFeatures.maxContacts,
            emailLimit: planFeatures.maxEmails,
            contactsUsed: contactUsage.used,
            contactsRemaining: contactUsage.remaining
        }));
        
        console.log('🔄 User data refreshed');
    };

    return (
        <UserContext.Provider value={{ user, setUser, refreshUserData }}>
            {children}
        </UserContext.Provider>
    );
};