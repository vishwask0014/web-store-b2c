"use client";

import Link from "next/link";
import Logo from "./Logo";
import { ShoppingBag } from "lucide-react";

export default function NotFoundHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="B2C Store home">
          <Logo />
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-primary-500/40 hover:brightness-110 active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" />
          Go to Shop
        </Link>
      </div>
    </header>
  );
}