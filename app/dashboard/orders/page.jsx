"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useRef, useState } from "react";
import { Package, ShoppingBag, CreditCard, ChevronDown, Check, Printer } from "lucide-react";
import { errorClass } from "@/app/components/AuthForm/authStyles";
import InvoiceModal from "@/components/dashboard/InvoiceModal";

const STATUS_STYLES = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-blue-500/15 text-blue-400",
  shipped: "bg-cyan-500/15 text-cyan-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_DOT = {
  pending: "bg-amber-500",
  confirmed: "bg-blue-500",
  shipped: "bg-cyan-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function StatusDropdown({ order, open, onToggle, onSelect }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
          STATUS_STYLES[order.status] || STATUS_STYLES.pending
        } hover:brightness-125`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.status] || STATUS_DOT.pending}`} />
        {order.status}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#18181B] p-1 shadow-xl shadow-black/40">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSelect(s)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium capitalize text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
              {s}
              {order.status === s && <Check className="ml-auto h-3.5 w-3.5 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openStatusFor, setOpenStatusFor] = useState("");
  const [updating, setUpdating] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const fetchOrders = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const res = await fetch(`/api/orders?sellerId=${user.uid}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.uid) {
      void Promise.resolve().then(fetchOrders);
    }
  }, [user?.uid]);

  const updateStatus = async (orderId, status) => {
    setError("");
    setOpenStatusFor("");
    if (!user?.uid) return;
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: user.uid, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update status.");
        return;
      }
      fetchOrders();
    } finally {
      setUpdating("");
    }
  };

  const StatusDropdown = ({ order }) => (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpenStatusFor(openStatusFor === order.orderId ? "" : order.orderId)}
        className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
          STATUS_STYLES[order.status] || STATUS_STYLES.pending
        } hover:brightness-125`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.status] || STATUS_DOT.pending}`} />
        {order.status}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${openStatusFor === order.orderId ? "rotate-180" : ""}`}
        />
      </button>

      {openStatusFor === order.orderId && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#18181B] p-1 shadow-xl shadow-black/40">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(order.orderId, s)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 capitalize transition-colors hover:bg-white/5 hover:text-zinc-200"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
              {s}
              {order.status === s && <Check className="ml-auto h-3.5 w-3.5 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Orders</h1>
          <p className="mt-1 text-sm text-zinc-500">Orders placed on your stores</p>
        </div>

        {error && <div className={errorClass}>{error}</div>}

        {loading ? (
          <div className="text-sm text-zinc-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/5 bg-[#18181B] p-8 text-center text-sm text-zinc-500">
            <ShoppingBag className="h-8 w-8 text-zinc-600" />
            No orders yet. When customers order your products, they&apos;ll appear here.
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((o) => (
              <div key={o._id} className="rounded-3xl border border-white/5 bg-[#18181B] p-5">
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-semibold text-zinc-100">Order #{o.orderId}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {o.customerName || "Customer"} · {o.customerEmail || o.customerPhone || ""} ·{" "}
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-zinc-100">${o.total.toFixed(2)}</p>
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(o)}
                      title="Print slip / invoice"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-blue-500/40 hover:text-blue-400"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </button>
                    <StatusDropdown
                      order={o}
                      open={openStatusFor === o.orderId}
                      onToggle={() =>
                        setOpenStatusFor((prev) => (prev === o.orderId ? "" : o.orderId))
                      }
                      onSelect={(s) => updateStatus(o.orderId, s)}
                    />
                    {updating === o.orderId && (
                      <span className="text-xs text-zinc-500">Updating...</span>
                    )}
                  </div>
                </div>

                <div className="mb-3 grid gap-2">
                  {o.items.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-zinc-200">{i.name}</p>
                        <p className="text-xs text-zinc-500">
                          {i.storeName} · {i.quantity} × ${i.price}
                          {i.serviceName && ` + ${i.serviceName} ($${i.serviceCharge})`}
                        </p>
                      </div>
                      <p className="font-medium text-zinc-200">
                        ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-3 text-xs text-zinc-500">
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
                    <span>
                      Deliver to:{" "}
                      {[o.deliveryLocation.address, o.deliveryLocation.city, o.deliveryLocation.state, o.deliveryLocation.zip]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
      </div>
    </DashboardLayout>
  );
}
