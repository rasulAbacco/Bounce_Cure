// client/src/components/UserContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    profileImage: '',
    plan: 'Free',
    contactLimit: 50,
    emailLimit: 50,
    contactsUsed: 0,
    contactsRemaining: 50,
  });

  // Utility functions
  const getUserPlan = () => localStorage.getItem('userPlan') || 'Free';

  const getCurrentPlanFeatures = () => {
    const features = JSON.parse(localStorage.getItem('planFeatures') || '{}');
    return features.maxContacts ? features : { maxContacts: 50, maxEmails: 50 };
  };

  const getContactUsage = () => {
    const usage = JSON.parse(localStorage.getItem('contactUsage') || '{}');
    return usage.used !== undefined ? usage : { used: 0, remaining: 50 };
  };

  const loadUserData = () => {
    try {
      const userName = localStorage.getItem('userName') || '';
      const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';
      const profileImage = localStorage.getItem('profileImage') || '';
      const planName = getUserPlan();
      const planFeatures = getCurrentPlanFeatures();
      const contactUsage = getContactUsage();

      const newUser = {
        name: userName,
        email: userEmail,
        profileImage,
        plan: planName,
        contactLimit: planFeatures.maxContacts,
        emailLimit: planFeatures.maxEmails,
        contactsUsed: contactUsage.used,
        contactsRemaining: contactUsage.remaining,
      };

      // 🧩 Sync critical plan details for CRM access
      if (planName) {
        localStorage.setItem('userPlan', planName);
      }
      if (!localStorage.getItem('planStatus')) {
        localStorage.setItem('planStatus', 'active');
      }
      if (!localStorage.getItem('hasPurchasedBefore')) {
        localStorage.setItem('hasPurchasedBefore', planName !== 'Free' ? 'true' : 'false');
      }

      setUser(prev => JSON.stringify(prev) !== JSON.stringify(newUser) ? newUser : prev);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUserData();

    // Cross-tab sync
    const handleStorageChange = (e) => {
      if (['userPlan', 'planFeatures', 'contactUsage', 'userName', 'userEmail', 'profileImage'].includes(e.key)) {
        loadUserData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll every 30s to refresh state
    const interval = setInterval(loadUserData, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Manual refresh
  const refreshUserData = () => {
    loadUserData();
    console.log('🔄 User data refreshed');
  };

  // 🧠 Sync plan info automatically whenever user state updates
  useEffect(() => {
    if (user?.plan) {
      localStorage.setItem('userPlan', user.plan);
      localStorage.setItem('planStatus', user.plan === 'Expired' ? 'expired' : 'active');
      localStorage.setItem('hasPurchasedBefore', user.plan !== 'Free' ? 'true' : 'false');
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};
