"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useId, useState, useEffect } from "react";
import { Label } from "react-aria-components";
import { compressImage, uploadFile } from "@/app/lib/upload";
import { Package, Wrench, Plus, Trash2, AlertTriangle, Link2, Image as ImageIcon, X, Loader2, Check, Save } from "lucide-react";

const MAX_SERVICES = 7;

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");
  const productId = params.productId;
  const { user } = useAuth();

  const svcNameId = useId();
  const svcChargesId = useId();
  const svcDescId = useId();

  const [product, setProduct] = useState(null);
  const [pool, setPool] = useState([]);
  const [store, setStore] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [svcName, setSvcName] = useState("");
  const [svcCharges, setSvcCharges] = useState("");
  const [svcDescription, setSvcDescription] = useState("");
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [imagesSaving, setImagesSaving] = useState(false);
  const [svcPhotoFile, setSvcPhotoFile] = useState(null);
  const [svcPhotoPreview, setSvcPhotoPreview] = useState("");
  const [details, setDetails] = useState(null);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsMsg, setDetailsMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!storeId || !productId) return;
    const [prod, svcs, str] = await Promise.all([
      fetch(`/api/stores/${storeId}/products/${productId}`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}/services`).then((r) => r.json()),
      fetch(`/api/stores/${storeId}`).then((r) => r.json()),
    ]);
    setProduct(prod);
    setImages((prev) => {
      const merged = [...(prod.images || [])];
      prev.forEach((u) => {
        if (!merged.includes(u)) merged.push(u);
      });
      return merged;
    });
    setPool(svcs);
    setStore(str);
    setDetails({
      name: prod.name || "",
      price: prod.price ?? "",
      discountPrice: prod.discountPrice ?? "",
      quantity: prod.quantity ?? "",
      description: prod.description || "",
      category: prod.category || "",
      brand: prod.brand || "",
      isActive: prod.isActive !== false,
    });
  };

  useEffect(() => {
    load();
  }, [storeId, productId]);

  const linkedIds = product?.services?.map((s) => s.serviceId) || [];
  const poolMap = new Map(pool.map((s) => [s._id, s]));
  const remaining = MAX_SERVICES - linkedIds.length;
  const availablePool = pool.filter((s) => !linkedIds.includes(s._id));

  const handleLinkServices = async () => {
    setError("");
    if (selectedServices.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: [...linkedIds, ...selectedServices] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedServices([]);
      setShowLinkForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkService = async (serviceId) => {
    const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        services: linkedIds.filter((id) => id !== serviceId),
      }),
    });
    if (res.ok) load();
  };

  const handleCreateAndLink = async () => {
    setError("");
    if (!svcName.trim() || !svcCharges) {
      setError("Service name and charges are required.");
      return;
    }
    setLoading(true);
    try {
      let image = "";
      if (svcPhotoFile) {
        const dataUrl = await compressImage(svcPhotoFile);
        image = await uploadFile(dataUrl, "services");
      }
      const res = await fetch(`/api/stores/${storeId}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svcName,
          charges: Number(svcCharges),
          description: svcDescription,
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const linkRes = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: [...linkedIds, data._id] }),
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok) throw new Error(linkData.error);
      if (svcPhotoPreview) URL.revokeObjectURL(svcPhotoPreview);
      setSvcName("");
      setSvcCharges("");
      setSvcDescription("");
      setSvcPhotoFile(null);
      setSvcPhotoPreview("");
      setShowCreateForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const saveDetails = async () => {
    setError("");
    setDetailsMsg("");
    if (!details.name?.trim() || !details.price || !details.quantity) {
      setError("Name, price, and quantity are required.");
      return;
    }
    setDetailsSaving(true);
    try {
      const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name.trim(),
          price: Number(details.price),
          discountPrice: details.discountPrice ? Number(details.discountPrice) : null,
          quantity: Number(details.quantity),
          description: details.description || "",
          category: details.category || "",
          brand: details.brand || "",
          isActive: Boolean(details.isActive),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProduct(data);
      setDetailsMsg("Product details saved.");
      setTimeout(() => setDetailsMsg(""), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsSaving(false);
    }
  };

  const handleImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length !== files.length) {
      setError("Some files were not images and were skipped.");
    }
    setPendingFiles((prev) => [
      ...prev,
      ...imgs.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const handleSvcImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (svcPhotoPreview) URL.revokeObjectURL(svcPhotoPreview);
    setSvcPhotoFile(file);
    setSvcPhotoPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const saveImages = async () => {
    setError("");
    setImagesSaving(true);
    try {
      const finalImages = [...images];
      for (const p of pendingFiles) {
        const dataUrl = await compressImage(p.file);
        finalImages.push(await uploadFile(dataUrl, "products"));
      }
      const res = await fetch(`/api/stores/${storeId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: finalImages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.url));
      setPendingFiles([]);
      setProduct(data);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setImagesSaving(false);
    }
  };

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-sm text-text-muted">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1 flex-wrap">
            <Link href="/dashboard/products" className="hover:text-primary-400 text-text-muted">Products</Link>
            <span>/</span>
            <span className="text-text-primary">{product.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
            <Package className="w-6 h-6 text-primary-500" />
            {product.name}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {store?.name} &middot; ${product.price} &middot; Qty: {product.quantity} &middot; ID: {product.uniqueProductId}
          </p>
        </div>

        {store?.disabled && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            This store is disabled: {store.disabledReason}
          </div>
        )}

        <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Product Details</h2>
            </div>
            <Button size="sm" onPress={saveDetails} isDisabled={detailsSaving}>
              <Save className="w-4 h-4" />
              {detailsSaving ? "Saving..." : "Save Details"}
            </Button>
          </div>
          {details ? (
            <div className="grid gap-4 max-w-lg">
              <div className="grid gap-1">
                <Label className="text-sm text-text-secondary">Product Name</Label>
                <Input value={details.name} onChange={(e) => setDetails((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-1">
                  <Label className="text-sm text-text-secondary">Price ($)</Label>
                  <Input type="number" min="0" value={details.price} onChange={(e) => setDetails((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="grid gap-1">
                  <Label className="text-sm text-text-secondary">Discount ($)</Label>
                  <Input type="number" min="0" placeholder="Optional" value={details.discountPrice} onChange={(e) => setDetails((p) => ({ ...p, discountPrice: e.target.value }))} />
                </div>
                <div className="grid gap-1">
                  <Label className="text-sm text-text-secondary">Quantity</Label>
                  <Input type="number" min="0" value={details.quantity} onChange={(e) => setDetails((p) => ({ ...p, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-1">
                  <Label className="text-sm text-text-secondary">Category</Label>
                  <Input placeholder="e.g. Electronics" value={details.category} onChange={(e) => setDetails((p) => ({ ...p, category: e.target.value }))} />
                </div>
                <div className="grid gap-1">
                  <Label className="text-sm text-text-secondary">Brand</Label>
                  <Input placeholder="e.g. Samsung" value={details.brand} onChange={(e) => setDetails((p) => ({ ...p, brand: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-1">
                <Label className="text-sm text-text-secondary">Description</Label>
                <textarea
                  value={details.description}
                  onChange={(e) => setDetails((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
                  <button
                    type="button"
                    onClick={() => setDetails((p) => ({ ...p, isActive: !p.isActive }))}
                    className={`h-6 w-11 rounded-full p-0.5 transition-colors ${details.isActive ? "bg-primary-500" : "bg-bg-muted"}`}
                    aria-pressed={details.isActive}
                  >
                    <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${details.isActive ? "translate-x-5" : ""}`} />
                  </button>
                  {details.isActive ? "Product is live" : "Product is hidden from the shop"}
                </label>
              </div>
              {detailsMsg && <p className="flex items-center gap-1.5 text-sm font-medium text-success"><Check className="w-4 h-4" />{detailsMsg}</p>}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Loading details...</p>
          )}
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Product Photos</h2>
              <span className="text-xs text-text-muted">({images.length})</span>
            </div>
            <Button size="sm" onPress={saveImages} isDisabled={imagesSaving}>
              {imagesSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {imagesSaving ? "Uploading & saving..." : "Save Photos"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border-default">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Product photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {pendingFiles.map((p, i) => (
              <div key={`pending-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border-2 border-dashed border-primary-500/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`New photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => {
                    URL.revokeObjectURL(p.url);
                    setPendingFiles((prev) => prev.filter((_, j) => j !== i));
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                  aria-label={`Remove new photo ${i + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-muted transition-colors hover:border-primary-500/50 hover:text-primary-400">
              {imagesSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImagesSelect}
                disabled={imagesSaving}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            The first photo is the main image. All photos show as a carousel to customers.
          </p>
        </div>

        <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-text-secondary" />
              <h2 className="text-lg font-semibold text-text-primary">Services</h2>
              <span className="text-xs text-text-muted">
                ({linkedIds.length}/{MAX_SERVICES} linked)
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="gap-2 w-fit" onPress={() => setShowLinkForm(!showLinkForm)} isDisabled={remaining <= 0 || availablePool.length === 0}>
                <Link2 className="w-4 h-4" />
                {showLinkForm ? "Cancel" : "Link from Store Services"}
              </Button>
              <Button size="sm" variant="secondary" className="gap-2 w-fit" onPress={() => setShowCreateForm(!showCreateForm)} isDisabled={remaining <= 0}>
                <Plus className="w-4 h-4" />
                {showCreateForm ? "Cancel" : "New Service"}
              </Button>
            </div>
          </div>

          {remaining <= 0 && (
            <p className="text-xs text-warning mb-3">
              You can link at most {MAX_SERVICES} services to a product. Unlink one to add more.
            </p>
          )}

          {showLinkForm && (
            <div className="mb-4 p-4 rounded-xl border border-border-default bg-bg-muted">
              <p className="text-sm text-text-secondary mb-3">
                Select services from your store pool to link to this product ({availablePool.length} available):
              </p>
              <div className="grid gap-2 mb-4">
                {availablePool.map((s) => (
                  <label key={s._id} className="flex items-center gap-3 p-3 rounded-xl border border-border-default bg-bg-surface cursor-pointer hover:border-primary-500/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s._id)}
                      onChange={() => toggleService(s._id)}
                      className="accent-primary-500 w-4 h-4"
                    />
                    {s.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image} alt={s.name} className="h-6 w-6 rounded-lg object-cover" />
                    )}
                    <span className="text-sm text-text-primary">{s.name}</span>
                    <span className="text-xs text-text-muted ml-auto">${s.charges}</span>
                  </label>
                ))}
              </div>
              {error && <p className="text-sm text-danger mb-3">{error}</p>}
              <Button onPress={handleLinkServices} isDisabled={loading || selectedServices.length === 0}>
                {loading ? "Saving..." : `Link ${selectedServices.length} Service${selectedServices.length === 1 ? "" : "s"}`}
              </Button>
            </div>
          )}

          {showCreateForm && (
            <div className="mb-4 p-4 rounded-xl border border-border-default bg-bg-muted">
              <div className="grid gap-3 max-w-md">
                <div className="grid gap-1">
                  <Label htmlFor={svcNameId} className="text-sm text-text-secondary">Service Name</Label>
                  <Input id={svcNameId} placeholder="Installation" value={svcName} onChange={(e) => setSvcName(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={svcChargesId} className="text-sm text-text-secondary">Charges ($)</Label>
                  <Input id={svcChargesId} type="number" placeholder="29.99" value={svcCharges} onChange={(e) => setSvcCharges(e.target.value)} />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor={svcDescId} className="text-sm text-text-secondary">Description</Label>
                  <textarea
                    id={svcDescId}
                    placeholder="What does this service include?"
                    value={svcDescription}
                    onChange={(e) => setSvcDescription(e.target.value)}
                    className="rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 min-h-[60px]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  {svcPhotoPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={svcPhotoPreview} alt="Service" className="h-12 w-12 rounded-xl object-cover" />
                  )}
                  <label className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary-500/50">
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    {loading ? "Uploading..." : svcPhotoPreview ? "Change photo" : "Add photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSvcImageUpload}
                      disabled={loading}
                    />
                  </label>
                  {svcPhotoPreview && (
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(svcPhotoPreview);
                        setSvcPhotoFile(null);
                        setSvcPhotoPreview("");
                      }}
                      className="text-xs text-text-muted hover:text-danger transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button onPress={handleCreateAndLink} isDisabled={loading}>
                  {loading ? "Adding..." : "Create & Link Service"}
                </Button>
              </div>
            </div>
          )}

          {linkedIds.length === 0 ? (
            <p className="text-sm text-text-muted">
              No services linked to this product yet. Link services from your store or create a new one.
            </p>
          ) : (
            <div className="grid gap-3">
              {product.services.map((svc) => {
                const svcInfo = poolMap.get(svc.serviceId);
                return (
                  <div key={svc.serviceId} className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-bg-muted">
                    <div className="flex items-center gap-3">
                      {svcInfo?.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={svcInfo.image} alt={svc.name} className="h-9 w-9 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15 text-primary-400">
                          <Wrench className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm text-text-primary">{svc.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">${svc.charges}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnlinkService(svc.serviceId)}
                      className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Unlink service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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