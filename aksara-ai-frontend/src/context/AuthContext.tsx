import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, type LoginRequest, type RegisterRequest } from '@/services/api';
import { mockAuthApi } from '@/services/mockApi';
import { DUMMY_MODE } from '@/services/dummyData';

interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string, callback?: () => void) => Promise<void>;
  register: (
    nama_lengkap: string,
    email: string,
    username: string,
    password: string,
    callback?: () => void
  ) => Promise<void>;
  logout: (callback?: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Load user dari localStorage saat pertama kali mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // ✅ Tambahan: auto logout kalau token expired (jika pakai JWT)
        const payload = parseJwt(token);
        if (payload?.exp && Date.now() >= payload.exp * 1000) {
          logout();
        }
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, callback?: () => void) => {
    setIsLoading(true);
    setError(null);
    try {
      const loginData: LoginRequest = { username, password };

      const response = DUMMY_MODE
        ? await mockAuthApi.login(loginData)
        : await authApi.login(loginData);

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);

      if (callback) callback(); // redirect opsional
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = DUMMY_MODE
        ? error.message
        : error.response?.data?.message || 'Login gagal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    nama_lengkap: string,
    email: string,
    username: string,
    password: string,
    callback?: () => void
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const registerData: RegisterRequest = { username, password, nama_lengkap, email };

      const response = DUMMY_MODE
        ? await mockAuthApi.register(registerData)
        : await authApi.register(registerData);

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);

      if (callback) callback(); // redirect opsional
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = DUMMY_MODE
        ? error.message
        : error.response?.data?.message || 'Registrasi gagal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback((callback?: () => void) => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    if (callback) callback();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 🔹 Helper: Parse JWT untuk cek expire
function parseJwt(token: string): any | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
