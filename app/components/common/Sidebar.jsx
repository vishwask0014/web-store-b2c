"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home,
    User,
    Store,
    Package,
    ChevronDown,
    Shield,
    Settings,
    X,
} from "lucide-react";

const ROLE_BADGE = {
    admin: "bg-primary-500/15 text-primary-400 border-primary-500/30",
    seller: "bg-success/15 text-success border-success/30",
    operator: "bg-warning/15 text-warning border-warning/30",
    customer: "bg-slate-500/15 text-text-muted border-slate-500/30",
};

const ICONS = {
    home: Home,
    user: User,
    store: Store,
    product: Package,
    shield: Shield,
    settings: Settings,
};

export default function Sidebar({ mobileOpen, onClose }) {
    const pathname = usePathname();
    const { userType } = useAuth();
    const [openSlug, setOpenSlug] = useState("dashboard");

    const sidebarMenu = [
        {
            icons: 'home',
            name: 'Dashboard',
            slug: 'dashboard',
            isChild: true,
            subMenu: [
                { name: 'Store', slug: 'store', icon: 'store' },
                { name: 'Products', slug: 'products', icon: 'product' },
            ]
        },
        {
            icons: 'shield',
            name: 'Admin',
            slug: 'admin',
            isChild: true,
            role: 'admin',
            subMenu: [
                { name: 'Users', slug: 'users', icon: 'user' },
                { name: 'Settings', slug: 'settings', icon: 'settings' },
            ]
        },
        {
            icons: 'user',
            name: 'Profile',
            slug: 'profile-settings',
            isChild: false,
        },
    ]
        .filter((item) => item.name && item.slug)
        .filter((item) => !item.role || item.role === userType);

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={onClose}
                />
            )}
            <div
                className={`fixed md:relative z-40 h-screen w-[280px] bg-bg-primary text-text-primary flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 ${
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="px-6 py-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center font-bold text-white">
                                ▲
                            </div>
                            <span className="text-lg font-medium text-text-primary/80">Your Brand</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="md:hidden p-1 rounded-lg text-text-muted hover:text-text-secondary hover:bg-white/5"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {userType && (
                        <div className={`inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium ${ROLE_BADGE[userType] || ROLE_BADGE.customer}`}>
                            {userType.charAt(0).toUpperCase() + userType.slice(1)}
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-3 flex flex-col gap-1 overflow-auto">
                    {sidebarMenu.map((item) => {
                        const Icon = ICONS[item.icons] ?? Home;
                        const isActive = pathname?.includes(item.slug);
                        const isOpen = openSlug === item.slug;

                        return (
                            <div key={item.slug}>
                                <button
                                    onClick={() =>
                                        item.isChild
                                            ? setOpenSlug(isOpen ? "" : item.slug)
                                            : null
                                    }
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                        ${isActive
                                            ? "bg-primary-500/15 text-primary-400"
                                            : "text-text-secondary/60 hover:bg-white/5 hover:text-text-primary"
                                        }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1 text-left">{item.name}</span>
                                    {item.isChild && (
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </button>

                                {item.isChild && isOpen && (
                                    <div className="ml-4 pl-3 border-l border-border-default/30 mt-1 flex flex-col gap-1">
                                        {item.subMenu.map((sub) => {
                                            const SubIcon = ICONS[sub.icon] ?? Home;
                                            const subActive = pathname?.includes(sub.slug);
                                            return (
                                                <a
                                                    key={sub.slug}
                                                    href={`/${item.slug}/${sub.slug}`}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                                                        ${subActive
                                                            ? "bg-primary-500/15 text-primary-400"
                                                            : "text-white/50 hover:bg-white/5 hover:text-white"
                                                        }`}
                                                >
                                                    <SubIcon className="w-3.5 h-3.5 shrink-0" />
                                                    {sub.name}
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}