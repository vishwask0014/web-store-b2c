"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ItemTimeline, { ShippingInfo } from "@/components/dashboard/ItemTimeline";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  MapPin,
  CreditCard,
  RotateCcw,
  Ban,
  Truck,
  CheckCircle2,
} from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-primary-500/15 text-primary-400",
  shipped: "bg-primary-500/15 text-primary-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");
  const [confirming, setConfirming] = useState("");

  const load = () => {
    if (!user?.uid) return;
    fetch(`/api/orders?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const cancelOrder = async (order) => {
    if (!window.confirm(`Cancel order #${order.orderId}?`)) return;
    setCancelling(order.orderId);
    try {
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not cancel order.");
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setCancelling("");
    }
  };

  const confirmDelivery = async (order) => {
    if (!window.confirm("Confirm that you received this order? This releases payment to the store.")) return;
    setConfirming(order.orderId);
    try {
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm_delivery" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not confirm delivery.");
      load();
    } catch (err) {
      window.alert(err.message);
    } finally {
      setConfirming("");
    }
  };

  const buyAgain = async (order) => {
    let ok = 0;
    for (const item of order.items) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
            serviceId: item.serviceId || undefined,
            storeName: item.storeName,
          }),
        });
        if (res.ok) ok += 1;
      } catch {
        // skip item
      }
    }
    if (ok > 0) {
      router.push("/cart");
      router.refresh();
    } else {
      window.alert("Items could not be re-added. They may be out of stock.");
    }
  };

  const cancellable = (o) => ["pending", "confirmed"].includes(o.status);

  return (
    <ShopLayout requireAuth>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">My Orders</h1>
            <p className="mt-1 text-sm text-text-muted">Track your purchases</p>
          </div>
          <Link href="/shop" className="shrink-0 text-sm font-medium text-primary-400 hover:text-primary-500">
            Continue shopping &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-text-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-default bg-bg-surface p-10 text-center">
            <ShoppingBag className="h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-muted">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="text-sm font-medium text-primary-400 hover:text-primary-500">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-2xl border border-border-default bg-bg-surface p-5">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-text-primary">Order #{o.orderId}</p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLES[o.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {o.status}
                    </span>
                    <p className="text-lg font-semibold text-text-primary">
                      ${(o.total || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid gap-3">
                  {o.items.map((i, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 ${
                        i.cancelledAt ? "border-danger/30 bg-danger/5" : "border-border-default bg-bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/15 text-primary-400">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-text-primary">{i.name}</p>
                          <p className="text-xs text-text-muted">
                            {i.storeName} · {i.quantity} × ${i.price}
                            {i.serviceName && ` + ${i.serviceName} ($${i.serviceCharge})`}
                          </p>
                        </div>
                        <p className="font-medium text-text-primary">
                          ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                        </p>
                      </div>
                      {o.status !== "cancelled" && !i.cancelledAt && <ItemTimeline item={i} />}
                      {i.shippedAt && o.status !== "cancelled" && <ShippingInfo item={i} />}
                      {o.status === "shipped" && o.shipping?.trackingNumber && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-primary-400">
                          <Truck className="h-3 w-3" />
                          {o.shipping.courier || "Courier"}: <b>{o.shipping.trackingNumber}</b>
                          {o.shipping.estimatedDelivery &&
                            ` · by ${new Date(o.shipping.estimatedDelivery).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {(o.discount > 0 || o.deliveryFee > 0) && (
                  <div className="mb-3 grid gap-1 border-t border-border-default pt-3 text-xs text-text-muted">
                    {o.discount > 0 && (
                      <p className="flex justify-between">
                        <span>Coupon {o.couponCode}</span>
                        <span className="text-emerald-600">-${o.discount.toFixed(2)}</span>
                      </p>
                    )}
                    <p className="flex justify-between">
                      <span>Delivery fee</span>
                      <span className="text-text-primary">${(o.deliveryFee || 0).toFixed(2)}</span>
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 border-t border-border-default pt-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {o.paymentMethod?.type === "razorpay"
                      ? `Razorpay ${o.paid ? "· Paid" : ""}${o.paymentMethod?.last4 ? ` •••• ${o.paymentMethod.last4}` : ""}`
                      : o.paymentMethod?.type === "upi"
                        ? o.paymentMethod.upiId || "UPI"
                        : `${o.paymentMethod?.brand || "Card"} \u2022\u2022\u2022\u2022 ${o.paymentMethod?.last4 || "----"}`}
                    {o.autoPaid && " · Auto-paid"}
                  </span>
                  {(o.deliveryLocation?.city || o.deliveryLocation?.address) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {[o.deliveryLocation.address, o.deliveryLocation.city, o.deliveryLocation.state]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </div>

                {o.cancellation && (
                  <p className="mt-3 rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger">
                    Cancelled {o.cancellation.by === "customer" ? "by you" : "by the store"} on{" "}
                    {new Date(o.cancellation.at).toLocaleDateString()} — {o.cancellation.reason}
                    {o.cancellation.refundNote ? ` ${o.cancellation.refundNote}` : ""}
                  </p>
                )}

                {o.status !== "cancelled" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => buyAgain(o)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-500/10 px-3 py-2 text-xs font-medium text-primary-400 transition hover:bg-primary-500/20"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Buy again
                    </button>
                    {o.status === "shipped" && (
                      <button
                        onClick={() => confirmDelivery(o)}
                        disabled={confirming === o.orderId}
                        className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-success transition hover:bg-success/20 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {confirming === o.orderId ? "Confirming…" : "Confirm received"}
                      </button>
                    )}
                    {cancellable(o) && (
                      <button
                        onClick={() => cancelOrder(o)}
                        disabled={cancelling === o.orderId}
                        className="flex items-center gap-1.5 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition hover:bg-danger/20 disabled:opacity-50"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {cancelling === o.orderId ? "Cancelling…" : "Cancel order"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
