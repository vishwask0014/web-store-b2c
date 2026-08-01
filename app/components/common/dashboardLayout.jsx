"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import ProtectedRoute from "./ProtectedRoute";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavbar from "@/components/dashboard/TopNavbar";
import MobileNav from "@/components/dashboard/MobileNav";

const STORAGE_KEY = "b2c_sidebar_collapsed";

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const router = useRouter();
  const { userType, loading } = useAuth();

  useEffect(() => {
    if (!loading && userType === "customer") {
      router.replace("/shop");
    }
  }, [userType, loading, router]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      // storage unavailable
    }
  }, [collapsed]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div
          className={`grid grid-cols-1 transition-[grid-template-columns] duration-300 ${
            collapsed ? "md:grid-cols-[72px_1fr]" : "md:grid-cols-[280px_1fr]"
          }`}
        >
          <Sidebar
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
            onExpand={() => setCollapsed(false)}
          />
          <div className="min-h-screen pb-20 md:pb-0">
            <Suspense fallback={null}>
              <TopNavbar onToggleSidebar={() => setMobileOpen((prev) => !prev)} />
            </Suspense>
            <main className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
