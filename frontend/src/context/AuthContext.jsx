import React, { createContext } from 'react';

export const AuthContext = createContext();

// Guest-only profile — no login system
const GUEST_USER = {
  id: null,
  name: 'Guest',
  email: 'guest@hireproject.com',
  role: 'student',
};

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider
      value={{
        user: GUEST_USER,
        token: null,
        loading: false,
        login: async () => GUEST_USER,
        logout: () => {},
        setGuestEmail: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
