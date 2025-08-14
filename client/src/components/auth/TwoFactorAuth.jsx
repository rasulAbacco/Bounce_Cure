import React, { useState } from 'react';
import { ShieldCheck, QrCode } from 'lucide-react';
import authService from '../../services/authService';

const TwoFactorAuth = () => {
    const [enabled, setEnabled] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [otp, setOtp] = useState('');

    // Enable 2FA: generate OTP & QR code
    const handleEnable = async () => {
        try {
            const res = await authService.enable2FA();
            setQrCode(res.qrCodeDataURL); // Display QR code
            alert(`OTP generated: ${res.otp}`); // Optional: show OTP for testing
            setEnabled(true);
        } catch (err) {
            console.error(err);
            alert('Failed to enable 2FA');
        }
    };

    // Verify OTP entered by user
    const handleVerify = async () => {
        try {
            await authService.verify2FA(otp);
            alert('2FA Enabled Successfully!');
            setOtp('');
            setQrCode('');
            setEnabled(false);
        } catch (err) {
            console.error(err);
            alert('Invalid OTP');
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-blue-400 w-6 h-6" />
                <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
            </div>

            {!enabled ? (
                <button
                    onClick={handleEnable}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                    Enable 2FA
                </button>
            ) : (
                <div className="mt-4 space-y-3">
                    {qrCode && <img src={qrCode} alt="Scan QR code" className="w-32 h-32" />}
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white"
                    />
                    <button
                        onClick={handleVerify}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                        Verify OTP
                    </button>
                </div>
            )}
        </div>
    );
};

export default TwoFactorAuth;
