import Link from "next/link";
import Logo from "@/app/components/common/Logo";
import { Home, ShoppingBag, ArrowRight, Compass, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />

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

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-400">
          <Compass className="h-4 w-4" />
          Page not found
        </div>

        <h1 className="bg-gradient-to-b from-text-primary to-text-muted bg-clip-text text-[7rem] font-black leading-none tracking-tight text-transparent sm:text-[10rem]">
          404
        </h1>

        <div className="flex flex-col items-center gap-2">
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-text-primary sm:text-3xl">
            <Sparkles className="h-6 w-6 text-primary-400" />
            Looks like you&apos;re lost
          </h2>
          <p className="max-w-md text-base leading-relaxed text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Head back to the shop and keep browsing.
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-primary-500/40 hover:brightness-110 active:scale-95"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-surface px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-primary-500/40 hover:text-primary-400"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse the Shop
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-border-default bg-bg-primary py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2">
            <Logo showText={false} />
            <span className="text-sm font-semibold text-text-primary">B2C Store</span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} B2C Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
