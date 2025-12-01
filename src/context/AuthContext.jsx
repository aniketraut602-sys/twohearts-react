import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadCurrentUser, loadToken, saveUser, saveToken, clearAuth } from '../lib/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedUser = loadCurrentUser();
            const storedToken = loadToken();

            if (storedUser && storedToken) {
                setUser(storedUser);
                setToken(storedToken);
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (userData, authToken) => {
        saveUser(userData);
        saveToken(authToken);
        setUser(userData);
        setToken(authToken);
    };

    const logout = () => {
        clearAuth();
        setUser(null);
        setToken(null);
    };

    const updateUser = (userData) => {
        saveUser(userData);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
