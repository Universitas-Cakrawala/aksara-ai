import { authApi, type LoginRequest, type RegisterRequest } from '@/services/api';
import { DUMMY_MODE } from '@/services/dummyData';
import { mockAuthApi } from '@/services/mockApi';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    username: string;
    nama_lengkap: string;
    email: string;
    role?: string;
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
        callback?: () => void,
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
                    const profileResponse = DUMMY_MODE ? await mockAuthApi.getProfile() : await authApi.getProfile();
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

    const login = async (username: string, password: string, callback?: () => void) => {
        setIsLoading(true);
        setError(null);
        try {
            const loginData: LoginRequest = { username, password };

            const response = DUMMY_MODE ? await mockAuthApi.login(loginData) : await authApi.login(loginData);

            localStorage.setItem('token', response.access_token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            // Simpan refresh token jika ada
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }

            // Ensure we have complete profile details (nama_lengkap & email)
            try {
                const profileResponse = DUMMY_MODE ? await mockAuthApi.getProfile() : await authApi.getProfile();
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

            // ensure role is part of user object
            const userWithRole = { ...response.user } as any;
            setUser(userWithRole);

            if (callback) callback(); // redirect opsional
        } catch (error: any) {
            console.error('Login error:', error);
            const errorMessage = DUMMY_MODE ? error.message : error.response?.data?.message || 'Login gagal';
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
        callback?: () => void,
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
            // Simpan refresh token jika ada
            if (response.refresh_token) {
                localStorage.setItem('refresh_token', response.refresh_token);
            }

            // Setelah registrasi, pastikan data profil disimpan lengkap
            try {
                const profileResponse = DUMMY_MODE ? await mockAuthApi.getProfile() : await authApi.getProfile();
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

            if (callback) callback(); // redirect opsional
        } catch (error: any) {
            console.error('Register error:', error);
            const errorMessage = DUMMY_MODE ? error.message : error.response?.data?.message || 'Registrasi gagal';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback((callback?: () => void) => {
        // Notify backend about logout, but do not block UI on failure
        (async () => {
            try {
                await authApi.logout();
            } catch (err) {
                console.warn('Backend logout failed:', err);
            }
        })();

        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
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
// function parseJwt(token: string): any | null {
//   try {
//     const base64Payload = token.split('.')[1];
//     const payload = atob(base64Payload);
//     return JSON.parse(payload);
//   } catch {
//     return null;
//   }
// }
