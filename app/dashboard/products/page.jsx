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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    fetch(`/api/stores?ownerId=${user.uid}`)
      .then((r) => r.json())
      .then(setStores);
  }, [user]);

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
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product catalog</p>
        </div>

        {stores.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
            Create a store first before adding products.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <option value="">Select a store</option>
                {enabledStores.map((s) => (
                  <option key={s.uniqueStoreId} value={s.uniqueStoreId}>
                    {s.name}
                  </option>
                ))}
              </select>
              {selectedStore && !isStoreDisabled && (
                <Button size="sm" className="gap-2" onPress={() => setShowForm(!showForm)}>
                  <Plus className="w-4 h-4" />
                  {showForm ? "Cancel" : "Add Product"}
                </Button>
              )}
            </div>

            {isStoreDisabled && selectedStore && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                This store is disabled: {store.disabledReason}
              </div>
            )}

            {showForm && selectedStore && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">New Product</h3>
                <div className="grid gap-4 max-w-md">
                  <div className="grid gap-2">
                    <Label htmlFor={nameId} className="text-sm text-slate-700">Product Name</Label>
                    <Input id={nameId} placeholder="Eco Cleaner Bottle" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor={priceId} className="text-sm text-slate-700">Price ($)</Label>
                      <Input id={priceId} type="number" placeholder="24.99" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor={qtyId} className="text-sm text-slate-700">Quantity</Label>
                      <Input id={qtyId} type="number" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={descId} className="text-sm text-slate-700">Description</Label>
                    <textarea
                      id={descId}
                      placeholder="Product description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 min-h-[80px]"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      isSelected={isServiceAvailable}
                      onChange={setIsServiceAvailable}
                      className="group flex items-center gap-2 text-sm text-slate-700"
                    >
                      <div className="w-9 h-5 rounded-full bg-slate-300 group-data-[selected]:bg-indigo-500 transition-colors p-0.5">
                        <div className="w-4 h-4 rounded-full bg-white shadow group-data-[selected]:translate-x-4 transition-transform" />
                      </div>
                      Service available for this product
                    </Switch>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button onPress={handleCreate} isDisabled={loading}>
                    {loading ? "Creating..." : "Create Product"}
                  </Button>
                </div>
              </div>
            )}

            {selectedStore && products.length === 0 && !showForm ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                No products yet in this store.
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((p) => (
                  <div key={p._id} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">{p.name}</p>
                          {p.isServiceAvailable && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <Wrench className="w-3 h-3" /> Service
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                          <span>${p.price}</span>
                          <span className="text-slate-300">|</span>
                          <span>Qty: {p.quantity}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-300">ID: {p.uniqueProductId}</span>
                        </div>
                      </div>
                    </div>
                    {p.isServiceAvailable && (
                      <a
                        href={`/dashboard/products/${p.uniqueProductId}?storeId=${selectedStore}`}
                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        Manage Services &rarr;
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