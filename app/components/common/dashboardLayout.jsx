"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "./ProtectedRoute";

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="grid grid-cols-[320px_1fr]">
                <Sidebar />
                <div className="min-h-screen overflow-auto bg-slate-50">
                    <Navbar />
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </ProtectedRoute>
    );
}