"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/stores/cartStore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Wrench,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  TicketPercent,
  Truck,
  X,
} from "lucide-react";

export default function CartPage() {
  const { user } = useAuth();
  const { items, updateQuantity, removeItem } = useCartStore();

  const [storeMap, setStoreMap] = useState({});
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("b2c_coupon") || "null");
      return saved?.code ? saved : null;
    } catch {
      return null;
    }
  });
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((list) => {
        const map = {};
        for (const s of list) {
          map[s.uniqueStoreId] = {
            deliveryFee: s.deliveryFee || 0,
            freeDeliveryAbove: s.freeDeliveryAbove || 0,
            etaMinutes: s.etaMinutes || 0,
          };
        }
        setStoreMap(map);
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serviceTotal = items.reduce(
    (sum, i) => sum + (i.serviceCharge || 0) * i.quantity,
    0
  );

  const delivery = useMemo(() => {
    let fee = 0;
    let freeAbove = 0;
    let minutes = 0;
    const byStore = {};
    for (const item of items) {
      if (!item.storeId) continue;
      byStore[item.storeId] = (byStore[item.storeId] || 0) + item.price * item.quantity;
    }
    for (const [storeId, storeSubtotal] of Object.entries(byStore)) {
      const s = storeMap[storeId];
      if (!s) continue;
      if (s.deliveryFee > 0 && storeSubtotal < s.freeDeliveryAbove) fee += s.deliveryFee;
      freeAbove = Math.max(freeAbove, s.freeDeliveryAbove);
      minutes = Math.max(minutes, s.etaMinutes);
    }
    return { fee, freeAbove, minutes };
  }, [items, storeMap]);

  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + serviceTotal - discount + delivery.fee);
  const remainingForFree = Math.max(0, delivery.freeAbove - subtotal);

  const applyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      const res = await fetch(
        `/api/coupons?code=${encodeURIComponent(couponInput.trim())}&subtotal=${subtotal}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Invalid coupon.");
      const payload = { code: json.coupon.code, discount: json.coupon.discount };
      setAppliedCoupon(payload);
      localStorage.setItem("b2c_coupon", JSON.stringify(payload));
      setCouponInput("");
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponBusy(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("b2c_coupon");
  };

  return (
    <ShopLayout requireAuth>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Cart</h1>
            <p className="mt-1 text-sm text-text-muted">
              {items.length} item{items.length === 1 ? "" : "s"} in your cart
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 text-sm font-medium text-primary-400 hover:text-primary-500"
          >
            Continue shopping &rarr;
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-default bg-bg-surface p-10 text-center">
            <ShoppingBag className="h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">Your cart is empty.</p>
            <Link href="/shop" className="text-sm font-medium text-primary-400 hover:text-primary-500">
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {items.map((i) => {
                const key = `${i.productId}|${i.serviceId || ""}`;
                return (
                  <div
                    key={key}
                    className="flex flex-col gap-4 rounded-2xl border border-border-default bg-bg-surface p-5 sm:flex-row sm:items-center"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-bg-muted">
                      {i.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-5 w-5 text-primary-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-primary">{i.name}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{i.storeName || i.storeId}</p>
                      {i.serviceName && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-primary-400">
                          <Wrench className="h-3 w-3" /> + {i.serviceName} (${i.serviceCharge})
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1 rounded-xl border border-border-default bg-bg-muted p-1">
                        <button
                          onClick={() => updateQuantity(user?.uid, i.productId, i.serviceId, i.quantity - 1)}
                          className="rounded-lg p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm text-text-primary">{i.quantity}</span>
                        <button
                          onClick={() => updateQuantity(user?.uid, i.productId, i.serviceId, i.quantity + 1)}
                          className="rounded-lg p-1 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="w-20 text-right text-sm font-semibold text-text-primary">
                        ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(user?.uid, i.productId, i.serviceId)}
                        className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={applyCoupon} className="rounded-2xl border border-border-default bg-bg-surface p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <TicketPercent className="h-4 w-4 text-primary-400" /> Coupons &amp; offers
              </p>
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5">
                  <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <TicketPercent className="h-4 w-4" /> {appliedCoupon.code}
                    <span className="text-xs text-emerald-600">
                      -${appliedCoupon.discount.toFixed(2)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="rounded-full p-1 text-emerald-600 hover:bg-emerald-100"
                    aria-label="Remove coupon"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter coupon code"
                      className="flex-1 rounded-xl border border-border-default bg-bg-muted px-3 py-2.5 text-sm outline-none transition focus:border-primary-500"
                    />
                    <button
                      type="submit"
                      disabled={couponBusy || !couponInput.trim()}
                      className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="mt-2 text-xs font-medium text-danger">{couponError}</p>}
                </>
              )}
            </form>

            {delivery.freeAbove > 0 && remainingForFree > 0 && (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
                <p className="flex items-center gap-2 text-sm text-text-secondary">
                  <Truck className="h-4 w-4 text-primary-400" />
                  Spend <b className="text-text-primary">${remainingForFree.toFixed(2)}</b> more for free
                  delivery{delivery.minutes > 0 && ` in ~${delivery.minutes} min`}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-muted">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{
                      width: `${Math.min(100, (subtotal / delivery.freeAbove) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border-default bg-bg-surface p-5 sm:flex-row sm:items-end">
              <div className="grid gap-1.5 text-sm">
                <p className="flex justify-between gap-8 text-text-muted">
                  <span>Subtotal</span>
                  <span className="text-text-primary">${subtotal.toFixed(2)}</span>
                </p>
                {serviceTotal > 0 && (
                  <p className="flex justify-between gap-8 text-text-muted">
                    <span>Service charges</span>
                    <span className="text-text-primary">${serviceTotal.toFixed(2)}</span>
                  </p>
                )}
                {appliedCoupon && (
                  <p className="flex justify-between gap-8 text-emerald-600">
                    <span>Coupon discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </p>
                )}
                <p className="flex justify-between gap-8 text-text-muted">
                  <span>Delivery fee</span>
                  <span className="text-text-primary">${delivery.fee.toFixed(2)}</span>
                </p>
                <p className="flex justify-between gap-8 text-base font-semibold text-text-primary">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </p>
              </div>
              <Link
                href="/checkout"
                className="rounded-xl bg-primary-500 px-6 py-2.5 text-center text-sm font-medium text-white transition hover:bg-primary-600"
              >
                Checkout &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </ShopLayout>
  );
}
