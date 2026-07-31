"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";

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
            <div className="min-h-screen bg-bg-primary">
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
                    <div className="min-h-screen overflow-auto bg-bg-primary">
                        <Navbar
                            onToggleSidebar={() => setMobileOpen((prev) => !prev)}
                        />
                        <div className="p-4 md:p-6">{children}</div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
