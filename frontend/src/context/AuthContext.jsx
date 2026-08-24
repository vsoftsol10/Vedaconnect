import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("vedaconnect_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vedaconnect_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken, newUser) => {
    localStorage.setItem("vedaconnect_token", newToken);
    localStorage.setItem("vedaconnect_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("vedaconnect_token");
    localStorage.removeItem("vedaconnect_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};