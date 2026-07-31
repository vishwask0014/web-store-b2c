"use client";

import DashboardLayout from "@/app/components/common/dashboardLayout";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useAuth } from "@/app/providers/AuthProvider";
import { Package, Plus, Wrench, AlertTriangle } from "lucide-react";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/stores?ownerId=${user.uid}`)
      .then((r) => r.json())
      .then(setStores);
  }, [user]);

  useEffect(() => {
    if (!selectedStore) {
      setPool([]);
      setSelectedServices([]);
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
    fetchProducts(selectedStore);
  }, [selectedStore]);

  const handleCreate = async () => {
    setError("");
    if (!name.trim() || !price || !quantity) {
      setError("Name, price, and quantity are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${selectedStore}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price),
          quantity: Number(quantity),
          description,
          isServiceAvailable,
          services: selectedServices,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      setName("");
      setPrice("");
      setQuantity("");
      setDescription("");
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
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-border-default bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select a store</option>
                {enabledStores.map((s) => (
                  <option key={s.uniqueStoreId} value={s.uniqueStoreId}>
                    {s.name}
                  </option>
                ))}
              </select>
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
                {products.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-text-primary">{p.name}</p>
                          {p.isServiceAvailable && (
                            <span className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                              <Wrench className="w-3 h-3" /> Service
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-text-muted flex-wrap">
                          <span>${p.price}</span>
                          <span className="text-text-placeholder">|</span>
                          <span>Qty: {p.quantity}</span>
                          <span className="text-text-placeholder">|</span>
                          <span className="text-text-placeholder">ID: {p.uniqueProductId}</span>
                          {(p.services?.length || 0) > 0 && (
                            <>
                              <span className="text-text-placeholder">|</span>
                              <span className="text-primary-400">{p.services.length} service{p.services.length > 1 ? "s" : ""}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {p.isServiceAvailable && (
                      <a
                        href={`/dashboard/products/${p.uniqueProductId}?storeId=${selectedStore}`}
                        className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0"
                      >
                        Manage Services &rarr;
                      </a>
                    )}
                    {!p.isServiceAvailable && (
                      <a
                        href={`/dashboard/products/${p.uniqueProductId}?storeId=${selectedStore}`}
                        className="text-sm text-primary-400 hover:text-primary-500 font-medium shrink-0"
                      >
                        Details &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}