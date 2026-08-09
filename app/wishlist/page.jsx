"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ProductCard from "@/app/components/shop/ProductCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) throw new Error("Failed to load wishlist.");
        setItems(await res.json());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onRemoved = async (productId) => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      setItems((prev) => prev.filter((p) => p.uniqueProductId !== productId));
    } catch {
      // ignore
    }
  };

  return (
    <ShopLayout requireAuth>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-text-primary">
            <Heart className="w-5 h-5 text-red-500" /> My Wishlist
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {items.length} saved item{items.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-bg-muted" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center">
            <Heart className="mx-auto w-10 h-10 text-text-muted" />
            <p className="mt-3 text-sm text-text-muted">
              No saved items yet. Tap the heart on any product to save it here.
            </p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <div key={p.uniqueProductId}>
                <ProductCard product={p} />
                <button
                  onClick={() => onRemoved(p.uniqueProductId)}
                  className="mt-1 w-full rounded-lg py-1.5 text-xs font-medium text-danger hover:bg-danger/5"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
