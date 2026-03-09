import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import "./styles/global.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState("login"); // login | signup | dashboard

  useEffect(() => {
    if (user) setPage("dashboard");
    else if (page === "dashboard") setPage("login");
  }, [user]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="4" y1="4" x2="36" y2="36">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span>CloudVault</span>
        </div>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (user) return <Dashboard />;

  return page === "login" ? (
    <Login onSwitch={() => setPage("signup")} />
  ) : (
    <Signup onSwitch={() => setPage("login")} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
