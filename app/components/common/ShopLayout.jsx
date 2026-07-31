"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore, initCart } from "@/app/stores/cartStore";
import ProtectedRoute from "./ProtectedRoute";
import Logo from "./Logo";
import ProfileDropdown from "./ProfileDropdown";
import NotificationBell from "./NotificationBell";
import { ShoppingCart, Store, LayoutDashboard } from "lucide-react";

if (typeof window !== "undefined") {
  initCart();
}

export default function ShopLayout({ children }) {
  const pathname = usePathname();
  const { user, userType } = useAuth();
  const { items, fetchCart } = useCartStore();

  useEffect(() => {
    if (user?.uid) {
      fetchCart(user.uid);
    }
  }, [user?.uid]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary">
        <header className="sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center justify-between border-b border-border-default bg-bg-primary/75 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-4 rounded-full border border-border-divider bg-bg-surface/80 p-1">
              <Link
                href="/shop"
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  pathname === "/shop"
                    ? "bg-primary-500/15 text-primary-400 shadow-sm"
                    : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Shop
              </Link>
              {userType !== "customer" && (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-bg-muted hover:text-text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {userType !== "customer" && (
              <Link
                href="/dashboard"
                className="hidden sm:flex md:hidden items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <Store className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            <NotificationBell />
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-md shadow-primary-500/30">
                  {count}
                </span>
              )}
            </Link>
            <div className="pl-3 md:pl-4 border-l border-border-divider">
              <ProfileDropdown />
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 md:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}