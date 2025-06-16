import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
        <span className="navbar-brand">Job Portal</span>
        <div className="ms-auto">
            {user ? (
            <>
                <span className="text-white me-3">Hi, {user.name}</span>
                <button className="btn btn-outline-light" onClick={handleLogout}>
                Logout
                </button>
            </>
            ) : (
            <>
                <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
                <Link className="btn btn-outline-light" to="/register">Register</Link>
            </>
            )}
        </div>
        </nav>
    );
}
