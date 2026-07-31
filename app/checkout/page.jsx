"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/stores/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, CreditCard, MapPin, ShieldCheck, CheckCircle2, Check, Smartphone } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, fetchCart } = useCartStore();

  const [profile, setProfile] = useState(null);
  const [location, setLocation] = useState({});
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [autoPay, setAutoPay] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/users?uid=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLocation(data.location || {});
        setPaymentMethodId(data.defaultPaymentMethod || "");
        setAutoPay(Boolean(data.autoPay));
      });
  }, [user?.uid]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serviceTotal = items.reduce((sum, i) => sum + (i.serviceCharge || 0) * i.quantity, 0);
  const total = subtotal + serviceTotal;

  const handlePlaceOrder = async () => {
    setError("");
    if (!user) return;
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, location, paymentMethodId, autoPay }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlacedOrder(data);
      fetchCart(user.uid);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <ShopLayout>
        <div className="max-w-lg mx-auto rounded-2xl border border-border-default bg-bg-surface p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center text-success">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Order placed!</h1>
          <p className="text-sm text-text-muted">
            Order <span className="text-text-primary font-medium">{placedOrder.orderId}</span> has been placed.
            Total charged: <span className="text-text-primary font-medium">${placedOrder.total.toFixed(2)}</span>
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/orders"
              className="rounded-xl bg-primary-500 text-white px-5 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="rounded-xl border border-border-default text-text-secondary px-5 py-2.5 text-sm font-medium hover:text-text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (items.length === 0) {
    return (
      <ShopLayout>
        <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center flex flex-col items-center gap-3">
          <p className="text-sm text-text-muted">Your cart is empty — nothing to check out.</p>
          <Link href="/shop" className="text-sm text-primary-400 hover:text-primary-500 font-medium">
            Browse the shop
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Checkout</h1>
            <p className="text-sm text-text-muted mt-1">Review your order and pay</p>
          </div>
          <Link href="/cart" className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0">
            Back to cart
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="flex flex-col gap-6 min-w-0">
            <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Delivery Location</h2>
              </div>
              <div className="grid gap-3 max-w-md">
                <input
                  placeholder="Street address"
                  value={location.address || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
                  className="rounded-xl border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={location.city || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
                    className="rounded-xl border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <input
                    placeholder="State"
                    value={location.state || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))}
                    className="rounded-xl border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <input
                    placeholder="Zip / Postal code"
                    value={location.zip || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, zip: e.target.value }))}
                    className="rounded-xl border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <input
                    placeholder="Country"
                    value={location.country || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, country: e.target.value }))}
                    className="rounded-xl border border-border-default bg-bg-primary px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-text-secondary" />
                <h2 className="text-lg font-semibold text-text-primary">Payment Method</h2>
              </div>
              {(profile?.paymentMethods || []).length === 0 ? (
                <div className="text-sm text-text-muted flex flex-col gap-3 items-start">
                  <p>No payment methods on file.</p>
                  <Link
                    href="/profile-settings"
                    className="text-sm text-primary-400 hover:text-primary-500 font-medium"
                  >
                    Add a card or UPI ID in your profile &rarr;
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2 max-w-md">
                  {profile.paymentMethods.map((method) => {
                    const isDefault = profile.defaultPaymentMethod === String(method._id);
                    const isUpi = method.type === "upi";
                    return (
                      <label
                        key={method._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          paymentMethodId === String(method._id)
                            ? "border-primary-500/60 bg-primary-500/5"
                            : "border-border-default hover:border-primary-500/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethodId === String(method._id)}
                          onChange={() => setPaymentMethodId(String(method._id))}
                          className="accent-primary-500"
                        />
                        {isUpi ? (
                          <Smartphone className="w-4 h-4 text-text-secondary" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-text-secondary" />
                        )}
                        <span className="text-sm text-text-primary">
                          {isUpi ? method.upiId : `${method.brand || "Card"} \u2022\u2022\u2022\u2022 ${method.last4}`}
                        </span>
                        <span className="text-xs text-text-muted ml-auto">
                          {isUpi ? "UPI" : method.expiry}
                          {isDefault && " · Default"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setAutoPay(!autoPay)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 ${autoPay ? "bg-primary-500" : "bg-bg-muted"}`}
                  aria-pressed={autoPay}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoPay ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm text-text-secondary">
                  Auto payment
                  {autoPay && (
                    <span className="ml-2 text-xs text-success flex items-center gap-1">
                      <Check className="w-3 h-3" /> On
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border-default bg-bg-surface p-6 lg:sticky lg:top-20">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h2>
            <div className="grid gap-3 max-h-72 overflow-y-auto pr-1 mb-4">
              {items.map((i) => {
                const key = `${i.productId}|${i.serviceId || ""}`;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400 shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{i.name}</p>
                      <p className="text-xs text-text-muted">
                        {i.quantity} × ${i.price}
                        {i.serviceName && ` + ${i.serviceName} ($${i.serviceCharge})`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-text-primary">
                      ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="grid gap-1.5 text-sm border-t border-border-default pt-4">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Services</span>
                <span>${serviceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-primary font-semibold text-base pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={placing || (profile?.paymentMethods || []).length === 0}
              className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 text-white px-6 py-3 text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-40"
            >
              <ShieldCheck className="w-4 h-4" />
              {placing ? "Placing order..." : `Place Order · $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}