"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Plus,
  Phone,
  Tag,
  AlertTriangle,
  Wrench,
  Trash2,
  ChevronDown,
  ChevronUp,
  Rocket,
  Package,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";

const MAX_SERVICES_PER_STORE = 7;
const CATEGORY_SUGGESTIONS = ["Electronics", "Fashion", "Beauty", "Furniture", "Food", "Books", "Home Cleaning"];

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10";
const labelClass = "text-sm font-medium text-zinc-400";
const errorClass = "rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400";

export default function StorePage() {
  const { user } = useAuth();
  const emailId = useId();
  const phoneId = useId();
  const categoryId = useId();

  const [stores, setStores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [servicesByStore, setServicesByStore] = useState({});
  const [openServices, setOpenServices] = useState({});
  const [svcForm, setSvcForm] = useState({});
  const [svcError, setSvcError] = useState("");
  const [svcLoading, setSvcLoading] = useState(false);

  const fetchStores = async () => {
    if (!user?.uid) return;
    const res = await fetch(`/api/stores?ownerId=${user.uid}`);
    const data = await res.json();
    setStores(data);
    data.forEach((s) => {
      fetch(`/api/stores/${s.uniqueStoreId}/services`)
        .then((r) => r.json())
        .then((svcs) =>
          setServicesByStore((prev) => ({ ...prev, [s.uniqueStoreId]: svcs }))
        );
    });
  };

  useEffect(() => {
    if (user?.uid) {
      void Promise.resolve().then(fetchStores);
    }
  }, [user?.uid]);

  const handleCreate = async () => {
    setError("");
    if (!name.trim() || !phoneNumber.trim() || !category.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber, category, ownerId: user.uid }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setName("");
      setPhoneNumber("");
      setCategory("");
      setShowForm(false);
      fetchStores();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enabledStores = stores.filter((s) => !s.disabled);

  const handleAddService = async (storeId) => {
    setSvcError("");
    const form = svcForm[storeId] || {};
    if (!form.name?.trim() || !form.charges) {
      setSvcError("Service name and charges are required.");
      return;
    }
    setSvcLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          charges: Number(form.charges),
          description: form.description || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSvcForm((prev) => ({ ...prev, [storeId]: {} }));
      setServicesByStore((prev) => ({ ...prev, [storeId]: [data, ...(prev[storeId] || [])] }));
    } catch (err) {
      setSvcError(err.message);
    } finally {
      setSvcLoading(false);
    }
  };

  const handleDeleteService = async (storeId, serviceId) => {
    const res = await fetch(`/api/services/${serviceId}`, { method: "DELETE" });
    if (res.ok) {
      setServicesByStore((prev) => ({
        ...prev,
        [storeId]: (prev[storeId] || []).filter((s) => s._id !== serviceId),
      }));
    }
  };

  const storeLimitReached = enabledStores.length >= 2;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Store</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your stores (max 2)</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            disabled={storeLimitReached && !showForm}
            className="flex w-fit items-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Cancel" : "New Store"}
          </button>
        </div>

        {storeLimitReached && !showForm && (
          <p className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Store limit reached. You can only have 2 stores per account.
          </p>
        )}

        {/* Onboarding hero when no stores */}
        {stores.length === 0 && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-8 md:p-10"
          >
            <div className="pointer-events-none absolute -top-28 right-0 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-zinc-100">
                  Launch your store in minutes
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Set up your first store, list products, and start selling across the marketplace.
                  It takes less than 5 minutes.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Store, text: "Create your store with a name, phone and category" },
                  { icon: Package, text: "Add products and optional services" },
                  { icon: ShoppingBag, text: "Receive orders and track revenue live" },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.text} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-950 px-4 py-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                        {i + 1}
                      </span>
                      <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                      <p className="text-sm text-zinc-400">{step.text}</p>
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" /> Create your store
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Create store form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-lg shadow-black/20 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Create Store</h3>
                    <p className="text-xs text-zinc-500">Start selling in the marketplace</p>
                  </div>
                </div>
                <div className="grid gap-4 max-w-lg">
                  <div className="grid gap-2">
                    <Label htmlFor={emailId} className={labelClass}>Store Name</Label>
                    <input id={emailId} placeholder="My Store" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={phoneId} className={labelClass}>Phone Number</Label>
                    <input id={phoneId} placeholder="+1 234 567 8900" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputClass} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={categoryId} className={labelClass}>Category</Label>
                    <input id={categoryId} placeholder="e.g. Electronics, Home Cleaning" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} />
                    <div className="flex flex-wrap gap-2 pt-1">
                      {CATEGORY_SUGGESTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCategory(c)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            category === c
                              ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
                              : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  {error && <p className={errorClass}>{error}</p>}
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex h-11 w-fit items-center gap-2 rounded-full bg-blue-500 px-6 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Store"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store list */}
        {stores.length === 0 && !showForm ? null : (
          <div className="grid gap-4">
            {stores.map((s) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border p-5 shadow-lg shadow-black/20 md:p-6 ${
                  s.disabled ? "border-red-500/20 bg-red-500/[0.04]" : "border-white/10 bg-zinc-900"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        s.disabled ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {s.disabled ? <AlertTriangle className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-100">{s.name}</p>
                        {s.disabled ? (
                          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">
                            Disabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                            <Check className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.phoneNumber}</span>
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{s.category}</span>
                        <span className="font-mono text-zinc-700">ID: {s.uniqueStoreId}</span>
                      </div>
                      {s.disabledReason && (
                        <p className="mt-1 text-xs text-red-400">{s.disabledReason}</p>
                      )}
                    </div>
                  </div>
                  {!s.disabled && (
                    <button
                      onClick={() =>
                        setOpenServices((prev) => ({
                          ...prev,
                          [s.uniqueStoreId]: !prev[s.uniqueStoreId],
                        }))
                      }
                      className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      {openServices[s.uniqueStoreId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      Services ({(servicesByStore[s.uniqueStoreId] || []).length}/{MAX_SERVICES_PER_STORE})
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {!s.disabled && openServices[s.uniqueStoreId] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 border-t border-white/5 pt-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="h-4 w-4 text-zinc-400" />
                          <p className="text-sm font-medium text-zinc-200">Store services pool</p>
                          <p className="text-xs text-zinc-600">Select these when adding a product (max 7 per product)</p>
                        </div>
                        {(servicesByStore[s.uniqueStoreId] || []).length === 0 ? (
                          <p className="mb-3 text-sm text-zinc-500">No services yet. Add one below.</p>
                        ) : (
                          <div className="mb-4 grid gap-2">
                            {(servicesByStore[s.uniqueStoreId] || []).map((svc) => (
                              <div
                                key={svc._id}
                                className="flex items-center justify-between rounded-2xl border border-white/5 bg-zinc-950 p-3.5"
                              >
                                <div>
                                  <p className="text-sm font-medium text-zinc-200">{svc.name}</p>
                                  <p className="mt-0.5 text-xs text-zinc-500">
                                    ${svc.charges}
                                    {svc.description ? ` — ${svc.description}` : ""}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteService(s.uniqueStoreId, svc._id)}
                                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                  title="Delete service"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {(servicesByStore[s.uniqueStoreId] || []).length < MAX_SERVICES_PER_STORE && (
                          <div className="grid gap-3 max-w-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <input
                                placeholder="Service name"
                                value={svcForm[s.uniqueStoreId]?.name || ""}
                                onChange={(e) =>
                                  setSvcForm((prev) => ({
                                    ...prev,
                                    [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), name: e.target.value },
                                  }))
                                }
                                className={`${inputClass} sm:col-span-2`}
                              />
                              <input
                                type="number"
                                placeholder="Charges $"
                                value={svcForm[s.uniqueStoreId]?.charges || ""}
                                onChange={(e) =>
                                  setSvcForm((prev) => ({
                                    ...prev,
                                    [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), charges: e.target.value },
                                  }))
                                }
                                className={inputClass}
                              />
                            </div>
                            <input
                              placeholder="Description (optional)"
                              value={svcForm[s.uniqueStoreId]?.description || ""}
                              onChange={(e) =>
                                setSvcForm((prev) => ({
                                  ...prev,
                                  [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), description: e.target.value },
                                }))
                              }
                              className={inputClass}
                            />
                            {svcError && <p className={errorClass}>{svcError}</p>}
                            <button
                              onClick={() => handleAddService(s.uniqueStoreId)}
                              disabled={svcLoading}
                              className="flex w-fit items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                            >
                              <Plus className="h-4 w-4" />
                              {svcLoading ? "Adding..." : "Add Service"}
                            </button>
                          </div>
                        )}
                        {(servicesByStore[s.uniqueStoreId] || []).length >= MAX_SERVICES_PER_STORE && (
                          <p className="mt-3 flex items-center gap-1 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            Service limit reached (max {MAX_SERVICES_PER_STORE} per store).
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
