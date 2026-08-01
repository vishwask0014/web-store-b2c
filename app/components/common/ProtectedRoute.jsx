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
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
          <span className="text-sm text-zinc-500">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (requiredRole && userType !== requiredRole) {
    return null;
  }

  return children;
}