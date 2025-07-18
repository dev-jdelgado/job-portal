import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/account/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Reset Password</h2>
        <p style={styles.subHeader}>Enter your email address and we'll send you a link to reset your password.</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Reset Link'}
          </button>
          {message && <p style={styles.message}>{message}</p>}
        </form>
        <p style={styles.footerText}>
          Remember your password? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

// Basic Styling
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
    card: { backgroundColor: 'white', padding: '2rem 2.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', maxWidth: '450px', width: '100%' },
    header: { fontSize: '1.75rem', fontWeight: '600', textAlign: 'center', marginBottom: '0.5rem', color: '#111827' },
    subHeader: { textAlign: 'center', color: '#6b7280', marginBottom: '1.5rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '1rem', fontWeight: '500', color: 'white', backgroundColor: '#3b82f6', border: 'none', cursor: 'pointer' },
    message: { marginTop: '1rem', color: '#374151', textAlign: 'center' },
    footerText: { marginTop: '1.5rem', textAlign: 'center', color: '#6b7280' },
    link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
};

export default ForgotPasswordPage;