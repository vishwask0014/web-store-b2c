"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";

export default function DashboardLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-bg-primary">
                <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                    <Sidebar
                        mobileOpen={mobileOpen}
                        onClose={() => setMobileOpen(false)}
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