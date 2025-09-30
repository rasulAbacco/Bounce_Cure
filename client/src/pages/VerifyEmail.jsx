import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService'; // Adjust path if needed
import toast from 'react-hot-toast';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        const redirect = query.get('redirect') || 'login'; // default to login

        if (!token) {
            setStatus('error');
            return;
        }

        const verify = async () => {
            try {
                await fetch(`/api/verified-emails/verify/${token}`);
                setStatus('success');
                toast.success('✅ Email verified successfully!');
                setTimeout(() => navigate(`/${redirect}`), 3000); // Redirect after 3 seconds
            } catch (err) {
                setStatus('error');
                toast.error('❌ Verification failed or token expired');
            }
        };

        verify();
    }, [location.search]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
            {status === 'verifying' && <p>Verifying your email...</p>}
            {status === 'success' && <p>Email verified! Redirecting to login...</p>}
            {status === 'error' && <p>Verification failed. The token is invalid or expired.</p>}
        </div>
    );
};

export default VerifyEmail;
