import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';
import LandingPage from '@/pages/LandingPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Wrapper sederhana (cuma padding & max-width)
const PageWrapper: React.FC<{ children: React.ReactNode; fullWidth?: boolean }> = ({ children, fullWidth = false }) => {
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-orange-100 via-gray-50 to-gray-200">
            <main className={`flex flex-1 ${fullWidth ? '' : 'items-center justify-center px-4'}`}>
                <div className={fullWidth ? 'w-full' : 'w-full max-w-4xl'}>{children}</div>
            </main>
        </div>
    );
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Landing Page - dapat diakses tanpa autentikasi */}
            <Route path="/" element={<PageWrapper fullWidth><LandingPage /></PageWrapper>} />

            {/* Auth routes dengan mode yang berbeda */}
            <Route
                path="/login"
                element={
                    <PageWrapper fullWidth>
                        {user ? (
                            user.role === 'ADMIN' ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <Navigate to="/chat" replace />
                            )
                        ) : (
                            <AuthPage mode="login" />
                        )}
                    </PageWrapper>
                }
            />
            <Route
                path="/register"
                element={
                    <PageWrapper fullWidth>
                        {user ? (
                            user.role === 'ADMIN' ? (
                                <Navigate to="/admin" replace />
                            ) : (
                                <Navigate to="/chat" replace />
                            )
                        ) : (
                            <AuthPage mode="register" />
                        )}
                    </PageWrapper>
                }
            />
            {/* Redirect dari /auth ke /login untuk backward compatibility */}
            <Route path="/auth" element={<Navigate to="/login" replace />} />
            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <PageWrapper fullWidth>
                            <ChatPage />
                        </PageWrapper>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="ADMIN">
                        <PageWrapper fullWidth>
                            <AdminPage />
                        </PageWrapper>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <PageWrapper fullWidth>
                            <ProfilePage />
                        </PageWrapper>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;
