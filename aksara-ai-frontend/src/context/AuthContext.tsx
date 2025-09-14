import React, { createContext, useContext, useState, useEffect } from 'react';
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
      
      // Pilih API berdasarkan mode (dummy atau real)
      const response = DUMMY_MODE 
        ? await mockAuthApi.login(loginData)
        : await authApi.login(loginData);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      // Untuk dummy mode, error message langsung dari mockApi
      const errorMessage = DUMMY_MODE 
        ? error.message 
        : (error.response?.data?.message || 'Login gagal');
      throw new Error(errorMessage);
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
      
      // Pilih API berdasarkan mode (dummy atau real)
      const response = DUMMY_MODE 
        ? await mockAuthApi.register(registerData)
        : await authApi.register(registerData);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('userData', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: any) {
      console.error('Register error:', error);
      // Untuk dummy mode, error message langsung dari mockApi
      const errorMessage = DUMMY_MODE 
        ? error.message 
        : (error.response?.data?.message || 'Registrasi gagal');
      throw new Error(errorMessage);
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