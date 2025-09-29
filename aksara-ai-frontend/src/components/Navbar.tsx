import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  variant?: 'landing' | 'auth';
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'landing' }) => {
  return (
    <nav className={`w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 ${
      variant === 'landing' ? 'sticky top-0 z-50' : ''
    }`}>
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">          
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Aksara AI
            </span>
          </Link>
        </div>
        
        {/* Menu navigasi - hanya di landing page */}
        {variant === 'landing' && (
          <>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;