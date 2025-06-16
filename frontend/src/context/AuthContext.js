import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Invalid user data in localStorage');
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser());

    const login = (data) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
  };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
