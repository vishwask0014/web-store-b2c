"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  LogOut,
  User,
  ChevronDown,
  ShoppingCart,
  Store,
  Package,
  LayoutDashboard,
} from "lucide-react";

const ROLE_STYLES = {
  admin: "bg-primary-500/15 text-primary-400",
  seller: "bg-success/15 text-success",
  operator: "bg-warning/15 text-warning",
  customer: "bg-slate-500/15 text-text-muted",
};

export default function ProfileDropdown({ compact = false }) {
  const router = useRouter();
  const { user, userType, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const displayName = user?.name || user?.displayName || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const avatar = user?.avatar || "";

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch {
      // Firebase session may already be gone
    }
    await logout();
    router.push("/");
    setIsLoading(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-xl transition-colors ${
          compact ? "p-1" : "p-1.5 hover:bg-bg-muted"
        }`}
        aria-label="Account menu"
      >
        <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>
        {!compact && <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border-default bg-bg-surface shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border-divider">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white overflow-hidden shrink-0">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email || user?.phone || "No email on file"}</p>
                </div>
                {userType && (
                  <span
                    className={`ml-auto inline-block shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${ROLE_STYLES[userType] || ROLE_STYLES.customer}`}
                  >
                    {userType}
                  </span>
                )}
              </div>
            </div>

            <div className="py-1.5">
              <Link
                href="/profile-settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <User className="w-4 h-4" /> Profile Settings
              </Link>
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <Package className="w-4 h-4" /> My Orders
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Cart
              </Link>
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <Store className="w-4 h-4" /> Shop
              </Link>
              {userType !== "customer" && (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" /> Seller Dashboard
                </Link>
              )}
            </div>

            <div className="border-t border-border-divider py-1.5">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
