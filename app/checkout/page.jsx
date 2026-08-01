"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/stores/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  CreditCard,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Check,
  Smartphone,
  Zap,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { errorClass, successClass, inputClass, labelClass } from "@/app/components/AuthForm/authStyles";

const TEST_MODE = (process.env.NEXT_PUBLIC_PAYMENT_MODE || "test") !== "live";

let razorpayScriptPromise = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

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

  useEffect(() => {
    void loadRazorpayScript();
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serviceTotal = items.reduce((sum, i) => sum + (i.serviceCharge || 0) * i.quantity, 0);
  const total = subtotal + serviceTotal;

  const placeOrderManual = async () => {
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

  const createOrderWithPayment = async (razorpayOrderId, razorpayPaymentId, amountMinor) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.uid, location, razorpayOrderId, razorpayPaymentId, amountMinor }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const payWithRazorpay = async () => {
    setError("");
    if (!user) return;
    setPlacing(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready) {
        throw new Error("Razorpay checkout could not be loaded. Check your internet connection.");
      }

      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      const options = {
        key: orderData.keyId,
        amount: orderData.amountMinor,
        currency: orderData.currency,
        name: "B2C Store",
        description: `Order ${orderData.receipt}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: profile?.phone || "",
        },
        theme: { color: "#3B82F6" },
        save_card: true,
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                amountMinor: orderData.amountMinor,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error);

            const order = await createOrderWithPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              orderData.amountMinor
            );
            setPlacedOrder(order);
            fetchCart(user.uid);
          } catch (err) {
            setError(err.message);
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(response?.error?.description || "Payment failed. Please try again.");
        setPlacing(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
      setPlacing(false);
    }
  };

  const simulatePay = async () => {
    setError("");
    if (!user) return;
    setPlacing(true);
    try {
      const order = await createOrderWithPayment("", `pay_test_${Date.now()}`, Math.round(total * 100));
      setPlacedOrder(order);
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
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-3xl border border-white/5 bg-[#18181B] p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100">Order placed!</h1>
          <p className="text-sm text-zinc-500">
            Order <span className="font-medium text-zinc-100">{placedOrder.orderId}</span> has been placed.
            Total charged: <span className="font-medium text-zinc-100">${placedOrder.total.toFixed(2)}</span>
          </p>
          {placedOrder.paid && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Check className="h-3.5 w-3.5" /> Paid via Razorpay{TEST_MODE ? " (test)" : ""}
            </span>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/orders"
              className="rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
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
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/5 bg-[#18181B] p-10 text-center">
          <p className="text-sm text-zinc-500">Your cart is empty — nothing to check out.</p>
          <Link href="/shop" className="text-sm font-medium text-blue-400 hover:text-blue-300">
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
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Checkout</h1>
            <p className="mt-1 text-sm text-zinc-500">Review your order and pay</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {TEST_MODE && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-medium text-amber-400">
                Test mode — no real money
              </span>
            )}
            <Link href="/cart" className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300">
              Back to cart
            </Link>
          </div>
        </div>

        {error && <div className={errorClass}>{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-100">Delivery Location</h2>
              </div>
              <div className="grid max-w-md gap-3">
                <input
                  placeholder="Street address"
                  value={location.address || ""}
                  onChange={(e) => setLocation((prev) => ({ ...prev, address: e.target.value }))}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    value={location.city || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, city: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="State"
                    value={location.state || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, state: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="Zip / Postal code"
                    value={location.zip || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, zip: e.target.value }))}
                    className={inputClass}
                  />
                  <input
                    placeholder="Country"
                    value={location.country || ""}
                    onChange={(e) => setLocation((prev) => ({ ...prev, country: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <h2 className="text-base font-semibold text-zinc-100">Payment Method</h2>
              </div>

              <button
                onClick={payWithRazorpay}
                disabled={placing}
                className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-blue-500/40 bg-blue-500/5 p-4 text-left transition-all hover:border-blue-500/60 hover:bg-blue-500/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-100">Pay with Razorpay</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Cards, UPI, netbanking &amp; wallets — save your card for one-tap fast checkout
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-blue-400">
                  {placing ? <Loader2 className="h-4 w-4 animate-spin" /> : `$${total.toFixed(2)}`}
                </span>
              </button>

              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  or pay with a saved method
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {(profile?.paymentMethods || []).length === 0 ? (
                <div className="flex flex-col items-start gap-3 text-sm text-zinc-500">
                  <p>No saved payment methods on file.</p>
                  <Link
                    href="/profile-settings"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    Add a card or UPI ID in your profile &rarr;
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid max-w-md gap-2">
                    {profile.paymentMethods.map((method) => {
                      const isDefault = profile.defaultPaymentMethod === String(method._id);
                      const isUpi = method.type === "upi";
                      return (
                        <label
                          key={method._id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                            paymentMethodId === String(method._id)
                              ? "border-blue-500/50 bg-blue-500/5"
                              : "border-white/5 hover:border-blue-500/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethodId === String(method._id)}
                            onChange={() => setPaymentMethodId(String(method._id))}
                            className="accent-blue-500"
                          />
                          {isUpi ? (
                            <Smartphone className="h-4 w-4 text-zinc-400" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-zinc-400" />
                          )}
                          <span className="text-sm text-zinc-200">
                            {isUpi ? method.upiId : `${method.brand || "Card"} \u2022\u2022\u2022\u2022 ${method.last4}`}
                          </span>
                          <span className="ml-auto text-xs text-zinc-500">
                            {isUpi ? "UPI" : method.expiry}
                            {isDefault && " · Default"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => setAutoPay(!autoPay)}
                      className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                        autoPay ? "bg-blue-500" : "bg-zinc-800"
                      }`}
                      aria-pressed={autoPay}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          autoPay ? "translate-x-5" : ""
                        }`}
                      />
                    </button>
                    <span className="text-sm text-zinc-400">
                      Auto payment
                      {autoPay && (
                        <span className="ml-2 flex items-center gap-1 text-xs text-emerald-400">
                          <Check className="h-3 w-3" /> On
                        </span>
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#18181B] p-6 lg:sticky lg:top-6">
            <h2 className="mb-4 text-base font-semibold text-zinc-100">Order Summary</h2>
            <div className="mb-4 grid max-h-72 gap-3 overflow-y-auto pr-1">
              {items.map((i) => {
                const key = `${i.productId}|${i.serviceId || ""}`;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-zinc-200">{i.name}</p>
                      <p className="text-xs text-zinc-500">
                        {i.quantity} × ${i.price}
                        {i.serviceName && ` + ${i.serviceName} ($${i.serviceCharge})`}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-zinc-200">
                      ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="grid gap-1.5 border-t border-white/5 pt-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Services</span>
                <span>${serviceTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 text-base font-semibold text-zinc-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={payWithRazorpay}
              disabled={placing}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.99] disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {placing ? "Opening checkout..." : `Pay with Razorpay · $${total.toFixed(2)}`}
            </button>
            {(profile?.paymentMethods || []).length > 0 && (
              <button
                onClick={placeOrderManual}
                disabled={placing}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                {placing ? "Placing order..." : "Place order with saved method"}
              </button>
            )}
            {TEST_MODE && (
              <button
                onClick={simulatePay}
                disabled={placing}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-6 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/10 disabled:opacity-50"
              >
                <FlaskConical className="h-4 w-4" />
                {placing ? "Simulating..." : "Simulate successful payment (test)"}
              </button>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
