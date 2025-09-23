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

  // Backend API URL
  const API_URL = 'http://localhost:5173/api';

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
      console.log("Starting verification process...");
      console.log("Token from URL:", token);
      
      const response = await fetch(`${API_URL}/verified-emails/verify/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log("Verification endpoint response:", data);
      
      if (response.ok) {
        setStatus('success');
        setMessage(data.message);
        if (data.email) {
          setEmail(data.email);
        }
        // Redirect after successful verification
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error);
        setDebugInfo(data.debug || null);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification. Please try again later.');
    }
  };

  const resendVerification = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/verified-emails/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      console.error('Resend error:', error);
      setStatus('error');
      setMessage('Failed to resend verification email. Please try again later.');
    }
  };

  const testManualVerification = async (e) => {
    e.preventDefault();
    if (!manualToken) {
      alert('Please enter a token to test');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/verified-emails/test-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: manualToken })
      });
      
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Manual test error:', error);
      setDebugInfo({ error: error.message });
    }
  };

  return (
    <div className="verify-email-container">
      <div className="card">
        <h1>Email Verification</h1>
        
        {status === 'loading' && (
          <div className="loading">
            <p>Verifying your email address, please wait...</p>
          </div>
        )}
        
        {status !== 'loading' && (
          <div className={`message ${status}`}>
            {message}
          </div>
        )}
        
        {debugInfo && (
          <div className="debug-info">
            <h3>Debug Information</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        
        {status === 'error' && (
          <div className="resend-section">
            <h3>Resend Verification Email</h3>
            <p>Didn't receive the email or the link expired? Enter your email address to resend the verification email.</p>
            <form onSubmit={resendVerification}>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                required 
              />
              <button type="submit">Resend Email</button>
            </form>
            
            <div className="manual-test">
              <h3>Manual Token Test</h3>
              <p>Paste the token here to test verification manually:</p>
              <form onSubmit={testManualVerification}>
                <input 
                  type="text" 
                  value={manualToken} 
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="Paste verification token" 
                  required 
                />
                <button type="submit">Test Token</button>
              </form>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .verify-email-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          padding: 30px;
        }
        .loading {
          text-align: center;
          padding: 20px;
        }
        .message {
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .debug-info {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .debug-info pre {
          font-size: 12px;
          white-space: pre-wrap;
          max-height: 300px;
          overflow-y: auto;
        }
        .resend-section {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .resend-section input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .resend-section button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .resend-section button:hover {
          background-color: #45a049;
        }
        .manual-test {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .manual-test input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-family: monospace;
        }
        .manual-test button {
          background-color: #2196F3;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .manual-test button:hover {
          background-color: #0b7dda;
        }
      `}</style>
    </div>
  );
}

export default VerifyEmail;