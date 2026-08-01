"use client";

import { Printer, X, Store as StoreIcon } from "lucide-react";

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const storeNames = [...new Set((order.items || []).map((i) => i.storeName).filter(Boolean))];
  const paymentLabel =
    order.paymentMethod?.type === "razorpay"
      ? `Razorpay${order.paid ? " (Paid)" : ""}${order.paymentMethod?.last4 ? ` · •••• ${order.paymentMethod.last4}` : ""}`
      : order.paymentMethod?.type === "upi"
        ? `UPI · ${order.paymentMethod.upiId || "—"}`
        : `${order.paymentMethod?.brand || "Card"} · •••• ${order.paymentMethod?.last4 || "—"}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl">
        <div id="invoice-slip" className="rounded-2xl bg-white text-zinc-900 shadow-2xl">
          <div className="border-b border-zinc-200 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <StoreIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">B2C Store</p>
                  <p className="text-xs text-zinc-500">Marketplace invoice</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold uppercase tracking-widest text-zinc-400">Invoice</p>
                <p className="text-xs text-zinc-500">#{order.orderId}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500">
              <span>
                Date: <span className="font-medium text-zinc-700">{new Date(order.createdAt).toLocaleString()}</span>
              </span>
              <span>
                Status: <span className="font-medium capitalize text-zinc-700">{order.status}</span>
              </span>
              <span>
                Payment: <span className="font-medium text-zinc-700">{paymentLabel}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 border-b border-zinc-200 p-6 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Billed to</p>
              <p className="text-sm font-semibold">{order.customerName || "Customer"}</p>
              {order.customerEmail && <p className="text-xs text-zinc-500">{order.customerEmail}</p>}
              {order.customerPhone && <p className="text-xs text-zinc-500">{order.customerPhone}</p>}
              {(order.deliveryLocation?.address ||
                order.deliveryLocation?.city ||
                order.deliveryLocation?.state ||
                order.deliveryLocation?.zip) && (
                <p className="mt-1 text-xs text-zinc-500">
                  {[
                    order.deliveryLocation.address,
                    order.deliveryLocation.city,
                    order.deliveryLocation.state,
                    order.deliveryLocation.zip,
                    order.deliveryLocation.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Sold by</p>
              {storeNames.length > 0 ? (
                storeNames.map((s) => (
                  <p key={s} className="text-sm font-semibold">
                    {s}
                  </p>
                ))
              ) : (
                <p className="text-sm font-semibold">B2C Store sellers</p>
              )}
            </div>
          </div>

          <div className="p-6">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-400">
                  <th className="pb-2 font-semibold">Item</th>
                  <th className="pb-2 font-semibold">Store</th>
                  <th className="pb-2 text-center font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Price</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((i, idx) => (
                  <tr key={idx} className="border-b border-zinc-100">
                    <td className="py-2.5">
                      <p className="font-medium">{i.name}</p>
                      {i.serviceName && <p className="text-xs text-zinc-500">+ {i.serviceName}</p>}
                    </td>
                    <td className="py-2.5 text-xs text-zinc-500">{i.storeName || "—"}</td>
                    <td className="py-2.5 text-center">{i.quantity}</td>
                    <td className="py-2.5 text-right text-zinc-600">
                      ${i.price.toFixed(2)}
                      {i.serviceCharge > 0 && (
                        <span className="block text-xs text-zinc-400">+${i.serviceCharge.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-medium">
                      ${((i.price + (i.serviceCharge || 0)) * i.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Services</span>
                <span>${order.serviceTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold">
                <span>Total</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </div>

            <p className="mt-6 border-t border-dashed border-zinc-200 pt-4 text-center text-xs text-zinc-400">
              Thank you for shopping with B2C Store. Payments processed via Razorpay.
            </p>
          </div>
        </div>

        <div className="no-print mt-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
          >
            <X className="h-4 w-4" /> Close
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400"
          >
            <Printer className="h-4 w-4" /> Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}
