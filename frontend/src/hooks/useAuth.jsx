import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cv_id_token");
    const email = localStorage.getItem("cv_email");
    const sub = localStorage.getItem("cv_sub");
    if (token && email) {
      setUser({ email, sub, token });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/login", { email, password });
    const { idToken, accessToken, sub } = data;
    localStorage.setItem("cv_id_token", idToken);
    localStorage.setItem("cv_access_token", accessToken);
    localStorage.setItem("cv_email", email);
    localStorage.setItem("cv_sub", sub);
    setUser({ email, sub, token: idToken });
    return data;
  };

  const signup = async (email, password) => {
    return api.post("/signup", { email, password });
  };

  const confirmSignup = async (email, code) => {
    return api.post("/confirm-signup", { email, code });
  };

  const logout = () => {
    localStorage.removeItem("cv_id_token");
    localStorage.removeItem("cv_access_token");
    localStorage.removeItem("cv_email");
    localStorage.removeItem("cv_sub");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, confirmSignup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
