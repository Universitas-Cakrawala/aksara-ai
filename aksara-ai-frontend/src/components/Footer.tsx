import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-white/50">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Aksara AI
            </span>
            <span className="text-sm text-muted-foreground">
              © 2025 - Platform Literasi AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;