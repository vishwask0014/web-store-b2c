"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { compressImage, uploadFile } from "@/app/lib/upload";
import { ServiceIconFallback } from "@/app/components/dashboard/ServiceIcon";
import { AnimatePresence, motion } from "framer-motion";
import {
  Wrench,
  Pencil,
  Trash2,
  Link2,
  X,
  ImagePlus,
  Loader2,
  Store as StoreIcon,
  Clock,
  Tag,
  Package,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import Link from "next/link";

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10";
const labelClass = "text-sm font-medium text-zinc-400";
const errorClass = "rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400";

export default function ServicesPage() {
  const { user } = useAuth();
  const svcNameId = useId();
  const svcChargesId = useId();
  const svcDurId = useId();
  const svcDescId = useId();

  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [linkedMap, setLinkedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [panelService, setPanelService] = useState(null);
  const [linkedProducts, setLinkedProducts] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);

  const [deleting, setDeleting] = useState("");

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError("");
    try {
      const storeRes = await fetch(`/api/stores?ownerId=${user.uid}`);
      const storeData = await storeRes.json();
      if (!storeRes.ok) throw new Error(storeData.error);
      setStores(storeData);
      const results = await Promise.all(
        storeData.map((s) =>
          fetch(`/api/stores/${s.uniqueStoreId}/services`).then((r) => r.json())
        )
      );
      const prodResults = await Promise.all(
        storeData.map((s) =>
          fetch(`/api/stores/${s.uniqueStoreId}/products`).then((r) => r.json())
        )
      );
      const flat = [];
      results.forEach((svcs, i) => {
        if (Array.isArray(svcs)) {
          svcs.forEach((svc) =>
            flat.push({
              ...svc,
              storeName: storeData[i]?.name || "",
              storeCategory: storeData[i]?.category || "",
              uniqueStoreId: storeData[i]?.uniqueStoreId || "",
            })
          );
        }
      });
      const counts = {};
      prodResults.forEach((prods) => {
        if (!Array.isArray(prods)) return;
        prods.forEach((p) => {
          (p.services || []).forEach((s) => {
            counts[s.serviceId] = (counts[s.serviceId] || 0) + 1;
          });
        });
      });
      setLinkedMap(counts);
      setServices(flat);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      void Promise.resolve().then(load);
    }
  }, [user?.uid]);

  const openEdit = (svc) => {
    setFormError("");
    setEditing(svc);
    setPhotoFile(null);
    setPhotoPreview("");
    setForm({
      name: svc.name || "",
      charges: svc.charges ?? "",
      chargeType: svc.chargeType || "fixed",
      durationMinutes: svc.durationMinutes ?? 60,
      description: svc.description || "",
      image: svc.image || "",
    });
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError("");
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file.");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const save = async () => {
    setFormError("");
    if (!form.name?.trim() || !form.charges) {
      setFormError("Service name and charges are required.");
      return;
    }
    setSaving(true);
    try {
      let image = form.image || "";
      if (photoFile) {
        setImgUploading(true);
        const dataUrl = await compressImage(photoFile);
        image = await uploadFile(dataUrl, "services");
        setImgUploading(false);
      }
      const res = await fetch(`/api/services/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          charges: Number(form.charges),
          chargeType: form.chargeType || "fixed",
          durationMinutes: Number(form.durationMinutes) || 60,
          description: form.description || "",
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditing(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setImgUploading(false);
      setSaving(false);
    }
  };

  const openLinked = async (svc) => {
    setPanelService(svc);
    setLinkedProducts([]);
    setPanelLoading(true);
    try {
      const res = await fetch(`/api/services/${svc._id}/linked-products`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLinkedProducts(Array.isArray(data) ? data : []);
    } catch {
      setLinkedProducts([]);
    } finally {
      setPanelLoading(false);
    }
  };

  const remove = async (svc) => {
    setDeleting(svc._id);
    try {
      const res = await fetch(`/api/services/${svc._id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s._id !== svc._id));
      }
    } finally {
      setDeleting("");
    }
  };

  const totalLinked = (svc) => linkedMap[svc._id] || 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Services</h1>
            <p className="mt-1 text-sm text-zinc-500">All services across your stores — edit details or see which products offer them</p>
          </div>
          <Link
            href="/dashboard/store"
            className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add service in Store
          </Link>
        </div>

        {error && <p className={errorClass}>{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-white/5 bg-zinc-900 p-12 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-zinc-900 p-10 text-center">
            <Wrench className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              No services yet. Open the Store page and add services to your store pool.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-900 p-4 shadow-lg shadow-black/20 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {svc.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={svc.image} alt={svc.name} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                        <ServiceIconFallback name={svc.name} category={svc.storeCategory} className="h-6 w-6" />
                      </div>
                      <span className="rounded-full border border-white/10 bg-zinc-950 px-1.5 py-px text-[8px] font-medium uppercase tracking-wide text-zinc-500">
                        No image
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate font-semibold text-zinc-100">{svc.name}</p>
                      {svc.isActive === false && (
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1"><StoreIcon className="h-3 w-3" />{svc.storeName}</span>
                      <span className="flex items-center gap-1"><Tag className="h-3 w-3" />${svc.charges} / {svc.chargeType === "hourly" ? "hour" : "service"}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{svc.durationMinutes} min</span>
                    </div>
                    {svc.description && (
                      <p className="mt-1 truncate text-xs text-zinc-600">{svc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => openLinked(svc)}
                    className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                    title="Show products offering this service"
                  >
                    <Link2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Linked products</span>
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-semibold text-blue-400">
                      {totalLinked(svc) > 0 ? totalLinked(svc) : "–"}
                    </span>
                  </button>
                  <button
                    onClick={() => openEdit(svc)}
                    className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(svc)}
                    disabled={deleting === svc._id}
                    className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    title="Delete service"
                  >
                    {deleting === svc._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-black/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Edit Service</h3>
                    <p className="text-xs text-zinc-500">{editing.storeName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={svcNameId} className={labelClass}>Service Name</Label>
                  <input id={svcNameId} className={inputClass} value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Installation" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor={svcChargesId} className={labelClass}>Charges ($)</Label>
                    <input id={svcChargesId} type="number" min="0" className={inputClass} value={form.charges ?? ""} onChange={(e) => setForm((p) => ({ ...p, charges: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label className={labelClass}>Charge Type</Label>
                    <select
                      className={inputClass}
                      value={form.chargeType || "fixed"}
                      onChange={(e) => setForm((p) => ({ ...p, chargeType: e.target.value }))}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={svcDurId} className={labelClass}>Duration (min)</Label>
                    <input id={svcDurId} type="number" min="1" className={inputClass} value={form.durationMinutes ?? 60} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={svcDescId} className={labelClass}>Description</Label>
                  <textarea
                    id={svcDescId}
                    rows={3}
                    className={`${inputClass} h-auto py-3`}
                    value={form.description || ""}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What does this service include?"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {photoPreview || form.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview || form.image} alt="Service" className="h-14 w-14 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-600">
                      <ServiceIconFallback name={editing.name} category={editing.storeCategory} className="h-5 w-5" />
                    </div>
                  )}
                  <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white">
                    {imgUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    {imgUploading ? "Uploading..." : photoPreview || form.image ? "Change photo" : "Add photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} disabled={imgUploading} />
                  </label>
                  {photoPreview && (
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(photoPreview);
                        setPhotoFile(null);
                        setPhotoPreview("");
                      }}
                      className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                  {!photoPreview && form.image && (
                    <button
                      onClick={() => setForm((p) => ({ ...p, image: "" }))}
                      className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {formError && <p className={errorClass}>{formError}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditing(null)}
                    className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving || imgUploading}
                    className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98] disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Linked products side panel */}
      <AnimatePresence>
        {panelService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setPanelService(null)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-zinc-950 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center justify-between border-b border-white/5 p-5">
                <div className="flex items-center gap-3">
                  {panelService.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={panelService.image} alt={panelService.name} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                      <ServiceIconFallback name={panelService.name} category={panelService.storeCategory} className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100">{panelService.name}</h3>
                    <p className="text-xs text-zinc-500">
                      Available with {linkedProducts.length} product{linkedProducts.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPanelService(null)}
                  className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                  aria-label="Close panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {panelLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
                  </div>
                ) : linkedProducts.length === 0 ? (
                  <div className="py-16 text-center">
                    <Package className="mx-auto h-8 w-8 text-zinc-700" />
                    <p className="mt-3 text-sm text-zinc-500">
                      This service is not linked to any product yet.
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      Open a product and link this service from the store pool.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {linkedProducts.map((p) => (
                      <Link
                        key={p._id}
                        href={`/dashboard/products/${p.uniqueProductId}?storeId=${p.storeId}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/5 bg-zinc-900 p-3.5 transition-colors hover:border-blue-500/30"
                      >
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-100">{p.name}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            ${p.price} · Qty {p.quantity}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-blue-400">Open &rarr;</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 p-4">
                <p className="flex items-center gap-1.5 text-xs text-zinc-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Editing this service updates it everywhere it is linked.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
