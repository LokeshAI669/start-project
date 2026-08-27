import React, { createContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying stored token

  // ── Restore session from localStorage on mount ──────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');

    if (!storedToken || storedToken === 'student' || storedToken === 'admin') {
      // Old mock token — clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setLoading(false);
      return;
    }

    // We have a real JWT — restore user from localStorage immediately
    // then silently verify with the server in background
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (_e) {}
    }
    setToken(storedToken);

    // Background verify (don't block the UI)
    api('GET', '/api/auth/me')
      .then(data => {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      })
      .catch(() => {
        // Token expired or invalid — clear session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── login — calls real API, stores JWT ─────────────────────────────────
  const login = async (email, password) => {
    const data = await api('POST', '/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user; // caller can check user.role
  };

  // ── logout ──────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ── setGuestEmail — stores an anonymous student email for /mine queries
  const setGuestEmail = (email) => {
    const guest = { id: null, name: '', email, role: 'student' };
    localStorage.setItem('user', JSON.stringify(guest));
    setUser(guest);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setGuestEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

