import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Key } from 'lucide-react';
import authService from '../../services/authService';

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword) {
            alert("Please enter both current and new passwords.");
            return;
        }

        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Change Password</h2>
                </div>

                <div className="space-y-6">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Current Password
                        </label>
                        <div className="relative group/input">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-gray-400/10 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition duration-300"></div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <Key className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showOldPassword ? "text" : "password"}
                                    placeholder="Enter current password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:border-white/30 focus:bg-black/50 focus:outline-none transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            New Password
                        </label>
                        <div className="relative group/input">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-gray-400/10 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition duration-300"></div>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:border-white/30 focus:bg-black/50 focus:outline-none transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !oldPassword || !newPassword}
                        className="group/btn relative w-full overflow-hidden bg-white/5 hover:bg-white/10 disabled:bg-gray-500/20 border border-white/20 hover:border-white/40 disabled:border-gray-500/20 text-white disabled:text-gray-400 py-4 px-6 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                    >
                        <div className="relative flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                    <span>Updating Password...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>Update Password</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>

                {/* Security Tips */}
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-sm font-semibold text-white mb-2">Password Security Tips</h3>
                    <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Use at least 8 characters with mixed case, numbers, and symbols</li>
                        <li>• Avoid using personal information or common words</li>
                        <li>• Don't reuse passwords from other accounts</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;