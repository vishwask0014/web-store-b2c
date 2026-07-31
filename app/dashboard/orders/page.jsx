"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, CreditCard } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-primary-500/15 text-primary-400",
  shipped: "bg-primary-500/15 text-primary-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const res = await fetch(`/api/orders?sellerId=${user.uid}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.uid]);

  const updateStatus = async (orderId, status) => {
    setError("");
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId: user?.uid, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update status.");
      return;
    }
    fetchOrders();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Orders</h1>
          <p className="text-sm text-text-muted mt-1">Orders placed on your stores</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
        )}

        {loading ? (
          <div className="text-sm text-text-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted flex flex-col items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-text-muted" />
            No orders yet. When customers order your products, they&apos;ll appear here.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-2xl border border-border-default bg-bg-surface p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-text-primary">Order #{o.orderId}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {o.customerName || "Customer"} · {o.customerEmail || o.customerPhone || ""} ·{" "}
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-text-primary">${o.total.toFixed(2)}</p>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.orderId, e.target.value)}
                      className={`rounded-lg border border-border-default bg-bg-muted px-2.5 py-1.5 text-xs font-medium outline-none focus:border-primary-500 ${STATUS_STYLES[o.status] || STATUS_STYLES.pending}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-2 mb-3">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary truncate">{i.name}</p>
                        <p className="text-xs text-text-muted">
                          {i.storeName} · {i.quantity} × ${i.price}
                          {i.serviceName && ` + ${i.serviceName} ($${i.serviceCharge})`}
                        </p>
                      </div>
                      <p className="text-text-primary font-medium">
                        ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted border-t border-border-default pt-3">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    {o.paymentMethod?.brand || "Card"} &bull;&bull;&bull;&bull; {o.paymentMethod?.last4 || "----"}
                    {o.autoPaid && " · Auto-paid"}
                  </span>
                  {(o.deliveryLocation?.city || o.deliveryLocation?.address) && (
                    <span>
                      Deliver to: {[o.deliveryLocation.address, o.deliveryLocation.city, o.deliveryLocation.state, o.deliveryLocation.zip].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}