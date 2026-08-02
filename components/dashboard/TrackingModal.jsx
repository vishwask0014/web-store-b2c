"use client";

import { useState } from "react";
import { X, Wrench } from "lucide-react";
import { ShippingInfo } from "./ItemTimeline";

export default function TrackingModal({ order, onClose }) {
  const [form, setForm] = useState({
    courier: order.shipping?.courier || "",
    trackingNumber: order.shipping?.trackingNumber || "",
    estimatedDelivery: order.shipping?.estimatedDelivery || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch(`/api/orders/${order.orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: order.sellerId, shipping: form }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save tracking.");
      }
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <Wrench size={16} className="text-blue-600" /> Add tracking
          </h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Order <b>#{order.orderId}</b> · {order.items.length} item(s)
        </p>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="Courier name (e.g. DTDC, Bluedart)"
            value={form.courier}
            onChange={(e) => setForm({ ...form, courier: e.target.value })}
          />
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            placeholder="Tracking number"
            required
            value={form.trackingNumber}
            onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
          />
          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            value={form.estimatedDelivery}
            onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })}
          />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {saved && <p className="text-xs font-medium text-emerald-600">Saved! Notifying customer…</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save tracking"}
          </button>
        </form>
      </div>
    </div>
  );
}
