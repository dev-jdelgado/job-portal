import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

export default function AdminCreateUser() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [msg, setMsg] = useState('');

    if (user?.role !== 'admin') {
        return <p className="text-center mt-5 text-danger">Access denied</p>;
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/admin/create-user`, form, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMsg("Admin user created!");
            setForm({ name: '', email: '', password: '' });
        } catch (err) {
            setMsg(err.response?.data?.msg || 'Failed to create admin');
        }
    };

    return (
        <div className="container mt-5 col-md-5">
            <h2 className="mb-4">Create Admin User</h2>
            {msg && <div className="alert alert-info">{msg}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Name</label>
                    <input name="name" className="form-control" value={form.name}
                        onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Email</label>
                    <input name="email" className="form-control" value={form.email}
                        onChange={handleChange} required />
                </div>
                <div className="mb-3">
                    <label>Password</label>
                    <input name="password" type="password" className="form-control" value={form.password}
                        onChange={handleChange} required />
                </div>
                <button className="btn navy-blue-btn w-100">Create Admin</button>
            </form>
        </div>
    );
}
