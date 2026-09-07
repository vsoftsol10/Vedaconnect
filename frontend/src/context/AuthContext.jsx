import { createContext, useContext, useState } from "react";
import { setAccessToken } from "../services/api";

const AuthContext = createContext(null);
const AUTH_TOKEN_STORAGE_KEY = "vedaconnect_token";
const AUTH_USER_STORAGE_KEY = "vedaconnect_user";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken, newUser) => {
    setAccessToken(newToken);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((current) => {
      const next = { ...(current || {}), ...updates };
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
