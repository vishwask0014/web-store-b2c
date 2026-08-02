"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ProductCard from "@/app/components/shop/ProductCard";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

const CATEGORIES = [
  { key: "", emoji: "🛍️", label: "All" },
  { key: "grocery", emoji: "🛒", label: "Grocery" },
  { key: "vegetables", emoji: "🥬", label: "Vegetables" },
  { key: "fruits", emoji: "🍎", label: "Fruits" },
  { key: "dairy", emoji: "🥛", label: "Dairy" },
  { key: "beverages", emoji: "🧃", label: "Beverages" },
  { key: "snacks", emoji: "🍿", label: "Snacks" },
  { key: "bakery", emoji: "🥖", label: "Bakery" },
  { key: "electronics", emoji: "📱", label: "Electronics" },
  { key: "clothing", emoji: "👕", label: "Clothing" },
  { key: "home", emoji: "🏠", label: "Home" },
  { key: "beauty", emoji: "💄", label: "Beauty" },
  { key: "pharmacy", emoji: "💊", label: "Pharmacy" },
];

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "popular", label: "Most popular" },
  { key: "rating", label: "Top rated" },
  { key: "price_asc", label: "Price: low to high" },
  { key: "price_desc", label: "Price: high to low" },
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
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
        if (category) params.set("category", category);
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
  }, [query, category, sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <ShopLayout>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Shop</h1>
          <p className="mt-1 text-sm text-text-muted">
            Everything you need, delivered fast
          </p>
        </div>

        <form onSubmit={submitSearch} className="relative">
          <Search className="absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, categories…"
            className="w-full rounded-2xl border border-border-default bg-bg-surface py-3 pl-10 pr-10 text-sm outline-none transition focus:border-primary-500"
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

        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  category === c.key
                    ? "bg-primary-500 text-white"
                    : "border border-border-default bg-bg-surface text-text-secondary hover:bg-bg-muted"
                }`}
              >
                <span className="mr-1">{c.emoji}</span>
                {c.label}
              </button>
            ))}
          </div>
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
