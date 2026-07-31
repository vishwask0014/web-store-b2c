"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, ShoppingBag, MapPin, CreditCard } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-warning/15 text-warning",
  confirmed: "bg-primary-500/15 text-primary-400",
  shipped: "bg-primary-500/15 text-primary-400",
  delivered: "bg-success/15 text-success",
  cancelled: "bg-danger/15 text-danger",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/orders?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.uid]);

  return (
    <ShopLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">My Orders</h1>
            <p className="text-sm text-text-muted mt-1">Track your purchases</p>
          </div>
          <Link href="/shop" className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0">
            Continue shopping &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-sm text-text-muted">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-10 text-center flex flex-col items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-text-muted" />
            <p className="text-sm text-text-muted">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="text-sm text-primary-400 hover:text-primary-500 font-medium">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-2xl border border-border-default bg-bg-surface p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-text-primary">Order #{o.orderId}</p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[o.status] || STATUS_STYLES.pending}`}>
                      {o.status}
                    </span>
                    <p className="text-lg font-semibold text-text-primary">${o.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid gap-2 mb-4">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400 shrink-0">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary truncate">{i.name}</p>
                        <p className="text-xs text-text-muted">
                          {i.storeName} · {i.quantity} × ${i.price}
                          {i.serviceName && ` + ${i.serviceName}`}
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
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[o.deliveryLocation.address, o.deliveryLocation.city, o.deliveryLocation.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ShopLayout>
  );
}