"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Plus, Wrench } from "lucide-react";
import { useState } from "react";
import Stars from "./Stars";

export default function ProductCard({ product, store }) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(product.wishlisted);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [added, setAdded] = useState(false);

  const price = product.price || 0;
  const serviceCharge = product.serviceCharge || 0;
  const serviceAvailable = (product.isServiceAvailable || product.services?.length > 0) && serviceCharge > 0;
  const ratingCount = product.ratingCount || 0;
  const discounted = product.discountedPrice > 0 && product.discountedPrice < price;

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.uniqueProductId }),
      });
      if (res.ok) {
        setWishlisted((v) => !v);
      }
    } finally {
      setWishlistBusy(false);
    }
  };

  const addToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.uniqueProductId, quantity: 1 }),
      });
      if (res.ok) {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 1200);
      }
    } catch {
      setAdded(false);
    }
  };

  return (
    <Link
      href={`/products/${product.uniqueProductId}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <button
          onClick={toggleWishlist}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm transition hover:scale-110"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={16}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>
        {serviceAvailable && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
            <Wrench size={10} /> Service available
          </span>
        )}
        {discounted && (
          <span className="absolute bottom-2 left-2 rounded-full bg-red-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
            {Math.round(((price - product.discountedPrice) / price) * 100)}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {store?.name && (
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            {store.name}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.4rem] text-sm font-semibold text-gray-800">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5">
          <Stars value={product.ratingAvg || 0} size={12} />
          <span className="text-[10px] text-gray-400">
            ({ratingCount})
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            {discounted && (
              <p className="text-[10px] text-gray-400 line-through">${price.toFixed(2)}</p>
            )}
            <p className="text-sm font-bold text-gray-900">
              ${(discounted ? product.discountedPrice : price).toFixed(2)}
            </p>
          </div>
          <button
            onClick={addToCart}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              added
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Plus size={12} />
            {added ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
