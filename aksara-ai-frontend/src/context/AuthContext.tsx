import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, type LoginRequest, type RegisterRequest } from '@/services/api';

interface User {
  id: string;
  username: string;
  nama_lengkap: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (nama_lengkap: string, email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
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

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const loginData: LoginRequest = {
        username,
        password,
      };
      
      const response = await authApi.login(loginData);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nama_lengkap: string, email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        username,
        password,
        nama_lengkap,
        email,
      };
      
      const response = await authApi.register(registerData);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.error('Register error:', error);
      throw new Error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};