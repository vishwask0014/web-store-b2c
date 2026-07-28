"use client";

import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/tailgrids/core/button";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, Search } from "lucide-react";

const PAGE_TITLES = {
    dashboard: "Dashboard",
    store: "Store",
    products: "Products",
    admin: "Admin",
    users: "Users",
    settings: "Settings",
    "profile-settings": "Profile",
};

const ROLE_STYLES = {
    admin: "bg-indigo-100 text-indigo-700",
    seller: "bg-emerald-100 text-emerald-700",
    operator: "bg-amber-100 text-amber-700",
    customer: "bg-slate-100 text-slate-700",
};

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, userType } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const segments = pathname?.split("/").filter(Boolean) || [];
    const currentPage = segments[segments.length - 1] || "dashboard";
    const pageTitle = PAGE_TITLES[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    const initials = user?.displayName
        ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const roleStyle = ROLE_STYLES[userType] || ROLE_STYLES.customer;

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            router.push("/");
        } catch (error) {
            console.log("error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
                {segments.length > 1 && (
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400">
                        {segments.map((seg, i) => (
                            <span key={seg} className="flex items-center gap-1.5">
                                {i > 0 && <span>/</span>}
                                <span className={i === segments.length - 1 ? "text-slate-700 font-medium" : ""}>
                                    {PAGE_TITLES[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)}
                                </span>
                            </span>
                        ))}
                    </nav>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                    <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white">
                            {initials}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-slate-700 leading-tight">
                                {user?.displayName || "User"}
                            </p>
                            {userType && (
                                <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded ${roleStyle}`}>
                                    {userType.charAt(0).toUpperCase() + userType.slice(1)}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="xs"
                        iconOnly
                        onClick={handleLogout}
                        isDisabled={isLoading}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}