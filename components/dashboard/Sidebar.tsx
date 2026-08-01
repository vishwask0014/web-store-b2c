"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import useAuthStore from "@/app/stores/authStore";
import {
  Home,
  User,
  Store,
  Package,
  ChevronDown,
  Shield,
  Settings,
  X,
  ShoppingBag,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  BarChart3,
  Store as StoreIcon,
} from "lucide-react";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  seller: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  operator: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  customer: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const ICONS: Record<string, typeof Home> = {
  home: Home,
  dashboard: BarChart3,
  user: User,
  store: Store,
  product: Package,
  orders: ShoppingBag,
  shield: Shield,
  settings: Settings,
};

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onExpand: () => void;
}

export default function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse, onExpand }: SidebarProps) {
  const pathname = usePathname();
  const { user, userType } = useAuth();
  const [openSlug, setOpenSlug] = useState("dashboard");

  const sidebarMenu = [
    {
      icons: "dashboard",
      name: "Dashboard",
      slug: "dashboard",
      href: "/dashboard",
    },
    {
      icons: "store",
      name: "Store",
      slug: "store",
      href: "/dashboard/store",
    },
    {
      icons: "product",
      name: "Products",
      slug: "products",
      href: "/dashboard/products",
    },
    {
      icons: "orders",
      name: "Orders",
      slug: "orders",
      href: "/dashboard/orders",
    },
    {
      icons: "shield",
      name: "Admin",
      slug: "admin",
      isChild: true,
      role: "admin",
      subMenu: [
        { name: "Users", slug: "users", icon: "user" },
        { name: "Settings", slug: "settings", icon: "settings" },
      ],
    },
  ].filter((item) => !item.role || item.role === userType);

  const handleSectionClick = (slug: string, isOpen: boolean) => {
    if (collapsed) {
      onExpand();
      setOpenSlug(slug);
      return;
    }
    setOpenSlug(isOpen ? "" : slug);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore — cookie session still cleared below
    }
    await useAuthStore.getState().logout();
    window.location.href = "/";
  };

  const navItemClass = (active: boolean) =>
    `flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
      collapsed ? "justify-center px-0" : ""
    } ${
      active
        ? "rounded-full bg-blue-500 text-white shadow-lg shadow-blue-500/25"
        : "rounded-full text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
    }`;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed md:relative z-40 flex h-screen shrink-0 flex-col bg-[#111113] text-zinc-100 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 py-6 ${collapsed ? "justify-center px-2" : "px-6"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
            <StoreIcon className="h-4.5 w-4.5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">B2C Store</p>
              <p className="text-[11px] text-zinc-500">Marketplace</p>
            </div>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-zinc-300 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {userType && !collapsed && (
          <div className="px-6 pb-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                ROLE_BADGE[userType] || ROLE_BADGE.customer
              }`}
            >
              {userType}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ${collapsed ? "hidden" : ""}`}>
            Menu
          </p>
          <div className="flex flex-col gap-1">
            {sidebarMenu.map((item) => {
              const Icon = ICONS[item.icons] ?? Home;
              const isActive =
                item.slug === "dashboard"
                  ? pathname === "/dashboard"
                  : pathname?.includes(item.slug);
              const isOpen = openSlug === item.slug;

              if (item.href) {
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={navItemClass(isActive)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
                  </Link>
                );
              }

              return (
                <div key={item.slug}>
                  <button
                    onClick={() => handleSectionClick(item.slug, isOpen)}
                    title={collapsed ? item.name : undefined}
                    className={navItemClass(isActive)}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
                    {!collapsed && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {item.isChild && isOpen && !collapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-5 mt-1 flex flex-col gap-0.5 overflow-hidden border-l border-white/[0.06] pl-3"
                      >
                        {item.subMenu.map((sub) => {
                          const SubIcon = ICONS[sub.icon] ?? Home;
                          const subActive = pathname?.includes(`/${item.slug}/${sub.slug}`);
                          return (
                            <Link
                              key={sub.slug}
                              href={`/${item.slug}/${sub.slug}`}
                              className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors ${
                                subActive
                                  ? "bg-blue-500/10 font-medium text-blue-400"
                                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                              }`}
                            >
                              <SubIcon className="h-3.5 w-3.5 shrink-0" />
                              {sub.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            <Link
              href="/profile-settings"
              title={collapsed ? "Profile" : undefined}
              className={navItemClass(pathname?.includes("profile-settings") || false)}
            >
              <User className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="flex-1 text-left">Profile</span>}
            </Link>
          </div>
        </nav>

        {/* Bottom: profile + collapse + logout */}
        <div className="border-t border-white/[0.06] p-3">
          {!collapsed && (
            <Link
              href="/profile-settings"
              className="mb-2 flex items-center gap-3 rounded-full px-2 py-2 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">{user?.name || "Profile"}</p>
                <p className="truncate text-[11px] capitalize text-zinc-500">{userType || "Member"}</p>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-300"
            >
              {collapsed ? <PanelLeftOpen className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
              {!collapsed && <span className="text-xs font-medium">Collapse</span>}
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4.5 w-4.5" />
              {!collapsed && <span className="text-xs font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
