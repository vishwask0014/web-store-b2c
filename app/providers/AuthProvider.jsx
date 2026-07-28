"use client";

import { useEffect } from "react";
import useAuthStore, { initAuth } from "@/app/stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const userType = useAuthStore((s) => s.userType);
  const loading = useAuthStore((s) => s.loading);
  return { user, userType, loading };
}

export function AuthProvider({ children }) {
  useEffect(() => {
    initAuth();
  }, []);

  return children;
}