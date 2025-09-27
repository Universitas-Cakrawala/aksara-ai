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
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      if (!token) {
        setIsLoading(false);
        return;
      }

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          if (!parsedUser.nama_lengkap || !parsedUser.email) {
            const profileResponse = DUMMY_MODE
              ? await mockAuthApi.getProfile()
              : await authApi.getProfile();
            const profileData = profileResponse.data?.profile;
            const userResponse = profileResponse.data?.user;

            if (profileData && userResponse) {
              const enrichedUser = {
                id: userResponse.id,
                username: userResponse.username,
                nama_lengkap: profileData.nama_lengkap,
                email: profileData.email,
              };
              localStorage.setItem('userData', JSON.stringify(enrichedUser));
              setUser(enrichedUser);
            }
          }
        } catch (error) {
          console.warn('Failed to parse stored user data:', error);
          localStorage.removeItem('userData');
        }
      } else {
        try {
          const profileResponse = DUMMY_MODE
            ? await mockAuthApi.getProfile()
            : await authApi.getProfile();
          const profileData = profileResponse.data?.profile;
          const userResponse = profileResponse.data?.user;

          if (profileData && userResponse) {
            const enrichedUser = {
              id: userResponse.id,
              username: userResponse.username,
              nama_lengkap: profileData.nama_lengkap,
              email: profileData.email,
            };
            localStorage.setItem('userData', JSON.stringify(enrichedUser));
            setUser(enrichedUser);
          }
        } catch (error) {
          console.warn('Failed to fetch profile during initialization:', error);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
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
      // Simpan refresh token jika ada
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      // Ensure we have complete profile details (nama_lengkap & email)
      try {
        const profileResponse = DUMMY_MODE
          ? await mockAuthApi.getProfile()
          : await authApi.getProfile();
        const profileData = profileResponse.data?.profile;
        const userData = profileResponse.data?.user;

        if (profileData && userData) {
          const enrichedUser = {
            id: userData.id,
            username: userData.username,
            nama_lengkap: profileData.nama_lengkap,
            email: profileData.email,
          };
          localStorage.setItem('userData', JSON.stringify(enrichedUser));
          setUser(enrichedUser);
          return;
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile after login:', profileError);
      }

      setUser(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      // Untuk dummy mode, error message langsung dari mockApi
      let errorMessage = 'Login gagal';
      if (DUMMY_MODE) {
        errorMessage = error.message;
      } else {
        // Backend error format: { detail: "error message" }
        errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Login gagal';
      }
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
      // Simpan refresh token jika ada
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }

      // Setelah registrasi, pastikan data profil disimpan lengkap
      try {
        const profileResponse = DUMMY_MODE
          ? await mockAuthApi.getProfile()
          : await authApi.getProfile();
        const profileData = profileResponse.data?.profile;
        const userData = profileResponse.data?.user;

        if (profileData && userData) {
          const enrichedUser = {
            id: userData.id,
            username: userData.username,
            nama_lengkap: profileData.nama_lengkap,
            email: profileData.email,
          };
          localStorage.setItem('userData', JSON.stringify(enrichedUser));
          setUser(enrichedUser);
          return;
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile after registration:', profileError);
      }

      setUser(response.user);
    } catch (error: any) {
      console.error('Register error:', error);
      // Untuk dummy mode, error message langsung dari mockApi
      let errorMessage = 'Registrasi gagal';
      if (DUMMY_MODE) {
        errorMessage = error.message;
      } else {
        // Backend error format: { detail: "error message" }
        errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Registrasi gagal';
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
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