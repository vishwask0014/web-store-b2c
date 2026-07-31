"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/app/lib/firebase";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore, initCart } from "@/app/stores/cartStore";
import ProtectedRoute from "./ProtectedRoute";
import Logo from "./Logo";
import { signOut } from "firebase/auth";
import { ShoppingCart, LogOut, Store } from "lucide-react";

if (typeof window !== "undefined") {
  initCart();
}

export default function ShopLayout({ children }) {
  const router = useRouter();
  const { user, userType } = useAuth();
  const { items, fetchCart } = useCartStore();

  useEffect(() => {
    if (user?.uid) {
      fetchCart(user.uid);
    }
  }, [user?.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-bg-primary">
        <header className="sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center justify-between border-b border-border-divider bg-bg-surface">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-6">
              <Link
                href="/shop"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                Shop
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {userType !== "customer" && (
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-muted transition-colors"
              >
                <Store className="w-4 h-4" />
                Seller Dashboard
              </Link>
            )}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-border-divider">
              <Link
                href="/profile-settings"
                title="Profile"
                className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-semibold text-white hover:opacity-80 transition-opacity"
              >
                {user?.displayName
                  ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                  : "U"}
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 md:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}