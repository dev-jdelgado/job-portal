import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import config from '../config';

const API_URL = config.API_URL;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsSuccess(false);
      return;
    }
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/account/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      setMessage(data.message);
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.message);
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.header}>Success!</h2>
          <p style={{ ...styles.message, color: 'green' }}>{message}</p>
          <Link to="/login" style={styles.button}>Proceed to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>Create New Password</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              style={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.button} disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
          {message && <p style={{...styles.message, color: 'red' }}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

// Re-using styles from ForgotPasswordPage for consistency
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' },
    card: { backgroundColor: 'white', padding: '2rem 2.5rem', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', maxWidth: '450px', width: '100%', textAlign: 'center' },
    header: { fontSize: '1.75rem', fontWeight: '600', textAlign: 'center', marginBottom: '1.5rem', color: '#111827' },
    formGroup: { marginBottom: '1rem', textAlign: 'left' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '1rem', fontWeight: '500', color: 'white', backgroundColor: '#3b82f6', border: 'none', cursor: 'pointer', textDecoration: 'none' },
    message: { marginTop: '1rem', textAlign: 'center' },
};

export default ResetPasswordPage;