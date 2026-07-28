"use client";

import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/tailgrids/core/button";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Bell, Search, Menu } from "lucide-react";

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
    admin: "bg-primary-500/15 text-primary-400",
    seller: "bg-success/15 text-success",
    operator: "bg-warning/15 text-warning",
    customer: "bg-slate-500/15 text-text-muted",
};

export default function Navbar({ onToggleSidebar }) {
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
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-divider bg-bg-surface">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-bg-muted transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold text-text-primary truncate">{pageTitle}</h1>
                    {segments.length > 1 && (
                        <nav className="flex items-center gap-1.5 text-xs text-text-muted truncate">
                            {segments.map((seg, i) => (
                                <span key={seg} className="flex items-center gap-1.5">
                                    {i > 0 && <span>/</span>}
                                    <span className={i === segments.length - 1 ? "text-text-secondary font-medium" : ""}>
                                        {PAGE_TITLES[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)}
                                    </span>
                                </span>
                            ))}
                        </nav>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <button className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-bg-muted transition-colors">
                    <Search className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-bg-muted transition-colors relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-border-divider">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white">
                            {initials}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-text-primary leading-tight">
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
                        className="text-text-muted hover:text-danger hover:bg-danger/10"
                    >
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}