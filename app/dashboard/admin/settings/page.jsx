"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useEffect, useState } from "react";
import { TicketPercent, Plus, Trash2, Power, Check } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-border-default bg-bg-muted px-3.5 text-sm text-text-primary outline-none transition focus:border-primary-500";
const labelClass = "text-sm font-medium text-text-secondary";

export default function SettingsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    title: "",
    description: "",
    type: "percent",
    value: "",
    minOrder: 0,
    maxDiscount: "",
    maxUses: "",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load coupons.");
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchCoupons);
  }, []);

  const createCoupon = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.code.trim() || !form.value) {
      setFormError("Coupon code and value are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.trim().toUpperCase(),
          value: Number(form.value),
          minOrder: Number(form.minOrder) || 0,
          maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : 0,
          maxUses: form.maxUses ? Number(form.maxUses) : 0,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({
        code: "",
        title: "",
        description: "",
        type: "percent",
        value: "",
        minOrder: 0,
        maxDiscount: "",
        maxUses: "",
        expiresAt: "",
      });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (code, isActive) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, isActive: !isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCoupon = async (code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
            <p className="mt-1 text-sm text-text-muted">Platform configuration</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex w-fit items-center gap-2 rounded-full bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "New coupon"}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
        )}

        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <TicketPercent className="h-4 w-4 text-primary-400" /> Coupons
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Customers can apply these at checkout. Percent coupons are capped by max discount.
          </p>

          {showForm && (
            <form onSubmit={createCoupon} className="mt-5 grid max-w-2xl gap-4 rounded-2xl border border-border-default bg-bg-muted p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Code *</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. SAVE10"
                    className={`${inputClass} mt-1 uppercase`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={`${inputClass} mt-1`}
                  >
                    <option value="percent">Percent off</option>
                    <option value="flat">Flat amount</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{form.type === "percent" ? "Value (%) *" : "Value ($) *"}</label>
                  <input
                    type="number"
                    min="1"
                    max={form.type === "percent" ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Min order ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass}>{form.type === "percent" ? "Max discount ($)" : "Max uses"}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder={form.type === "percent" ? "e.g. 10" : "Unlimited"}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Expires</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Title (optional)</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Festive season offer"
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div>
                <label className={labelClass}>Description (optional)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Shown to customers when they apply the coupon"
                  className={`${inputClass} mt-1`}
                />
              </div>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-fit rounded-full bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? "Creating…" : "Create coupon"}
              </button>
            </form>
          )}

          {loading ? (
            <p className="mt-4 text-sm text-text-muted">Loading coupons...</p>
          ) : coupons.length === 0 ? (
            <p className="mt-4 text-sm text-text-muted">No coupons yet. Create your first offer.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <div
                    key={c._id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                      c.isActive ? "border-border-default bg-bg-muted" : "border-border-default opacity-60"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500/15 text-primary-400">
                      <TicketPercent className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-bold text-text-primary">{c.code}</p>
                        {c.isActive ? (
                          <span className="flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="rounded-full border border-border-default px-2 py-0.5 text-[11px] font-medium text-text-muted">
                            Paused
                          </span>
                        )}
                        {expired && (
                          <span className="rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-text-muted">
                        {c.type === "percent" ? `${c.value}% off` : `$${c.value} off`}
                        {c.minOrder > 0 && ` · min order $${c.minOrder}`}
                        {c.maxDiscount > 0 && ` · max discount $${c.maxDiscount}`}
                        {c.maxUses > 0 && ` · ${c.usedCount}/${c.maxUses} uses`}
                        {c.expiresAt && ` · expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                      </p>
                      {(c.title || c.description) && (
                        <p className="mt-0.5 text-xs text-text-secondary">
                          {c.title}
                          {c.description ? ` — ${c.description}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => toggleActive(c.code, c.isActive)}
                        title={c.isActive ? "Pause coupon" : "Activate coupon"}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                          c.isActive
                            ? "border-success/30 text-success hover:bg-success/10"
                            : "border-border-default text-text-muted hover:bg-bg-muted"
                        }`}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteCoupon(c.code)}
                        title="Delete coupon"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border-default text-text-muted transition hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
