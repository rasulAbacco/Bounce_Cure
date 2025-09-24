// src/components/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [email, setEmail] = useState('');
  const [showManualTest, setShowManualTest] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // ✅ API should point to backend
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token found in the URL. Please check your email link.');
    }
  }, [token]);

  const verifyEmail = async (token) => {
    try {
      console.log("🔍 Starting verification process...");
      console.log("📩 Token from URL:", token);

      const response = await fetch(`${API_URL}/verified-emails/verify/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      console.log("✅ Verification endpoint response:", data);

      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        if (data.email) setEmail(data.email);

        // Redirect after success
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || "Verification failed");
        setDebugInfo({ token, ...data });
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again later.');
      setDebugInfo({ error: error.message, token });
    }
  };

  const resendVerification = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email address');

    try {
      const response = await fetch(`${API_URL}/verified-emails/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
      } else {
        setStatus('error');
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      setStatus('error');
      setMessage('Failed to resend verification email.');
    }
  };

  return (
    <div className="verify-email-container">
      <div className="card">
        <h1>Email Verification</h1>

        {status === 'loading' && <p>Verifying your email address...</p>}
        {status !== 'loading' && <p className={status}>{message}</p>}

        {debugInfo && (
          <div className="debug-info">
            <h3>Debug Information</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}

        {status === 'error' && (
          <div>
            <h3>Resend Verification Email</h3>
            <form onSubmit={resendVerification}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
              <button type="submit">Resend</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
