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
  Truck,
  Save,
  ImagePlus,
  Loader2,
  Pencil,
  MapPin,
  LocateFixed,
  X,
  Clock,
} from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import { compressImage, uploadFile } from "@/app/lib/upload";
import { ServiceIconFallback } from "@/app/components/dashboard/ServiceIcon";

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
  const [svcError, setSvcError] = useState("");
  const [svcSaving, setSvcSaving] = useState(false);
  const [svcModal, setSvcModal] = useState(null);
  const [svcModalForm, setSvcModalForm] = useState({
    name: "",
    charges: "",
    chargeType: "fixed",
    durationMinutes: 60,
    description: "",
  });
  const [svcPhotoFile, setSvcPhotoFile] = useState(null);
  const [svcPhotoPreview, setSvcPhotoPreview] = useState("");

  const [storeEdit, setStoreEdit] = useState(null);
  const [storeForm, setStoreForm] = useState({});
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeMsg, setStoreMsg] = useState("");

  const [openDelivery, setOpenDelivery] = useState({});
  const [deliveryForm, setDeliveryForm] = useState({});
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [deliveryError, setDeliveryError] = useState("");
  const [deliverySaving, setDeliverySaving] = useState("");

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

  const openSvcModal = (storeId, svc = null) => {
    setSvcError("");
    setSvcPhotoFile(null);
    setSvcPhotoPreview("");
    setSvcModalForm(
      svc
        ? {
            name: svc.name || "",
            charges: svc.charges ?? "",
            chargeType: svc.chargeType || "fixed",
            durationMinutes: svc.durationMinutes ?? 60,
            description: svc.description || "",
          }
        : { name: "", charges: "", chargeType: "fixed", durationMinutes: 60, description: "" }
    );
    setSvcModal({ storeId, editing: svc });
  };

  const closeSvcModal = () => {
    setSvcModal(null);
    setSvcError("");
    setSvcPhotoFile(null);
    setSvcPhotoPreview("");
  };

  const onSvcPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSvcError("");
    if (!file.type.startsWith("image/")) {
      setSvcError("Please choose an image file.");
      return;
    }
    if (svcPhotoPreview) URL.revokeObjectURL(svcPhotoPreview);
    setSvcPhotoFile(file);
    setSvcPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const saveService = async () => {
    if (!svcModal) return;
    setSvcError("");
    if (!svcModalForm.name?.trim() || !svcModalForm.charges) {
      setSvcError("Service name and charges are required.");
      return;
    }
    setSvcSaving(true);
    const { storeId, editing } = svcModal;
    try {
      let image = editing?.image || "";
      if (svcPhotoFile) {
        const dataUrl = await compressImage(svcPhotoFile);
        image = await uploadFile(dataUrl, "services");
      }
      const body = {
        name: svcModalForm.name.trim(),
        charges: Number(svcModalForm.charges),
        chargeType: svcModalForm.chargeType || "fixed",
        durationMinutes: Number(svcModalForm.durationMinutes) || 60,
        description: svcModalForm.description || "",
        image,
      };
      let saved;
      if (editing) {
        const res = await fetch(`/api/services/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        saved = data;
        setServicesByStore((prev) => ({
          ...prev,
          [storeId]: (prev[storeId] || []).map((s) => (s._id === editing._id ? saved : s)),
        }));
      } else {
        const res = await fetch(`/api/stores/${storeId}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        saved = data;
        setServicesByStore((prev) => ({ ...prev, [storeId]: [saved, ...(prev[storeId] || [])] }));
      }
      closeSvcModal();
    } catch (err) {
      setSvcError(err.message);
    } finally {
      setSvcSaving(false);
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

  const openStoreEdit = (store) => {
    setStoreMsg("");
    setStoreForm({
      name: store.name || "",
      phoneNumber: store.phoneNumber || "",
      email: store.email || "",
      category: store.category || "",
      description: store.description || "",
      street: store.address?.street || "",
      city: store.address?.city || "",
      state: store.address?.state || "",
      zipCode: store.address?.zipCode || "",
      country: store.address?.country || "",
      lat: store.location?.lat || "",
      lng: store.location?.lng || "",
    });
    setStoreEdit(store);
  };

  const detectStoreLocation = () => {
    if (!navigator.geolocation) {
      setStoreMsg("Geolocation is not supported by this browser.");
      return;
    }
    setStoreMsg("Locating your store...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStoreForm((prev) => ({
          ...prev,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }));
        setStoreMsg("Store location captured.");
      },
      () => setStoreMsg("Could not get location. Allow location access or enter coordinates manually."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveStore = async () => {
    if (!storeEdit) return;
    setStoreMsg("");
    if (!storeForm.name?.trim() || !storeForm.phoneNumber?.trim() || !storeForm.category?.trim()) {
      setStoreMsg("Name, phone, and category are required.");
      return;
    }
    setStoreSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeEdit.uniqueStoreId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeForm.name.trim(),
          phoneNumber: storeForm.phoneNumber.trim(),
          email: storeForm.email || "",
          category: storeForm.category.trim(),
          description: storeForm.description || "",
          address: {
            street: storeForm.street || "",
            city: storeForm.city || "",
            state: storeForm.state || "",
            zipCode: storeForm.zipCode || "",
            country: storeForm.country || "",
          },
          location: {
            lat: Number(storeForm.lat) || 0,
            lng: Number(storeForm.lng) || 0,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStores((prev) => prev.map((s) => (s.uniqueStoreId === storeEdit.uniqueStoreId ? data : s)));
      setStoreEdit(null);
    } catch (err) {
      setStoreMsg(err.message);
    } finally {
      setStoreSaving(false);
    }
  };

  const toggleDelivery = (store) => {
    setDeliveryMsg("");
    setDeliveryError("");
    setDeliveryForm((prev) => ({
      ...prev,
      [store.uniqueStoreId]: prev[store.uniqueStoreId] || {
        deliveryFee: store.deliveryFee || 0,
        freeDeliveryAbove: store.freeDeliveryAbove || 0,
      },
    }));
    setOpenDelivery((prev) => ({
      ...prev,
      [store.uniqueStoreId]: !prev[store.uniqueStoreId],
    }));
  };

  const handleSaveDelivery = async (storeId) => {
    setDeliveryMsg("");
    setDeliveryError("");
    const form = deliveryForm[storeId];
    if (!form) return;
    setDeliverySaving(storeId);
    try {
      const res = await fetch(`/api/stores/${storeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryFee: Math.max(0, Number(form.deliveryFee) || 0),
          freeDeliveryAbove: Math.max(0, Number(form.freeDeliveryAbove) || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeliveryMsg("Delivery settings saved.");
      setStores((prev) => prev.map((s) => (s.uniqueStoreId === storeId ? data : s)));
      setTimeout(() => setDeliveryMsg(""), 2500);
    } catch (err) {
      setDeliveryError(err.message);
    } finally {
      setDeliverySaving("");
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openStoreEdit(s)}
                        className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => toggleDelivery(s)}
                        className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                      >
                        {openDelivery[s.uniqueStoreId] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        <Truck className="h-4 w-4" />
                        Delivery
                      </button>
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
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {!s.disabled && openDelivery[s.uniqueStoreId] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 border-t border-white/5 pt-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="h-4 w-4 text-zinc-400" />
                          <p className="text-sm font-medium text-zinc-200">Delivery &amp; quick commerce</p>
                          <p className="text-xs text-zinc-600">Shown to customers on product cards</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-zinc-950 p-4 mb-4">
                          <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
                            <div className="text-xs text-zinc-400 leading-relaxed">
                              Delivery time is now calculated automatically from the distance between your
                              store location and the customer's location.{" "}
                              {s.location?.lat && s.location?.lng ? (
                                <>
                                  Your store is pinned at{" "}
                                  <b className="text-zinc-200">
                                    {s.location.lat}, {s.location.lng}
                                  </b>{" "}
                                  — customers near you get faster delivery estimates.
                                </>
                              ) : (
                                <>
                                  <b className="text-amber-400">Set your store location</b> in Edit to enable
                                  accurate distance-based delivery estimates.
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className={labelClass}>Delivery fee ($)</label>
                            <input
                              type="number"
                              min="0"
                              value={deliveryForm[s.uniqueStoreId]?.deliveryFee ?? s.deliveryFee ?? 0}
                              onChange={(e) =>
                                setDeliveryForm((prev) => ({
                                  ...prev,
                                  [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), deliveryFee: e.target.value },
                                }))
                              }
                              className={`${inputClass} mt-1`}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Free delivery above ($)</label>
                            <input
                              type="number"
                              min="0"
                              value={deliveryForm[s.uniqueStoreId]?.freeDeliveryAbove ?? s.freeDeliveryAbove ?? 0}
                              onChange={(e) =>
                                setDeliveryForm((prev) => ({
                                  ...prev,
                                  [s.uniqueStoreId]: { ...(prev[s.uniqueStoreId] || {}), freeDeliveryAbove: e.target.value },
                                }))
                              }
                              className={`${inputClass} mt-1`}
                            />
                          </div>
                        </div>
                        {deliveryMsg && (
                          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <Check className="h-3.5 w-3.5" /> {deliveryMsg}
                          </p>
                        )}
                        {deliveryError && <p className={errorClass + " mt-3"}>{deliveryError}</p>}
                        <button
                          onClick={() => handleSaveDelivery(s.uniqueStoreId)}
                          disabled={deliverySaving === s.uniqueStoreId}
                          className="mt-3 flex w-fit items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {deliverySaving === s.uniqueStoreId ? "Saving..." : "Save delivery settings"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                                <div className="flex items-center gap-3">
                                  {svc.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={svc.image}
                                      alt={svc.name}
                                      className="h-10 w-10 shrink-0 rounded-xl object-cover"
                                    />
                                  ) : (
                                    <div className="flex shrink-0 flex-col items-center gap-0.5">
                                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                                        <ServiceIconFallback name={svc.name} category={s.category} className="h-4 w-4" />
                                      </div>
                                      <span className="rounded-full border border-white/10 bg-zinc-950 px-1 py-px text-[7px] font-medium uppercase tracking-wide text-zinc-500">
                                        No image
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-zinc-200">{svc.name}</p>
                                    <p className="mt-0.5 text-xs text-zinc-500">
                                      ${svc.charges}
                                      {svc.chargeType === "hourly" ? "/hr" : ""}
                                      {svc.durationMinutes ? ` · ${svc.durationMinutes} min` : ""}
                                      {svc.description ? ` — ${svc.description}` : ""}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => openSvcModal(s.uniqueStoreId, svc)}
                                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                                    title="Edit service"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(s.uniqueStoreId, svc._id)}
                                    className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                                    title="Delete service"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(servicesByStore[s.uniqueStoreId] || []).length < MAX_SERVICES_PER_STORE && (
                          <button
                            onClick={() => openSvcModal(s.uniqueStoreId)}
                            className="flex w-fit items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
                          >
                            <Plus className="h-4 w-4" />
                            Add Service
                          </button>
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

        {/* Service add/edit modal */}
        <AnimatePresence>
          {svcModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={closeSvcModal}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {svcModal.editing ? "Edit Service" : "Add Service"}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {svcModal.editing ? "Update this service for your store" : "New service for your store"}
                    </p>
                  </div>
                  <button onClick={closeSvcModal} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="svc-name" className={labelClass}>Service name</Label>
                    <input
                      id="svc-name"
                      placeholder="Installation"
                      value={svcModalForm.name}
                      onChange={(e) => setSvcModalForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="svc-charges" className={labelClass}>Charges ($)</Label>
                      <input
                        id="svc-charges"
                        type="number"
                        min="0"
                        placeholder="29.99"
                        value={svcModalForm.charges}
                        onChange={(e) => setSvcModalForm((p) => ({ ...p, charges: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="svc-duration" className={labelClass}>Duration (min)</Label>
                      <input
                        id="svc-duration"
                        type="number"
                        min="1"
                        value={svcModalForm.durationMinutes}
                        onChange={(e) => setSvcModalForm((p) => ({ ...p, durationMinutes: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Charge type</Label>
                    <div className="flex gap-2">
                      {["fixed", "hourly"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSvcModalForm((p) => ({ ...p, chargeType: t }))}
                          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
                            svcModalForm.chargeType === t
                              ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
                              : "border-white/10 text-zinc-400 hover:border-white/20"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="svc-desc" className={labelClass}>Description (optional)</Label>
                    <textarea
                      id="svc-desc"
                      rows={2}
                      placeholder="What does this service include?"
                      value={svcModalForm.description}
                      onChange={(e) => setSvcModalForm((p) => ({ ...p, description: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {svcPhotoPreview || svcModal.editing?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={svcPhotoPreview || svcModal.editing.image}
                        alt="Service"
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-600">
                        <ImagePlus className="h-5 w-5" />
                      </div>
                    )}
                    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white">
                      {svcSaving && svcPhotoFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="h-4 w-4" />
                      )}
                      {svcSaving && svcPhotoFile
                        ? "Uploading..."
                        : svcPhotoPreview || svcModal.editing?.image
                        ? "Change photo"
                        : "Add photo"}
                      <input type="file" accept="image/*" className="hidden" onChange={onSvcPhotoChange} disabled={svcSaving} />
                    </label>
                    {(svcPhotoPreview || svcModal.editing?.image) && (
                      <button
                        onClick={() => {
                          if (svcPhotoPreview) URL.revokeObjectURL(svcPhotoPreview);
                          setSvcPhotoFile(null);
                          setSvcPhotoPreview("");
                        }}
                        className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {svcError && <p className={errorClass}>{svcError}</p>}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={closeSvcModal}
                      className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveService}
                      disabled={svcSaving}
                      className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                    >
                      {svcSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {svcSaving ? "Saving..." : svcModal.editing ? "Save changes" : "Add service"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Store edit modal */}
        <AnimatePresence>
          {storeEdit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
              onClick={() => setStoreEdit(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Edit Store</h3>
                    <p className="text-xs text-zinc-500">Update store details and location</p>
                  </div>
                  <button onClick={() => setStoreEdit(null)} className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4 p-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="store-name" className={labelClass}>Store name</Label>
                    <input
                      id="store-name"
                      value={storeForm.name || ""}
                      onChange={(e) => setStoreForm((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="store-phone" className={labelClass}>Phone</Label>
                      <input
                        id="store-phone"
                        value={storeForm.phoneNumber || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="store-email" className={labelClass}>Email (optional)</Label>
                      <input
                        id="store-email"
                        value={storeForm.email || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, email: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-category" className={labelClass}>Category</Label>
                    <input
                      id="store-category"
                      placeholder="e.g. Electronics, Home Cleaning"
                      value={storeForm.category || ""}
                      onChange={(e) => setStoreForm((p) => ({ ...p, category: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="store-desc" className={labelClass}>Description (optional)</Label>
                    <textarea
                      id="store-desc"
                      rows={2}
                      value={storeForm.description || ""}
                      onChange={(e) => setStoreForm((p) => ({ ...p, description: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Store location (for distance-based delivery)</Label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={detectStoreLocation}
                        className="flex w-fit items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                      >
                        <LocateFixed className="h-4 w-4" />
                        Detect my location
                      </button>
                      <span className="text-xs text-zinc-500">or enter coordinates below</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={storeForm.lat || ""}
                          onChange={(e) => setStoreForm((p) => ({ ...p, lat: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={storeForm.lng || ""}
                          onChange={(e) => setStoreForm((p) => ({ ...p, lng: e.target.value }))}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Address (optional)</Label>
                    <input
                      placeholder="Street"
                      value={storeForm.street || ""}
                      onChange={(e) => setStoreForm((p) => ({ ...p, street: e.target.value }))}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="City"
                        value={storeForm.city || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, city: e.target.value }))}
                        className={inputClass}
                      />
                      <input
                        placeholder="State"
                        value={storeForm.state || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, state: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="ZIP code"
                        value={storeForm.zipCode || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, zipCode: e.target.value }))}
                        className={inputClass}
                      />
                      <input
                        placeholder="Country"
                        value={storeForm.country || ""}
                        onChange={(e) => setStoreForm((p) => ({ ...p, country: e.target.value }))}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Customers will see delivery estimates based on the distance from this location.
                  </div>
                  {storeMsg && (
                    <p className={`rounded-xl border px-3.5 py-2.5 text-sm ${storeMsg.includes("required") || storeMsg.includes("Could not") ? errorClass : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"}`}>
                      {storeMsg}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setStoreEdit(null)}
                      className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveStore}
                      disabled={storeSaving}
                      className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                    >
                      {storeSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {storeSaving ? "Saving..." : "Save store"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
