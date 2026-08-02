"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { compressImage, uploadFile } from "@/app/lib/upload";
import Link from "next/link";
import {
  Package,
  Plus,
  Wrench,
  AlertTriangle,
  X,
  Loader2,
  Store as StoreIcon,
  ChevronDown,
  ChevronUp,
  Eye,
  PlusCircle,
  MinusCircle,
  Timer,
  ShoppingBag,
  DollarSign,
  Hourglass,
  TrendingUp,
  TrendingDown,
  Calendar,
  Percent,
} from "lucide-react";
import { useId, useState, useEffect } from "react";
import { Label, Switch } from "react-aria-components";

export default function ProductsPage() {
  const { user } = useAuth();
  const nameId = useId();
  const priceId = useId();
  const qtyId = useId();
  const descId = useId();

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [isServiceAvailable, setIsServiceAvailable] = useState(false);
  const [pool, setPool] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openAccordion, setOpenAccordion] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/stores?ownerId=${user.uid}`)
      .then((r) => r.json())
      .then((list) => {
        setStores(list);
        setSelectedStore((prev) => prev || list[0]?.uniqueStoreId || "");
      });
  }, [user]);

  useEffect(() => {
    if (!selectedStore) {
      void Promise.resolve().then(() => {
        setPool([]);
        setSelectedServices([]);
      });
      return;
    }
    fetch(`/api/stores/${selectedStore}/services`)
      .then((r) => r.json())
      .then(setPool);
  }, [selectedStore]);

  const fetchProducts = async (storeId) => {
    if (!storeId) return;
    const res = await fetch(`/api/stores/${storeId}/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    if (selectedStore) {
      void Promise.resolve().then(() => fetchProducts(selectedStore));
    }
  }, [selectedStore]);

  const handleCreate = async () => {
    setError("");
    if (!name.trim() || !price || !quantity) {
      setError("Name, price, and quantity are required.");
      return;
    }
    setLoading(true);
    try {
      const finalImages = [...images];
      for (const p of pendingFiles) {
        const dataUrl = await compressImage(p.file);
        finalImages.push(await uploadFile(dataUrl, "products"));
      }
      const res = await fetch(`/api/stores/${selectedStore}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          quantity: Number(quantity),
          description,
          images: finalImages,
          isServiceAvailable,
          services: selectedServices,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      pendingFiles.forEach((p) => URL.revokeObjectURL(p.url));
      setName("");
      setPrice("");
      setQuantity("");
      setDescription("");
      setImages([]);
      setPendingFiles([]);
      setIsServiceAvailable(false);
      setSelectedServices([]);
      setShowForm(false);
      fetchProducts(selectedStore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const store = stores.find((s) => s.uniqueStoreId === selectedStore);
  const enabledStores = stores.filter((s) => !s.disabled);
  const isStoreDisabled = store?.disabled;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Products</h1>
          <p className="text-sm text-text-muted mt-1">Manage your product catalog</p>
        </div>

        {stores.length === 0 ? (
          <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
            Create a store first before adding products.
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {enabledStores.map((s) => (
                  <button
                    key={s.uniqueStoreId}
                    type="button"
                    onClick={() => setSelectedStore(s.uniqueStoreId)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      selectedStore === s.uniqueStoreId
                        ? "border-primary-500/60 bg-primary-500/15 text-primary-400"
                        : "border-border-default text-text-secondary hover:border-primary-500/40 hover:text-text-primary"
                    }`}
                  >
                    <StoreIcon className="w-4 h-4" />
                    {s.name}
                  </button>
                ))}
              </div>
              {selectedStore && !isStoreDisabled && (
                <Button size="sm" className="gap-2 w-fit" onPress={() => setShowForm(!showForm)}>
                  <Plus className="w-4 h-4" />
                  {showForm ? "Cancel" : "Add Product"}
                </Button>
              )}
            </div>

            {isStoreDisabled && selectedStore && (
              <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This store is disabled: {store.disabledReason}
              </div>
            )}

            {showForm && selectedStore && (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">New Product</h3>
                <div className="grid gap-4 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor={nameId} className="text-sm text-text-secondary">Product Name</Label>
                    <Input id={nameId} placeholder="Eco Cleaner Bottle" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={priceId} className="text-sm text-text-secondary">Price ($)</Label>
                      <Input id={priceId} type="number" placeholder="24.99" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={qtyId} className="text-sm text-text-secondary">Quantity</Label>
                      <Input id={qtyId} type="number" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={descId} className="text-sm text-text-secondary">Description</Label>
                    <textarea
                      id={descId}
                      placeholder="Product description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border border-border-default bg-bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 min-h-[80px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-text-secondary">
                      Product Photos{" "}
                      {images.length > 0 && <span className="text-xs text-text-muted">({images.length})</span>}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {images.map((img, i) => (
                        <div
                          key={i}
                          className="relative h-20 w-20 overflow-hidden rounded-xl border border-border-default"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                            aria-label={`Remove photo ${i + 1}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {pendingFiles.map((p, i) => (
                        <div
                          key={`pending-${i}`}
                          className="relative h-20 w-20 overflow-hidden rounded-xl border border-dashed border-primary-500/50"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={`New photo ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
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
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-muted transition-colors hover:border-primary-500/50 hover:text-primary-400">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImagesSelect}
                          disabled={loading}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-text-muted">Add multiple photos — shown as a carousel on product cards.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm text-text-secondary">
                      Services available for this product{" "}
                      {selectedServices.length > 0 && (
                        <span className="text-xs text-text-muted">({selectedServices.length}/7 selected)</span>
                      )}
                    </Label>
                    {pool.length === 0 ? (
                      <p className="text-xs text-text-muted rounded-xl border border-border-default bg-bg-muted p-3">
                        No services in this store yet. You can add services to this product after creating it.
                      </p>
                    ) : (
                      <div className="rounded-xl border border-border-default bg-bg-muted p-3 grid gap-2 max-h-56 overflow-y-auto">
                        {pool.map((s) => {
                          const checked = selectedServices.includes(s._id);
                          const disabled = !checked && selectedServices.length >= 7;
                          return (
                            <label
                              key={s._id}
                              className={`flex items-center gap-3 p-3 rounded-xl border bg-bg-surface cursor-pointer transition-colors ${
                                checked ? "border-primary-500/60" : "border-border-default hover:border-primary-500/40"
                              } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() =>
                                  setSelectedServices((prev) =>
                                    checked ? prev.filter((id) => id !== s._id) : [...prev, s._id]
                                  )
                                }
                                className="accent-primary-500 w-4 h-4"
                              />
                              {s.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={s.image} alt={s.name} className="h-6 w-6 rounded-lg object-cover" />
                              )}
                              <span className="text-sm text-text-primary">{s.name}</span>
                              <span className="text-xs text-text-muted ml-auto">${s.charges}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      isSelected={isServiceAvailable}
                      onChange={setIsServiceAvailable}
                      className="group flex items-center gap-2 text-sm text-text-secondary"
                    >
                      <div className="w-9 h-5 rounded-full bg-bg-muted group-data-[selected]:bg-primary-500 transition-colors p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white shadow group-data-[selected]:translate-x-4 transition-transform" />
                      </div>
                      Show &quot;Service available&quot; badge (auto-on when services are selected)
                    </Switch>
                  </div>
                  {error && <p className="text-sm text-danger">{error}</p>}
                  <Button onPress={handleCreate} isDisabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            )}

            {selectedStore && products.length === 0 && !showForm ? (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
                No products yet in this store.
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((p) => {
                  const rackDays = Math.max(0, Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000));
                  const lastOrderDays =
                    p.lastOrderAt ? Math.max(0, Math.floor((Date.now() - new Date(p.lastOrderAt).getTime()) / 86400000)) : null;
                  const views = p.views || 0;
                  const orders = p.orderCount || 0;
                  const conversion = views > 0 ? ((orders / views) * 100).toFixed(1) : "0.0";
                  const avgDwell = p.cartDwellCount > 0 ? Math.max(1, Math.round(p.cartDwellMinutes / p.cartDwellCount)) : 0;
                  const perf = orders > 0 ? (lastOrderDays !== null && lastOrderDays <= 7 ? "selling_well" : "slow_mover") : "no_sales";
                  const lowStock = (p.quantity || 0) <= 5;
                  const isOpen = openAccordion === p._id;
                  return (
                    <div key={p._id} className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? "" : p._id)}
                        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-bg-muted/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-bg-muted flex items-center justify-center">
                          {p.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-primary-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-text-primary truncate">{p.name}</p>
                            {p.isServiceAvailable && (
                              <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                                <Wrench className="w-3 h-3" /> Service
                              </span>
                            )}
                            {lowStock && (
                              <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-3 h-3" /> Low stock
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted flex-wrap">
                            <span>${p.price}</span>
                            <span className="text-text-placeholder">|</span>
                            <span>Qty: {p.quantity}</span>
                            <span className="text-text-placeholder">|</span>
                            <span>ID: {p.uniqueProductId}</span>
                            {(p.services?.length || 0) > 0 && (
                              <>
                                <span className="text-text-placeholder">|</span>
                                <span className="text-primary-400">{p.services.length} service{p.services.length > 1 ? "s" : ""}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-text-muted shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="border-t border-border-default p-4 sm:p-5 space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(p.images?.length > 0 ? p.images : [null]).map((img, i) => (
                                <div
                                  key={i}
                                  className="w-14 h-14 rounded-xl overflow-hidden bg-bg-muted flex items-center justify-center border border-border-default"
                                >
                                  {img ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={img} alt={`${p.name} ${i + 1}`} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-4 h-4 text-text-placeholder" />
                                  )}
                                </div>
                              ))}
                              <span className="text-xs text-text-muted ml-1">{p.images?.length || 0} image{p.images?.length === 1 ? "" : "s"}</span>
                            </div>
                            <Link
                              href={`/dashboard/products/${p.uniqueProductId}?storeId=${selectedStore}`}
                              className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0"
                            >
                              {p.isServiceAvailable ? "Manage Services" : "Details"} &rarr;
                            </Link>
                          </div>

                          <div
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                              perf === "selling_well"
                                ? "bg-success/10 text-success"
                                : perf === "slow_mover"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-bg-muted text-text-muted"
                            }`}
                          >
                            {perf === "selling_well" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : perf === "slow_mover" ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <Hourglass className="w-4 h-4" />
                            )}
                            {perf === "selling_well"
                              ? "Selling well — last order " + (lastOrderDays === 0 ? "today" : `${lastOrderDays} day${lastOrderDays > 1 ? "s" : ""} ago`)
                              : perf === "slow_mover"
                                ? `Slow mover — last order ${lastOrderDays} day${lastOrderDays > 1 ? "s" : ""} ago`
                                : "No sales yet — on the rack for " + (rackDays < 1 ? "under a day" : `${rackDays} day${rackDays > 1 ? "s" : ""}`)}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Eye className="w-3.5 h-3.5" /> Views
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{views}</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <PlusCircle className="w-3.5 h-3.5" /> Cart adds
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{p.cartAdds || 0}</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <MinusCircle className="w-3.5 h-3.5" /> Cart removes
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{p.cartRemoves || 0}</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Timer className="w-3.5 h-3.5" /> Avg dwell
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">
                                {avgDwell ? `${avgDwell}m` : "—"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <ShoppingBag className="w-3.5 h-3.5" /> Units sold
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{p.unitsSold || 0}</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Package className="w-3.5 h-3.5" /> Orders
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{orders}</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <DollarSign className="w-3.5 h-3.5" /> Revenue
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">
                                {p.revenue ? `$${Number(p.revenue).toFixed(2)}` : "—"}
                              </p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Percent className="w-3.5 h-3.5" /> Conv. rate
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">{conversion}%</p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Hourglass className="w-3.5 h-3.5" /> On rack
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">
                                {rackDays < 1 ? "<1d" : `${rackDays}d`}
                              </p>
                            </div>
                            <div className="rounded-xl bg-bg-muted/60 p-3">
                              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                                <Calendar className="w-3.5 h-3.5" /> Last order
                              </div>
                              <p className="text-lg font-semibold text-text-primary mt-1">
                                {lastOrderDays !== null
                                  ? new Date(p.lastOrderAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}