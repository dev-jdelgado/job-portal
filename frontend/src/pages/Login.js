import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../services/API';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const res = await loginAPI({ email, password });
        login(res.data); // save to context + localStorage

        // Redirect based on role
        if (res.data.role === 'seeker') {
            navigate('/seeker-dashboard');
        } else {
            navigate('/employer-dashboard');
        }
    } catch (err) {
        setMsg(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="container mt-5 col-md-4">
        <h2 className="mb-4 text-center">Login</h2>
        {msg && <div className="alert alert-danger">{msg}</div>}
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
            <label>Email</label>
            <input type="text" className="form-control" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="mb-3">
            <label>Password</label>
            <input type="password" className="form-control" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button className="btn btn-primary w-100">Login</button>
            <p className="mt-3 text-center">No account? <a href="/register">Register</a></p>
        </form>
    </div>
  );
}
