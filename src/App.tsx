import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { getPlatformDirection } from "./locales";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const dir = getPlatformDirection();
  
  // Controls showing the landing page or login/registration pages
  const [authView, setAuthView] = useState<"login" | "signup" | null>(null);

  if (loading) {
    return (
      <div dir={dir} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white">
      {!user ? (
        authView ? (
          <LoginPage 
            initialMode={authView} 
            onBack={() => setAuthView(null)} 
          />
        ) : (
          <LandingPage 
            onLogin={() => setAuthView("login")} 
            onRegister={() => setAuthView("signup")} 
          />
        )
      ) : (
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
