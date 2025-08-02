import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginAPI } from '../services/API';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👈 Import icons

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👈 Toggle state
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAPI({ email, password });
      login(res.data);

      if (res.data.role === 'seeker') {
        navigate('/seeker-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div className='px-sm-5 px-3 py-3' style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back!</h2>
          <p style={styles.subtitle}>Sign in to continue to your dashboard.</p>
        </div>

        {msg && <div style={styles.alert}>{msg}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <div style={styles.labelContainer}>
              <label style={styles.label} htmlFor="password">Password</label>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.iconButton}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
          </div>

          <button className='navy-blue-btn' style={styles.button}>Sign In</button>

          <p style={styles.footerText}>
            Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 1.5rem' 
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '450px', width: '100%'
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: '0.5rem' },
  alert: {
    backgroundColor: '#fee2e2', color: '#b91c1c',
    padding: '0.75rem 1rem', borderRadius: '0.375rem',
    marginBottom: '1.5rem', textAlign: 'center'
  },
  formGroup: { marginBottom: '1.25rem' },
  labelContainer: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '0.5rem'
  },
  label: { fontWeight: '500', color: '#374151' },
  input: {
    display: 'block', width: '100%', padding: '0.65rem 0.75rem',
    border: '1px solid #d1d5db', borderRadius: '0.375rem',
    boxSizing: 'border-box'
  },
  iconButton: {
    position: 'absolute',
    top: '50%',
    right: '0.75rem',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280'
  },
  forgotLink: {
    fontSize: '0.875rem', color: '#002D5A',
    textDecoration: 'none'
  },
  button: {
    width: '100%', padding: '0.75rem',
    borderRadius: '0.375rem', fontSize: '1rem',
    fontWeight: '500', color: 'white',
    cursor: 'pointer', marginTop: '0.5rem',
    transition: 'all 0.3s ease',
  },
  footerText: { marginTop: '2rem', textAlign: 'center', color: '#6b7280' },
  link: {
    color: '#002D5A', textDecoration: 'none',
    fontWeight: '500'
  }
};
