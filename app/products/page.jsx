"use client";

import PublicHeader from "@/app/components/common/PublicHeader";
import Pagination from "@/app/components/common/Pagination";
import Logo from "@/app/components/common/Logo";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, Store, Wrench } from "lucide-react";

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stores");
        const stores = (await res.json()).filter((s) => !s.disabled);
        const all = [];
        await Promise.all(
          stores.map(async (s) => {
            try {
              const r = await fetch(`/api/stores/${s.uniqueStoreId}/products`);
              const products = await r.json();
              all.push(
                ...(products || [])
                  .filter((p) => p.isActive !== false)
                  .map((p) => ({ ...p, storeName: s.name }))
              );
            } catch {
              // skip store
            }
          })
        );
        setProducts(all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pageCount = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const ctaHref = user ? "/shop" : "/auth";

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Products</h1>
            <p className="text-sm text-text-muted mt-1">
              {loading ? "Loading..." : `${products.length} products from local stores`}
            </p>
          </div>

          {loading ? (
            <div className="text-sm text-text-muted">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
              No products available yet. Check back soon.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <p className="font-semibold text-text-primary">{p.currency === "INR" ? "₹" : "$"}{p.price}</p>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{p.description}</p>
                      {p.storeName && (
                        <p className="text-xs text-primary-400 mt-1.5 flex items-center gap-1">
                          <Store className="w-3 h-3" /> {p.storeName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-text-muted">
                      <span>{p.quantity} in stock</span>
                      {p.unit && <span> · {p.unit}</span>}
                      {(p.services?.length || 0) > 0 && (
                        <span className="flex items-center gap-1 mt-1">
                          <Wrench className="w-3 h-3" /> {p.services.length} service{p.services.length > 1 ? "s" : ""} available
                        </span>
                      )}
                    </div>
                    <Link
                      href={ctaHref}
                      className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary-500 text-white px-4 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors"
                    >
                      {user ? "Add to Cart" : "Sign in to Shop"}
                    </Link>
                  </div>
                ))}
              </div>
              <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
            </>
          )}
        </div>
      </main>
      <footer className="border-t border-border-default bg-bg-primary py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo showText={false} />
            <span className="text-sm font-semibold text-text-primary">B2C Store</span>
          </div>
          <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} B2C Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}