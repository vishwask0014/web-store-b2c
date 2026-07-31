"use client";

import { useEffect } from "react";
import useAuthStore, { initAuth } from "@/app/stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.userType);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return { user, userType, loading, login, logout, refreshUser };
}

export function AuthProvider({ children }) {
  useEffect(() => {
    initAuth();
  }, []);

  return children;
}
