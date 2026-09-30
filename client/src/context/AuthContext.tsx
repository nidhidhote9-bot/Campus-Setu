import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@shared/index';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  studentId?: string;
  wardStudentIds?: string[];
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  csrfToken: string | null;
  isLoading: boolean;
  login: (email: string, pass: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [csrfToken, setCsrfToken] = useState<string | null>('csrf-demo-token');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          setToken(null);
        }
      } catch (e) {
        console.error('Session check failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string, role: UserRole) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    if (data.csrfToken) setCsrfToken(data.csrfToken);
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore error on logout
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, csrfToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
