"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import Link from "next/link";
import { formatCurrency, maskPayment } from "@/data/dashboard";

export function OrderStatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    shipped: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
        styles[status] || "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
      }`}
    >
      {status}
    </span>
  );
}

export default function OrdersTable({ orders }) {
  const rows = orders.slice(0, 6);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/5 bg-zinc-900 p-10 text-center">
        <p className="text-sm text-zinc-500">No orders yet. When customers order, they appear here.</p>
        <Link href="/dashboard/products" className="text-sm font-medium text-blue-400 hover:text-blue-300">
          Add products to get started
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-zinc-900 shadow-lg shadow-black/20">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
              <th className="px-5 py-3.5 font-medium">Order ID</th>
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-5 py-3.5 font-medium">Store</th>
              <th className="px-5 py-3.5 font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Payment</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Date</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o, i) => (
              <motion.tr
                key={o._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3.5 font-mono text-xs text-blue-400">#{o.orderId}</td>
                <td className="px-5 py-3.5 text-zinc-300">{o.customerName || "—"}</td>
                <td className="max-w-36 truncate px-5 py-3.5 text-zinc-400">
                  {[...new Set(o.items.map((i) => i.storeName))].join(", ") || "—"}
                </td>
                <td className="px-5 py-3.5 font-semibold text-zinc-100 tabular-nums">
                  {formatCurrency(Number(o.total) || 0)}
                </td>
                <td className="px-5 py-3.5 text-zinc-400">{maskPayment(o.paymentMethod)}</td>
                <td className="px-5 py-3.5">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-zinc-500">
                  {new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center justify-center rounded-full border border-white/5 p-2 text-zinc-500 transition-colors hover:border-blue-500/30 hover:text-blue-400"
                    aria-label={`View order ${o.orderId}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
