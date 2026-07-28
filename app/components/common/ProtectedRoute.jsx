"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (requiredRole && userType !== requiredRole) {
    return null;
  }

  return children;
}