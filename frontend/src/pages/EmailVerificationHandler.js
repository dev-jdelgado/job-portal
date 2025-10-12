import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;

const EmailVerificationHandler = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDashboardButton, setShowDashboardButton] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/account/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(async (res) => {
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || 'Verification failed.');
          }

          setVerificationStatus(data.message);

          // ✅ Determine what happened based on message
          if (data.message.includes('already been verified')) {
            setIsSuccess(true);
            setShowDashboardButton(false); // hide button if already verified
          } else if (data.message.includes('successfully')) {
            setIsSuccess(true);
            setShowDashboardButton(true); // show button if newly verified
          } else {
            setIsSuccess(false);
            setShowDashboardButton(false);
          }
        })
        .catch((error) => {
          setVerificationStatus(error.message);
          setIsSuccess(false);

          // ✅ If token is expired or invalid, hide the button
          if (error.message.includes('expired') || error.message.includes('Invalid')) {
            setShowDashboardButton(false);
          } else {
            setShowDashboardButton(true);
          }
        });
    }
  }, [token]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.header}>Email Verification</h1>

        <p style={{ ...styles.statusText, color: isSuccess ? 'green' : 'red' }}>
          {verificationStatus}
        </p>

        {isSuccess && verificationStatus.includes('already') && (
          <p>Your email is already verified. You can log in anytime.</p>
        )}

        {isSuccess && verificationStatus.includes('successfully') && (
          <p>You can now log in to your account with full access.</p>
        )}

        {/* ✅ Only show button if allowed */}
        {showDashboardButton && (
          <Link to="/seeker-dashboard" style={styles.button}>
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
};

// Basic Styling
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '1rem',
  },
  card: {
    maxWidth: '500px',
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  },
  header: { fontSize: '1.5rem', marginBottom: '1.5rem' },
  statusText: { fontSize: '1.125rem', fontWeight: '500', marginBottom: '1rem' },
  button: {
    display: 'inline-block',
    marginTop: '1.5rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#3b82f6',
    textDecoration: 'none',
  },
};

export default EmailVerificationHandler;