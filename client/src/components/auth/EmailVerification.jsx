// client/src/components/auth/EmailVerification.jsx
import React, { useState } from 'react';
import { MailCheck, MailWarning, Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import authService from '../../services/authService';
import toast from "react-hot-toast";
const EmailVerification = () => {
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendVerification = async () => {
        setLoading(true);
        try {
            await authService.sendVerificationLink();
            toast.success("Verification email sent!");
        } catch (error) {
            toast.error('Failed to send verification email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg backdrop-blur-sm ${status ? 'bg-green-500/10' : 'bg-yellow-500/10'
                        }`}>
                        {status ? (
                            <MailCheck className="w-6 h-6 text-green-400" />
                        ) : (
                            <MailWarning className="w-6 h-6 text-yellow-400" />
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white">Email Verification</h2>
                </div>

                {/* Status Card */}
                <div className={`relative rounded-xl p-6 mb-6 border ${status
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${status ? 'bg-green-500/10' : 'bg-yellow-500/10'
                            }`}>
                            {status ? (
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            ) : (
                                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className={`text-lg font-semibold mb-2 ${status ? 'text-green-400' : 'text-yellow-400'
                                }`}>
                                {status ? 'Email Verified' : 'Email Not Verified'}
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                                {status
                                    ? 'Your email address has been successfully verified. Your account is fully secured.'
                                    : 'Your email address needs to be verified to secure your account and enable all features.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                {!status && (
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <h3 className="text-lg font-semibold text-white">Send Verification Email</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Click the button below to receive a verification link in your email inbox.
                            </p>
                            <button
                                onClick={sendVerification}
                                disabled={loading}
                                className="group/btn relative overflow-hidden bg-white/5 hover:bg-white/10 disabled:bg-gray-500/20 border border-white/20 hover:border-white/40 disabled:border-gray-500/20 text-white disabled:text-gray-400 py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span>Send Verification Email</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-white mb-2">Need Help?</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Check your spam/junk folder if you don't see the email</li>
                                <li>• Make sure your email address is correct in your profile</li>
                                <li>• The verification link will expire in 24 hours</li>
                                <li>• Contact support if you continue having issues</li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Verified State */}
                {status && (
                    <div className="text-center py-6">
                        <div className="inline-flex items-center gap-2 text-green-400 font-semibold">
                            <CheckCircle className="w-5 h-5" />
                            <span>Your account is fully verified and secure</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification;