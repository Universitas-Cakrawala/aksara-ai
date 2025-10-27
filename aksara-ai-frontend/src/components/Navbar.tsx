import { Button } from '@/components/ui/button';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo_Aksara.png'; // pastikan path ini sesuai struktur folder kamu
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

interface NavbarProps {
    variant?: 'landing' | 'auth' | 'chat' | 'admin';
    onMenuToggle?: () => void;
    onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'landing', onMenuToggle, onLogout }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <nav
            className={`w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
                variant === 'landing' || variant === 'chat' || variant === 'admin' ? 'sticky top-0 z-50' : ''
            }`}
        >
            <div className="w-full flex h-16 items-center justify-between px-4">
                {/* Bagian logo */}
                <div className="flex items-center space-x-2">
                    {/* Sidebar Toggle for Mobile - only for chat variant */}
                    {variant === 'chat' && onMenuToggle && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMenuToggle}
                            className="lg:hidden mr-2"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    )}
                    <Link to="/" className="flex items-center space-x-2">
                        <img
                            src={logo}
                            alt="Logo Aksara"
                            className="h-12 w-12 object-contain"
                        />
                        <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-2xl font-bold text-transparent">
                            Aksara AI
                        </span>
                    </Link>
                    {variant === 'chat' && (
                        <>
                            <span className='bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text leading-none text-2xl font-bold text-transparent'>|</span>
                            <p className="text-md leading-none text-muted-foreground hidden sm:block ml-2">
                                Chat AI untuk Komunitas Literasi
                            </p>
                        </>
                    )}
                    {variant === 'admin' && (
                        <>
                            <span className='bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text leading-none text-2xl font-bold text-transparent'>|</span>
                            <p className="text-md leading-none text-muted-foreground hidden sm:block ml-2">
                                Admin Dashboard
                            </p>
                        </>
                    )}
                </div>

                {/* Menu navigasi - hanya di landing page */}
                {variant === 'landing' && (
                    <div className="flex items-center space-x-3">
                        <Link to="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm">Register</Button>
                        </Link>
                    </div>
                )}

                {/* Menu navigasi - hanya di chat page */}
                {variant === 'chat' && user && (
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span className="text-sm hidden sm:inline">{user.nama_lengkap}</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Keluar</span>
                        </Button>
                    </div>
                )}

                {/* Menu navigasi - hanya di admin page */}
                {variant === 'admin' && user && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.username}</span>
                        <Button variant="outline" size="sm" onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
