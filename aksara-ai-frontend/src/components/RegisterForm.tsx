import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import * as z from 'zod';

const registerSchema = z
    .object({
        nama_lengkap: z.string().min(2, 'Nama minimal 2 karakter'),
        email: z.string().email('Email tidak valid'),
        username: z.string().min(3, 'Username minimal 3 karakter'),
        password: z.string().min(6, 'Password minimal 6 karakter'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password tidak cocok',
        path: ['confirmPassword'],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data.nama_lengkap, data.email, data.username, data.password);
            // Bisa tambahkan toast notifikasi sukses di sini
        } catch (error: any) {
            setError('root', {
                message: error.message || 'Terjadi kesalahan saat mendaftar',
            });
        }
    };

    return (
        <Card className="mx-auto w-full max-w-md rounded-xl shadow-xl">
            <CardHeader className="space-y-2">
                <CardTitle className="text-center text-2xl font-bold">Daftar ke Aksara AI</CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    Buat akun baru untuk mengakses chat AI
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Nama Lengkap */}
                    <div className="space-y-2">
                        <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="nama_lengkap"
                                type="text"
                                placeholder="Masukkan nama lengkap"
                                className="pl-10"
                                {...register('nama_lengkap')}
                            />
                        </div>
                        {errors.nama_lengkap && (
                            <p className="animate-fadeIn text-sm text-destructive">{errors.nama_lengkap.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="nama@email.com"
                                className="pl-10"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p className="animate-fadeIn text-sm text-destructive">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                className="pl-10"
                                {...register('username')}
                            />
                        </div>
                        {errors.username && (
                            <p className="animate-fadeIn text-sm text-destructive">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">Kata Sandi</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Kata sandi"
                                className="pl-10 pr-10"
                                {...register('password')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.password && (
                            <p className="animate-fadeIn text-sm text-destructive">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Konfirmasi kata sandi"
                                className="pl-10 pr-10"
                                {...register('confirmPassword')}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                title={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="animate-fadeIn text-sm text-destructive">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Error Root */}
                    {errors.root && (
                        <p className="animate-fadeIn text-center text-sm text-destructive">{errors.root.message}</p>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" className="flex w-full items-center justify-center" disabled={isLoading}>
                        {isLoading && (
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {isLoading ? 'Mendaftar...' : 'Daftar'}
                    </Button>
                </form>

                {/* Navigasi Login */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="font-normal text-blue-500 hover:font-bold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default RegisterForm;
