import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import ChatPage from "@/pages/ChatPage";
import ProfilePage from '@/pages/ProfilePage';
import ProtectedRoute from "@/components/ProtectedRoute";

// Wrapper sederhana (cuma padding & max-width)
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-gray-50 to-gray-200 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Landing Page - dapat diakses tanpa autentikasi */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Auth routes dengan mode yang berbeda */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/chat" replace />
          ) : (
            <AuthPage mode="login" />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate to="/chat" replace />
          ) : (
            <AuthPage mode="register" />
          )
        }
      />
      {/* Redirect dari /auth ke /login untuk backward compatibility */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <PageWrapper>
              <ChatPage />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:conversationId"
        element={
          <ProtectedRoute>
            <PageWrapper>
              <ChatPage />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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
