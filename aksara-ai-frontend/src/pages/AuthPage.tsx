import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import RegisterForm from '@/components/RegisterForm';
import React, { useEffect, useState } from 'react';

interface AuthPageProps {
    mode?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(mode === 'login');

    // Update state when mode prop changes
    useEffect(() => {
        setIsLogin(mode === 'login');
    }, [mode]);

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
            {/* Navbar */}
            <Navbar variant="auth" />

            {/* Content */}
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-4xl font-bold text-transparent">
                            {isLogin ? 'Masuk' : 'Daftar'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isLogin
                                ? 'Selamat datang kembali! Masuk ke akun Anda.'
                                : 'Bergabunglah dengan komunitas literasi kampus!'}
                        </p>
                    </div>

                    {isLogin ? <LoginForm /> : <RegisterForm />}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
