import React, { useState, useEffect, useCallback } from 'react'; 
import { useAuth } from '../context/AuthContext';
import config from '../config';

const API_URL = config.API_URL;

const AccountSettingsPage = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State for email verification
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // State for password change
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchUserInfo = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}`);
      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    window.addEventListener('focus', fetchUserInfo);
    return () => {
      window.removeEventListener('focus', fetchUserInfo);
    };
  }, [fetchUserInfo]);


  const handleSendVerification = async () => {
    setIsSending(true);
    setVerificationMessage('');
    try {
      const response = await fetch(`${API_URL}/api/account/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send email.');
      setVerificationMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error) {
      setVerificationMessage(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_URL}/api/account/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password.');
      setPasswordMessage(data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setPasswordMessage(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  };


  if (isLoading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Account Settings</h1>
      
      {/* Email Verification Card */}
      <div style={styles.card}>
        <h2 style={styles.cardHeader}>Email Verification</h2>
        {userInfo && (
          <div style={styles.cardBody}>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <div style={styles.statusContainer}>
              <p><strong>Status:</strong></p>
              {userInfo.is_verified ? (
                <span style={{ ...styles.statusBadge, ...styles.verified }}>Verified</span>
              ) : (
                <span style={{ ...styles.statusBadge, ...styles.notVerified }}>Not Verified</span>
              )}
            </div>
            {!userInfo.is_verified && (
              <button style={styles.button} onClick={handleSendVerification} disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Verification Email'}
              </button>
            )}
            {verificationMessage && <p style={styles.message}>{verificationMessage}</p>}
          </div>
        )}
      </div>

      {/* Change Password Card */}
      <div style={styles.card}>
        <h2 style={styles.cardHeader}>Change Password</h2>
        <div style={styles.cardBody}>
          <form onSubmit={handleSubmitPasswordChange}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="currentPassword">Current Password</label>
              <input type="password" id="currentPassword" name="currentPassword" style={styles.input} value={passwordData.currentPassword} onChange={handlePasswordChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="newPassword">New Password</label>
              <input type="password" id="newPassword" name="newPassword" style={styles.input} value={passwordData.newPassword} onChange={handlePasswordChange} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" style={styles.input} value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
            </div>
            <button type="submit" style={styles.button} disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
            {passwordMessage && <p style={styles.message}>{passwordMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};


const styles = {
    container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' },
    header: { textAlign: 'center', marginBottom: '2rem', color: '#111827' },
    card: { border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'white' },
    cardHeader: { fontSize: '1.25rem', padding: '1rem', borderBottom: '1px solid #e5e7eb', margin: 0 },
    cardBody: { padding: '1.5rem' },
    statusContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
    statusBadge: { padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: '500' },
    verified: { backgroundColor: '#d1fae5', color: '#065f46' },
    notVerified: { backgroundColor: '#fee2e2', color: '#991b1b' },
    button: { padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontSize: '0.875rem', fontWeight: '500', color: 'white', backgroundColor: '#3b82f6', border: 'none', cursor: 'pointer', transition: 'background-color 0.2s' },
    message: { marginTop: '1rem', color: '#374151', fontSize: '0.875rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' },
    input: { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' },
};

export default AccountSettingsPage;