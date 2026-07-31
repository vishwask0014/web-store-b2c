"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "@/app/providers/AuthProvider";
import { Menu, X, ShoppingBag, Store } from "lucide-react";

const LINKS = [
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/stores", label: "Stores", icon: Store },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href) => pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="B2C Store home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border-divider bg-bg-surface/80 p-1 md:flex">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary-500/15 text-primary-400 shadow-sm"
                    : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NotificationBell />
              <ProfileDropdown compact />
            </>
          ) : (
            <Link
              href="/auth"
              className="rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-primary-500/40 hover:brightness-110 active:scale-95"
            >
              Get Started
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-xl p-2 text-text-muted hover:bg-bg-muted hover:text-text-primary transition-colors md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-border-divider bg-bg-surface/95 backdrop-blur-xl px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive(l.href)
                      ? "bg-primary-500/15 text-primary-400"
                      : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            <Link
              href={user ? "/shop" : "/auth"}
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white"
            >
              {user ? "Go to Shop" : "Get Started"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
