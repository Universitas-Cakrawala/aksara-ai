import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import * as z from 'zod';

const loginSchema = z.object({
    username: z.string().min(3, 'Username minimal 3 karakter'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    remember: z.boolean().optional(),
});

type FormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
    const [tampilkanPassword, setTampilkanPassword] = useState(false);
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<FormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: FormData) => {
        try {
            await login(data.username, data.password, () => {
                const userData = localStorage.getItem('userData');
                if (userData) {
                    try {
                        const parsed = JSON.parse(userData);
                        if (parsed.role === 'ADMIN') {
                            navigate('/admin');
                            return;
                        }
                    } catch {}
                }
                navigate('/chat');
            });
            if (data.remember) localStorage.setItem('ingatUser', data.username);
        } catch (error: any) {
            setError('root', {
                message: error.message || 'Username atau password salah',
            });
        }
    };

    return (
        <Card className="mx-auto w-full max-w-md shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl font-bold">Masuk ke Aksara AI</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Masukkan username dan password Anda
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Nama Pengguna</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="username"
                                type="text"
                                placeholder="Masukkan username"
                                className="pl-10"
                                {...register('username')}
                            />
                        </div>
                        {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="password"
                                type={tampilkanPassword ? 'text' : 'password'}
                                placeholder="Masukkan kata sandi"
                                className="pl-10 pr-10"
                                {...register('password')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setTampilkanPassword(!tampilkanPassword)}
                            >
                                {tampilkanPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                    </div>

                    {/* Ingat saya */}
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="remember" {...register('remember')} />
                        <Label htmlFor="remember" className="cursor-pointer text-sm">
                            Ingat saya
                        </Label>
                    </div>

                    {/* Pesan error root */}
                    {errors.root && <p className="text-center text-sm text-destructive">{errors.root.message}</p>}

                    {/* Tombol masuk */}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Masuk...' : 'Masuk'}
                    </Button>
                </form>

                {/* Navigasi daftar */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-blue-500 hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
