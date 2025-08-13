import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import authService from '../../services/authService';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword) {
            alert("Please enter both current and new passwords.");
            return;
        }

        try {
            await authService.changePassword(oldPassword, newPassword);
            alert('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message || 'Failed to change password');
            } else {
                alert('Network error');
            }
        }
    };



    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
                <Lock className="text-purple-400 w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">Change Password</h2>
            </div>
            <div className="mt-4 space-y-3">
                <input
                    type="password"
                    placeholder="Current Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                />
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                    Update Password
                </button>
            </div>
        </div>
    );
};

export default ChangePassword;
