import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSession, loginUser, logoutUser, registerUser, resetPassword } from '../services/auth';

interface AuthContextType {
  user: { username: string } | null;
  login: (u: string, p: string) => boolean;
  register: (u: string, p: string) => boolean;
  logout: () => void;
  resetPass: (u: string, p: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setUser(session);
    }
    setIsLoading(false);
  }, []);

  const login = (u: string, p: string) => {
    const success = loginUser(u, p);
    if (success) setUser({ username: u });
    return success;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const register = (u: string, p: string) => {
    return registerUser(u, p);
  };

  const resetPass = (u: string, p: string) => {
    return resetPassword(u, p);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, resetPass, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};