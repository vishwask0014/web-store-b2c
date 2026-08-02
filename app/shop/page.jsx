"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ProductCard from "@/app/components/shop/ProductCard";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Sparkles } from "lucide-react";

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "popular", label: "Most popular" },
  { key: "rating", label: "Top rated" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

export default function ShopPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ sort });
        if (query) params.set("search", query);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load products.");
        if (!cancelled) setProducts(data.products || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [query, sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <ShopLayout>
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-border-default bg-gradient-to-br from-bg-surface via-bg-surface to-primary-500/10 px-6 py-8 sm:px-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-56 w-56 rounded-full bg-primary-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-5">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary-400">
                <Sparkles className="h-3.5 w-3.5" />
                {user?.name ? `Welcome back, ${user.name.split(" ")[0]}` : "Welcome back"}
              </p>
              <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Shop
              </h1>
              <p className="mt-1.5 text-sm text-text-muted">
                Everything you need, delivered fast
              </p>
            </div>

            <form onSubmit={submitSearch} className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, categories…"
                className="w-full rounded-2xl border border-border-default bg-bg-primary/80 py-3.5 pl-11 pr-11 text-sm outline-none backdrop-blur transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted hover:bg-bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-text-muted">
            {loading ? "Loading products…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>
          <div className="relative shrink-0">
            <SlidersHorizontal className="pointer-events-none absolute left-2.5 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-border-default bg-bg-surface py-2 pl-8 pr-6 text-xs font-medium text-text-secondary outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-bg-muted"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
            {query
              ? `No products match "${query}".`
              : "No products available yet. Check back soon."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.uniqueProductId} product={p} />
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
