import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;

const EmailVerificationHandler = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/api/account/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Verification failed.');
        }
        setVerificationStatus(data.message);
        setIsSuccess(true);
      })
      .catch(error => {
        setVerificationStatus(error.message);
        setIsSuccess(false);
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
        {isSuccess && (
          <p>You can now log in to your account with full access.</p>
        )}
        <Link to="/login" style={styles.button}>
          Go to Login
        </Link>
      </div>
    </div>
  );
};

// Basic Styling
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' },
  card: {
    maxWidth: '500px',
    width: '100%',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
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