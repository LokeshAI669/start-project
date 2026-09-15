import React, { createContext, useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser  = localStorage.getItem('user');

      // Quick restore from cache while we validate
      if (storedToken && storedUser && storedToken !== 'student' && storedToken !== 'admin') {
        try {
          const cached = JSON.parse(storedUser);
          setUser(cached);
          setToken(storedToken);
          // Background-validate token against the API
          const res = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            const freshUser = data.user || data;
            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          } else {
            // Token expired / invalid — clear
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || data?.message || 'Login failed.');

    const { token: jwt, user: loggedInUser } = data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user',  JSON.stringify(loggedInUser));
    setToken(jwt);
    setUser(loggedInUser);
    return loggedInUser;
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Kept for backward compatibility with any component that destructures it
  const setGuestEmail = () => {};

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setGuestEmail }}>
      {children}
    </AuthContext.Provider>
  );
};
