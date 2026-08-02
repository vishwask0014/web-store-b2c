"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ProductCard from "@/app/components/shop/ProductCard";
import Stars from "@/app/components/shop/Stars";
import { useAuth } from "@/app/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  Wrench,
  Store,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [posting, setPosting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const touchX = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/products/${params.productId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Product not found.");
        setData(json);
        setWishlisted(json.product.wishlisted || false);
        setActiveImg(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.productId]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="animate-pulse space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-bg-muted" />
          <div className="h-6 w-2/3 rounded bg-bg-muted" />
          <div className="h-4 w-1/3 rounded bg-bg-muted" />
        </div>
      </ShopLayout>
    );
  }

  if (error || !data) {
    return (
      <ShopLayout>
        <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">{error || "Product not found."}</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-primary-400">
            Back to shop
          </Link>
        </div>
      </ShopLayout>
    );
  }

  const { product, store, related, reviews } = data;
  const images = product.images?.length ? product.images : ["/placeholder.svg"];
  const price = product.price || 0;
  const service = product.services?.find((s) => s.serviceId === serviceId);
  const serviceAvailable =
    (product.isServiceAvailable || product.services?.length > 0) &&
    (product.services?.length > 0 || product.serviceCharge > 0);
  const unitTotal = price + (service?.charges || 0);
  const lineTotal = unitTotal * qty;
  const discounted = product.discountPrice > 0 && product.discountPrice < price;

  const toggleWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.uniqueProductId }),
      });
      if (res.ok) setWishlisted((v) => !v);
    } catch {
      // ignore
    }
  };

  const addToCart = async () => {
    if (!user) {
      router.push("/auth");
      return;
    }
    setAddError("");
    setAdded(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.uniqueProductId,
          quantity: qty,
          serviceId: serviceId || undefined,
          storeName: product.storeName,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add to cart.");
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      router.refresh();
    } catch (err) {
      setAdded(false);
      setAddError(err.message);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/auth");
      return;
    }
    setPosting(true);
    setReviewMsg("");
    setReviewError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.uniqueProductId,
          rating,
          comment: reviewText,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to post review.");
      setReviewMsg("Review posted. Thank you!");
      setReviewText("");
      const refreshed = await fetch(`/api/products/${params.productId}`);
      if (refreshed.ok) setData(await refreshed.json());
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <ShopLayout>
      <div className="flex flex-col gap-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div
              className="relative aspect-square overflow-hidden rounded-2xl border border-border-default bg-bg-surface"
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (dx > 40) setActiveImg((i) => (i - 1 + images.length) % images.length);
                else if (dx < -40) setActiveImg((i) => (i + 1) % images.length);
                touchX.current = null;
              }}
            >
              <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${activeImg * 100}%)` }}
              >
                {images.map((img, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    draggable={false}
                    className="h-full w-full shrink-0 object-cover"
                  />
                ))}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-sm transition hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-sm transition hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
              {serviceAvailable && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  <Wrench size={12} /> Service available
                </span>
              )}
              {discounted && (
                <span className="absolute bottom-3 left-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                  {Math.round(((price - product.discountPrice) / price) * 100)}% OFF
                </span>
              )}
              <button
                onClick={toggleWishlist}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2.5 shadow-sm transition hover:scale-110"
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-500"}
                />
              </button>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
                      i === activeImg
                        ? "border-primary-500"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {product.storeName || product.storeCategory || "Store"}
              </p>
              <h1 className="mt-1 text-xl font-semibold text-text-primary sm:text-2xl">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={product.ratingAvg || 0} size={16} />
                <span className="text-xs text-text-muted">
                  {product.ratingAvg ? product.ratingAvg.toFixed(1) : "No"} ·{" "}
                  {product.ratingCount || 0} review{product.ratingCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-text-primary">
                ${(discounted ? product.discountPrice : price).toFixed(2)}
              </p>
              {discounted && (
                <>
                  <p className="text-sm text-text-muted line-through">${price.toFixed(2)}</p>
                  <p className="text-xs font-semibold text-emerald-600">Save ${(price - product.discountPrice).toFixed(2)}</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-border-default bg-bg-surface p-4 text-xs text-text-secondary">
              <p className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary-400" />
                {product.deliveryMinutes ? `Delivered in ~${product.deliveryMinutes} min` : "Fast delivery"}
                {product.deliveryFee > 0 ? ` · Delivery $${product.deliveryFee.toFixed(2)}` : " · Free delivery"}
                {product.freeDeliveryAbove > 0 && ` above $${product.freeDeliveryAbove.toFixed(2)}`}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400" />
                {product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                {product.unit && ` · ${product.unit}`}
              </p>
            </div>

            {product.services?.length > 0 && (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-4">
                <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary-400" /> Add a service
                </p>
                <div className="mt-3 grid gap-2">
                  {product.services.map((s) => (
                    <label
                      key={s.serviceId}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                        serviceId === s.serviceId
                          ? "border-primary-500/50 bg-primary-500/10"
                          : "border-border-default hover:border-primary-500/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        checked={serviceId === s.serviceId}
                        onChange={() => setServiceId(s.serviceId)}
                        className="accent-primary-500"
                      />
                      <span className="flex flex-1 items-center gap-2 text-text-primary">
                        {s.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.image} alt={s.name} className="h-7 w-7 rounded-lg object-cover" />
                        )}
                        {s.name}
                      </span>
                      <span className="font-medium text-text-primary">
                        +${(s.charges || 0).toFixed(2)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-border-default bg-bg-surface p-1">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="rounded-lg p-2 text-text-secondary hover:bg-bg-muted"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-text-primary">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity || 99, q + 1))}
                  className="rounded-lg p-2 text-text-secondary hover:bg-bg-muted"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={addToCart}
                disabled={product.quantity <= 0}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-40 ${
                  added ? "bg-success/15 text-success" : "bg-primary-500 text-white hover:bg-primary-600"
                }`}
              >
                {added ? (
                  <>
                    <Plus className="w-4 h-4" /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    {product.quantity <= 0 ? "Out of stock" : `Add to cart · $${lineTotal.toFixed(2)}`}
                  </>
                )}
              </button>
            </div>
            {addError && <p className="text-xs font-medium text-danger">{addError}</p>}

            {store && (
              <Link
                href={`/stores/${store.uniqueStoreId}`}
                className="flex items-center gap-3 rounded-2xl border border-border-default bg-bg-surface p-4 transition hover:border-primary-500/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">{store.name}</p>
                  <p className="text-xs text-text-muted">
                    {store.category} · {store.address?.city || "Local store"}
                  </p>
                </div>
                <span className="text-xs font-medium text-primary-400">View store</span>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
          <h2 className="text-base font-semibold text-text-primary">About this product</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {product.description || "No description provided."}
          </p>
          {product.attributes?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {product.attributes.map((a, i) => (
                <div key={i} className="rounded-lg bg-bg-muted px-3 py-2 text-xs">
                  <span className="text-text-muted">{a.key}: </span>
                  <span className="font-medium text-text-primary">{a.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
          <h2 className="text-base font-semibold text-text-primary">Reviews</h2>
          {user ? (
            <form onSubmit={submitReview} className="mt-4 rounded-xl border border-border-default bg-bg-muted p-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    aria-label={`${i} stars`}
                  >
                    <Star
                      size={20}
                      className={
                        i <= rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs text-text-muted">{rating}/5</span>
              </div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this product…"
                rows={3}
                required
                className="mt-3 w-full rounded-lg border border-border-default bg-bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-primary-500"
              />
              {reviewMsg && <p className="mt-2 text-xs font-medium text-success">{reviewMsg}</p>}
              {reviewError && <p className="mt-2 text-xs font-medium text-danger">{reviewError}</p>}
              <button
                type="submit"
                disabled={posting}
                className="mt-3 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
              >
                {posting ? "Posting…" : "Post review"}
              </button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-text-muted">
              <Link href="/auth" className="font-medium text-primary-400">
                Sign in
              </Link>{" "}
              to write a review.
            </p>
          )}

          <div className="mt-5 grid gap-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-text-muted">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="rounded-xl border border-border-default bg-bg-muted p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} size={12} />
                      <span className="text-xs font-medium text-text-primary">
                        {r.userName || "Customer"}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="mt-2 text-sm text-text-secondary">{r.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-text-primary">You may also like</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.uniqueProductId} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
