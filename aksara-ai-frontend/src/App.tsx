import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthPage from "@/pages/AuthPage";
import ChatPage from "@/pages/ChatPage";
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
      <Route
        path="/auth"
        element={
          user ? (
            <Navigate to="/" replace />
          ) : (
            <PageWrapper>
              <AuthPage />
            </PageWrapper>
          )
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PageWrapper>
              <ChatPage />
            </PageWrapper>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
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
