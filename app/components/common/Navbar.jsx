"use client";

import { usePathname } from "next/navigation";
import { Search, Menu, ChevronRight } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";

const PAGE_TITLES = {
    dashboard: "Dashboard",
    store: "Store",
    products: "Products",
    admin: "Admin",
    users: "Users",
    settings: "Settings",
    "profile-settings": "Profile",
};

export default function Navbar({ onToggleSidebar }) {
    const pathname = usePathname();

    const segments = pathname?.split("/").filter(Boolean) || [];
    const currentPage = segments[segments.length - 1] || "dashboard";
    const pageTitle = PAGE_TITLES[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

    return (
        <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-border-default bg-bg-primary/75 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onToggleSidebar}
                    className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-bg-muted transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight text-text-primary truncate">
                        {pageTitle}
                    </h1>
                    {segments.length > 1 && (
                        <nav className="flex items-center gap-1 text-xs text-text-muted truncate" aria-label="Breadcrumb">
                            {segments.map((seg, i) => {
                                const label = PAGE_TITLES[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
                                const isLast = i === segments.length - 1;
                                return (
                                    <span key={seg} className="flex items-center gap-1">
                                        {i > 0 && <ChevronRight className="w-3 h-3 text-border-divider" />}
                                        <span className={isLast ? "text-text-secondary font-medium" : ""}>
                                            {label}
                                        </span>
                                    </span>
                                );
                            })}
                        </nav>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button
                    className="p-2 rounded-xl text-text-muted hover:text-text-secondary hover:bg-bg-muted transition-colors"
                    aria-label="Search"
                >
                    <Search className="w-5 h-5" />
                </button>
                <NotificationBell />

                <div className="flex items-center pl-3 border-l border-border-divider">
                    <ProfileDropdown compact />
                </div>
            </div>
        </div>
    );
}
