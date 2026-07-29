import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (_e) {
        console.error('Invalid user data in localStorage');
      }
    }
    setLoading(false);
  }, []);

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
