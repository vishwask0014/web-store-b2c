"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SplashScreen from "@/components/splash/SplashScreen";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, userType, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('[ProtectedRoute] Auth state:', { loading, hasUser: !!user, userType, pathname });
    
    if (loading) return;
    
    if (!user) {
      console.log('[ProtectedRoute] No user found, redirecting to /auth');
      setIsRedirecting(true);
      router.replace("/auth");
      return;
    }
    
    if (requiredRole && userType !== requiredRole) {
      console.log('[ProtectedRoute] User role mismatch, redirecting to /dashboard');
      setIsRedirecting(true);
      router.replace("/dashboard");
      return;
    }

    setIsRedirecting(false);
  }, [user, userType, loading, router, requiredRole, pathname]);

  // Show loading screen while checking auth or redirecting
  if (loading || !user || isRedirecting) {
    return (
      <SplashScreen
        brand="B2C STORE"
        tagline="your marketplace"
        accent="#3B82F6"
        minDuration={800}
        ready={!loading && !!user && !isRedirecting}
      />
    );
  }

  // Role check failed
  if (requiredRole && userType !== requiredRole) {
    return null;
  }

  return children;
}