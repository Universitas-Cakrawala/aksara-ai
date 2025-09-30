import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="border-t bg-white/50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                        <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-xl font-bold text-transparent">
                            Aksara AI
                        </span>
                        <span className="text-sm text-muted-foreground">© 2025 - Platform Literasi AI</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
