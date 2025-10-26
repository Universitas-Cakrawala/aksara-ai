import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { DUMMY_MODE } from '@/services/dummyData';
import { ArrowLeft, Eye, EyeOff, Save, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
    username: string;
    nama_lengkap: string;
    email: string;
}

interface PasswordChangeData {
    old_password: string;
    new_password: string;
    confirm_new_password: string;
}

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState<ProfileData>({
        username: '',
        nama_lengkap: '',
        email: '',
    });

    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
            });
        }
        setIsLoading(false);
    }, [user]);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            if (DUMMY_MODE) {
                // For dummy mode, just update localStorage
                const updatedUser = {
                    ...user,
                    username: profileData.username,
                    nama_lengkap: profileData.nama_lengkap,
                    email: profileData.email,
                };
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                showMessage('success', 'Profile berhasil diperbarui!');
            } else {
                // Use real API
                const updateData = {
                    username: profileData.username,
                    nama_lengkap: profileData.nama_lengkap,
                    email: profileData.email,
                };

                await authApi.updateProfile(user.id, updateData);

                // Update user data in localStorage
                const updatedUser = {
                    ...user,
                    username: profileData.username,
                    nama_lengkap: profileData.nama_lengkap,
                    email: profileData.email,
                };
                localStorage.setItem('userData', JSON.stringify(updatedUser));
                showMessage('success', 'Profile berhasil diperbarui!');
            }
            setIsEditingProfile(false);
        } catch (error: any) {
            console.error('Profile update error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.detail ||
                error.message ||
                'Terjadi kesalahan saat memperbarui profile';
            showMessage('error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (passwordData.new_password !== passwordData.confirm_new_password) {
            showMessage('error', 'Password baru dan konfirmasi password tidak cocok');
            return;
        }

        if (passwordData.new_password.length < 8) {
            showMessage('error', 'Password baru harus minimal 8 karakter');
            return;
        }

        setIsSaving(true);
        try {
            if (DUMMY_MODE) {
                // For dummy mode, just show success (no actual password change)
                showMessage('success', 'Password berhasil diubah!');
            } else {
                // Use real API
                await authApi.updatePassword(user.id, passwordData);
                showMessage('success', 'Password berhasil diubah!');
            }

            setPasswordData({
                old_password: '',
                new_password: '',
                confirm_new_password: '',
            });
            setIsChangingPassword(false);
        } catch (error: any) {
            console.error('Password change error:', error);
            showMessage('error', error.message || 'Terjadi kesalahan saat mengubah password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBackToChat = () => {
        navigate('/chat');
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="space-y-2 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    <p className="text-sm text-muted-foreground">Memuat profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="border-b bg-white shadow-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleBackToChat}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Chat
                        </Button>
                        <div>
                            <h1 className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-2xl font-bold text-transparent">
                                Profile Pengguna
                            </h1>
                            <p className="text-sm text-muted-foreground">Kelola informasi akun Anda</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="mr-2 h-4 w-4" />
                        <span className="text-sm">{user?.nama_lengkap}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                {/* Message */}
                {message && (
                    <div
                        className={`rounded-lg p-4 ${
                            message.type === 'success'
                                ? 'border border-green-200 bg-green-50 text-green-700'
                                : 'border border-red-200 bg-red-50 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Informasi Profile</span>
                            {!isEditingProfile && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                                    Edit Profile
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) =>
                                            setProfileData((prev) => ({ ...prev, username: e.target.value }))
                                        }
                                        disabled={!isEditingProfile}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                                        disabled={!isEditingProfile}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                                <Input
                                    id="nama_lengkap"
                                    type="text"
                                    value={profileData.nama_lengkap}
                                    onChange={(e) =>
                                        setProfileData((prev) => ({ ...prev, nama_lengkap: e.target.value }))
                                    }
                                    disabled={!isEditingProfile}
                                    required
                                />
                            </div>

                            {isEditingProfile && (
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isSaving}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            // Reset to original data
                                            if (user) {
                                                setProfileData({
                                                    username: user.username,
                                                    nama_lengkap: user.nama_lengkap,
                                                    email: user.email,
                                                });
                                            }
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Password Change Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Ubah Password</span>
                            {!isChangingPassword && (
                                <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                                    Ubah Password
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    {isChangingPassword && (
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="old_password">Password Lama</Label>
                                    <div className="relative">
                                        <Input
                                            id="old_password"
                                            type={showOldPassword ? 'text' : 'password'}
                                            value={passwordData.old_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({ ...prev, old_password: e.target.value }))
                                            }
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowOldPassword(!showOldPassword)}
                                        >
                                            {showOldPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new_password">Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="new_password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordData.new_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({ ...prev, new_password: e.target.value }))
                                            }
                                            required
                                            minLength={8}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_new_password">Konfirmasi Password Baru</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirm_new_password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordData.confirm_new_password}
                                            onChange={(e) =>
                                                setPasswordData((prev) => ({
                                                    ...prev,
                                                    confirm_new_password: e.target.value,
                                                }))
                                            }
                                            required
                                            minLength={8}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isSaving}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSaving ? 'Mengubah...' : 'Ubah Password'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({
                                                old_password: '',
                                                new_password: '',
                                                confirm_new_password: '',
                                            });
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
