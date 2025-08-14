import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import EmailVerification from '../../components/auth/EmailVerification';
import ChangePassword from '../../components/auth/ChangePassword';
import TwoFactorAuth from '../../components/auth/TwoFactorAuth';
import SecurityLogs from '../../components/auth/SecurityLogs';
import ActiveSessions from '../../components/auth/ActiveSessions';
import UserProfile from '../../components/UserProfile';
const UserAuthentication = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8 mt-[5%]">
        <h1 className="text-3xl font-bold text-white mt-[5%] sm:mt-0">User Authentication & Security</h1>
        <UserProfile />
        <EmailVerification />
        <ChangePassword />
        <TwoFactorAuth />
        <SecurityLogs />
        <ActiveSessions />
      </div>
    </DashboardLayout>
  );
};

export default UserAuthentication;
