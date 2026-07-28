"use client";
import { auth } from "@/app/lib/firebase";
import { Button } from "@/components/tailgrids/core/button"
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react"
import ProtectedRoute from "./ProtectedRoute";
import {
    Home,
    User,
    Store,
    Package,
    ChevronDown,
    LogOut,
} from "lucide-react";

const ICONS = {
    home: Home,
    user: User,
    store: Store,
    product: Package,
};

const SideBar = () => {
    const pathname = usePathname();
    const [openSlug, setOpenSlug] = useState("dashboard");

    const sidebarMenu = [
        {
            icons: 'home',
            name: 'Dashboard',
            slug: 'dashboard',
            isChild: true,
            subMenu: [
                {
                    name: 'Store',
                    slug: 'store',
                    icon: 'store'
                },
                {
                    name: 'Products',
                    slug: 'products',
                    icon: 'product'
                },
            ]
        },
        {
            icons: 'user',
            name: 'Profile',
            slug: 'profile-settings',
            isChild: false,
        },
    ].filter((item) => item.name && item.slug);

    return (
        <div className="h-screen w-[320px] bg-slate-950 text-white flex flex-col">
            <div className="px-6 py-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold">
                    ▲
                </div>
                <span className="text-lg font-medium text-white/80">Your Brand</span>
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
                                        ? "bg-indigo-500/15 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-left">{item.name}</span>
                                {item.isChild && (
                                    <ChevronDown
                                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </button>

                            {item.isChild && isOpen && (
                                <div className="ml-4 pl-3 border-l border-white/10 mt-1 flex flex-col gap-1">
                                    {item.subMenu.map((sub) => {
                                        const SubIcon = ICONS[sub.icon] ?? Home;
                                        const subActive = pathname?.includes(sub.slug);
                                        return (
                                            <a
                                                key={sub.slug}
                                                href={`/${item.slug}/${sub.slug}`}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                                                    ${subActive
                                                        ? "bg-indigo-500/15 text-white"
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
    );
};

export const NavBar = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = () => {
        try {
            setIsLoading(true)
            signOut(auth).then(() => {
                router.push('/')
                console.log('successfull logout')
            })
        } catch (error) {
            console.log("error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200 bg-white">
            <span className="text-sm text-slate-500">Dashboard</span>

            <Button
                variant="primary"
                size="sm"
                onClick={handleLogout}
                isDisabled={isLoading}
                className="flex items-center gap-2"
            >
                <LogOut className="w-4 h-4" />
                {isLoading ? "Logging out..." : "Logout"}
            </Button>
        </div>
    )
}

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="grid grid-cols-[320px_1fr]">
                <SideBar />
                {/* main content */}
                <div className="min-h-screen overflow-auto bg-slate-50">
                    <NavBar />
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </ProtectedRoute>
    );
}