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
import { ShoppingCart, Store, LayoutDashboard, Heart, Package, User } from "lucide-react";

if (typeof window !== "undefined") {
  initCart();
}

export default function ShopLayout({ children, requireAuth = false }) {
  const pathname = usePathname();
  const { user, userType } = useAuth();
  const { items, fetchCart } = useCartStore();

  useEffect(() => {
    if (user?.uid) {
      fetchCart(user.uid);
    }
  }, [user?.uid]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const content = (
    <div className="min-h-screen bg-bg-primary">
        <header className="sticky top-0 z-30 h-16 px-4 md:px-8 flex items-center justify-between border-b border-border-default bg-bg-primary/75 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Link href="/shop" className="flex items-center gap-2">
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
            {user ? (
              <div className="pl-3 md:pl-4 border-l border-border-divider hidden sm:block">
                <ProfileDropdown />
              </div>
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium shadow-md shadow-primary-500/25 hover:bg-primary-600 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4 md:p-8 pb-24 lg:pb-8">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border-default bg-bg-surface/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {[
              { href: "/shop", label: "Shop", icon: Store },
              { href: "/wishlist", label: "Wishlist", icon: Heart },
              { href: "/cart", label: "Cart", icon: ShoppingCart, badge: count },
              { href: "/orders", label: "Orders", icon: Package },
              { href: "/profile-settings", label: "Profile", icon: User },
            ].map((item) => {
              const active = pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                    active ? "text-primary-400" : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <span className="relative">
                    <item.icon className="h-5 w-5" />
                    {item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
  );

  if (requireAuth) {
    return <ProtectedRoute>{content}</ProtectedRoute>;
  }

  return content;
}