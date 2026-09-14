import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    const anonUser    = localStorage.getItem('anon_user');

    // Case 1: No valid JWT token present in localStorage
    if (!storedToken || storedToken === 'student' || storedToken === 'admin') {
      localStorage.removeItem('token');

      // Check if user submitted a request as guest with anon_user
      if (anonUser) {
        try {
          const parsedAnon = JSON.parse(anonUser);
          if (parsedAnon?.email) {
            setUser(parsedAnon);
            setLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem('anon_user');
        }
      }

      // If storedUser exists but has no valid JWT token, check if it was an anon guest
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // If it was a mock user or old authenticated user without a token, purge it!
          if (parsed?.id) {
            // Stale account with no token -> purge to prevent showing previous person's account
            localStorage.removeItem('user');
            setUser(null);
          } else if (parsed?.email) {
            // Guest session
            setUser(parsed);
          } else {
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
      return;
    }

    // Case 2: Stored JWT exists — verify with backend
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch {}
    }
    setToken(storedToken);

    api('GET', '/api/auth/me')
      .then(data => {
        if (data?.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          throw new Error('Invalid user payload');
        }
      })
      .catch(() => {
        // Token expired, invalid, or belongs to another backend/user.
        // Purge BOTH token and user so stale account is completely removed!
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);

        // Fall back to anon_user if available
        if (anonUser) {
          try {
            const parsedAnon = JSON.parse(anonUser);
            setUser(parsedAnon?.email ? parsedAnon : null);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // ── login — verifies credentials, sets JWT + user ─────────────────────────
  const login = async (email, password) => {
    const data = await api('POST', '/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.removeItem('anon_user'); // real session supersedes guest
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── register — signs up a student, sets JWT + user ────────────────────────
  const register = async (name, email, password) => {
    const data = await api('POST', '/api/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user',  JSON.stringify(data.user));
    localStorage.removeItem('anon_user');
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── logout — completely clears session across storage ────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('anon_user');
    setToken(null);
    setUser(null);
  }, []);

  // ── setSessionUser — updates guest/form student email and name ─────────────
  const setSessionUser = useCallback((userData) => {
    const cleanUser = {
      id: userData.id || null,
      name: userData.name || '',
      email: (userData.email || '').trim(),
      role: userData.role || 'student',
    };
    localStorage.setItem('user', JSON.stringify(cleanUser));
    localStorage.setItem('anon_user', JSON.stringify(cleanUser));
    setUser(cleanUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setSessionUser }}>
      {children}
    </AuthContext.Provider>
  );
};
