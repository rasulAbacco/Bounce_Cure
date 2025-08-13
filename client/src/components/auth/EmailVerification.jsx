import React, { useState } from 'react';
import { MailCheck, MailWarning } from 'lucide-react';
import authService from '../../services/authService';

const EmailVerification = () => {
    const [status, setStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendVerification = async () => {
        setLoading(true);
        await authService.sendVerificationLink();
        setLoading(false);
        alert('Verification email sent!');
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
                {status ? (
                    <MailCheck className="text-green-400 w-6 h-6" />
                ) : (
                    <MailWarning className="text-yellow-400 w-6 h-6" />
                )}
                <h2 className="text-xl font-semibold text-white">Email Verification</h2>
            </div>
            <p className="text-gray-400 mt-2">
                {status ? 'Your email is verified.' : 'Your email is not verified. Please verify to secure your account.'}
            </p>
            {!status && (
                <button
                    onClick={sendVerification}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    {loading ? 'Sending...' : 'Send Verification Email'}
                </button>
            )}
        </div>
    );
};

export default EmailVerification;
