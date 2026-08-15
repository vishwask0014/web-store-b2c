"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Button } from "@/components/tailgrids/core/button";

export default function HomepageHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-default bg-bg-primary/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="B2C Store home">
            <Logo />
          </Link>
        </div>
        <nav className="hidden items-center gap-8 text-sm font-medium text-text-secondary md:flex">
          <Link
            href="/shop"
            className="font-semibold text-primary-400 transition-colors hover:text-primary-500"
          >
            Shop
          </Link>
          <Link
            href="/#how-it-works"
            className="transition-colors hover:text-text-primary"
          >
            How It Works
          </Link>
          <Link
            href="/#features"
            className="transition-colors hover:text-text-primary"
          >
            Features
          </Link>
          <Link
            href="/#categories"
            className="transition-colors hover:text-text-primary"
          >
            Categories
          </Link>
        </nav>
        <Link href="/auth">
          <Button variant="primary" size="sm">
            Start Selling
          </Button>
        </Link>
      </div>
    </header>
  );
}