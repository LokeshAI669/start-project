import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) return JSON.parse(stored);
    } catch (_e) {}
    const defaultUser = { id: 2, name: 'Student', email: 'student@jobzen.com', role: 'student' };
    localStorage.setItem('user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('token');
    if (stored) return stored;
    localStorage.setItem('token', 'student');
    return 'student';
  });

  const [loading, setLoading] = useState(false);

  const setRole = (role) => {
    const mockUser = {
      id: role === 'admin' ? 1 : 2,
      name: role === 'admin' ? 'Mock Admin' : 'Mock Student',
      email: role === 'admin' ? 'admin@mock.com' : 'student@mock.com',
      role: role
    };
    
    localStorage.setItem('token', role); // role acts as the token
    localStorage.setItem('user', JSON.stringify(mockUser));
    setToken(role);
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
