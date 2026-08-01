"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import SplashScreen from "@/components/splash/SplashScreen";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth");
      return;
    }
    if (requiredRole && userType !== requiredRole) {
      router.replace("/dashboard");
    }
  }, [user, userType, loading, router, requiredRole]);

  if (loading || !user) {
    return (
      <SplashScreen
        brand="B2C STORE"
        tagline="your marketplace"
        accent="#3B82F6"
        minDuration={800}
        ready={!loading && !!user}
      />
    );
  }

  if (requiredRole && userType !== requiredRole) {
    return null;
  }

  return children;
}