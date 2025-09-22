import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const { login, isLoading } = useAuth();

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
      await login(data.username, data.password);
      if (data.remember) localStorage.setItem('ingatUser', data.username);
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Username atau password salah',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Masuk ke Aksara AI</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Masukkan username dan password Anda untuk mengakses chat AI
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nama Pengguna</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Masukkan username"
                className="pl-10 focus:ring-2 focus:ring-blue-500 transition"
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive animate-fadeIn">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={tampilkanPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi"
                className="pl-10 pr-10 focus:ring-2 focus:ring-blue-500 transition"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-transform duration-200"
                onClick={() => setTampilkanPassword(!tampilkanPassword)}
                title={tampilkanPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {tampilkanPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive animate-fadeIn">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Ingat saya */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              className="accent-primary cursor-pointer"
              {...register('remember')}
              title="Ceklis jika ingin tetap login di perangkat ini"
            />
            <Label htmlFor="remember" className="text-sm cursor-pointer">
              Ingat saya
            </Label>
          </div>

          {/* Pesan error root */}
          {errors.root && (
            <p className="text-sm text-destructive text-center animate-fadeIn">
              {errors.root.message}
            </p>
          )}

          {/* Tombol masuk */}
          <Button
            type="submit"
            className="w-full flex justify-center items-center transition-transform duration-150 hover:scale-105"
            disabled={isLoading}
          >
            {isLoading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            )}
            {isLoading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        {/* Navigasi daftar */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal hover:underline"
              onClick={onToggleMode}
            >
              Daftar di sini
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
