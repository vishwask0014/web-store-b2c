"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/tailgrids/core/button";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/stores", label: "Stores" },
];

export default function PublicHeader() {
  const pathname = usePathname();
  const { user, userType } = useAuth();

  const dashboardHref = userType === "customer" ? "/shop" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-colors ${
                pathname?.startsWith(l.href) ? "text-primary-400" : "hover:text-text-primary"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href={user ? dashboardHref : "/auth"}>
          <Button variant={user ? "secondary" : "primary"} size="sm">
            {user ? "Dashboard" : "Get Started"}
          </Button>
        </Link>
      </div>
    </header>
  );
}