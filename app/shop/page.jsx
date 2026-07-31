"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import { useAuth } from "@/app/providers/AuthProvider";
import { useCartStore } from "@/app/stores/cartStore";
import { useEffect, useState } from "react";
import { Package, Wrench, ShoppingCart, Check, Store, MapPin } from "lucide-react";

export default function ShopPage() {
  const { user } = useAuth();
  const { addItem } = useCartStore();

  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selected, setSelected] = useState({});
  const [added, setAdded] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stores");
        const storeList = (await res.json()).filter((s) => !s.disabled);
        setStores(storeList);
        const all = [];
        await Promise.all(
          storeList.map(async (s) => {
            try {
              const r = await fetch(`/api/stores/${s.uniqueStoreId}/products`);
              const products = await r.json();
              all.push(
                ...(products || [])
                  .filter((p) => p.isActive !== false)
                  .map((p) => ({ ...p, storeName: s.name, storeCategory: s.category }))
              );
            } catch {
              // skip store
            }
          })
        );
        setProducts(all.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
      } catch {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAddToCart = async (product, serviceId) => {
    setError("");
    if (!user) return;
    const res = await addItem(user.uid, {
      productId: product.uniqueProductId,
      storeName: product.storeName || "",
      serviceId: serviceId || "",
      quantity: 1,
    });
    if (res.ok) {
      setAdded((prev) => ({ ...prev, [`${product.uniqueProductId}|${serviceId || ""}`]: true }));
      setTimeout(() => {
        setAdded((prev) => ({ ...prev, [`${product.uniqueProductId}|${serviceId || ""}`]: false }));
      }, 1500);
    } else {
      setError(res.error);
    }
  };

  const visible = selectedStore
    ? products.filter((p) => p.storeId === selectedStore)
    : products;

  return (
    <ShopLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Shop</h1>
          <p className="text-sm text-text-muted mt-1">
            Browse products and add them to your cart
            {selectedStore && stores.find((s) => s.uniqueStoreId === selectedStore)
              ? ` from ${stores.find((s) => s.uniqueStoreId === selectedStore).name}`
              : ""}
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-20">
            <div className="rounded-2xl border border-border-default bg-bg-surface p-4">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Store className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-semibold text-text-primary">Stores</h2>
                <span className="text-xs text-text-muted ml-auto">{stores.length}</span>
              </div>
              {loading ? (
                <p className="text-sm text-text-muted px-1">Loading...</p>
              ) : stores.length === 0 ? (
                <p className="text-sm text-text-muted px-1">No stores yet.</p>
              ) : (
                <div className="grid gap-1.5">
                  <button
                    onClick={() => setSelectedStore(null)}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      selectedStore === null
                        ? "bg-primary-500/15 text-primary-400"
                        : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                    }`}
                  >
                    <Package className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">All Stores</span>
                    <span className="text-xs text-text-muted">{products.length}</span>
                  </button>
                  {stores.map((s) => {
                    const count = products.filter((p) => p.storeId === s.uniqueStoreId).length;
                    return (
                      <button
                        key={s.uniqueStoreId}
                        onClick={() => setSelectedStore(s.uniqueStoreId)}
                        className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          selectedStore === s.uniqueStoreId
                            ? "bg-primary-500/15 text-primary-400"
                            : "text-text-secondary hover:bg-bg-muted hover:text-text-primary"
                        }`}
                      >
                        <Store className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{s.name}</span>
                        <span className="text-xs text-text-muted">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedStore && (
              <div className="mt-4 rounded-2xl border border-border-default bg-bg-surface p-4">
                {(() => {
                  const s = stores.find((st) => st.uniqueStoreId === selectedStore);
                  if (!s) return null;
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                          <p className="text-xs text-text-muted">{s.category}</p>
                        </div>
                      </div>
                      {s.description && (
                        <p className="text-xs text-text-secondary leading-relaxed">{s.description}</p>
                      )}
                      <div className="grid gap-1.5 text-xs text-text-muted">
                        {s.phoneNumber && <p>{s.phoneNumber}</p>}
                        {s.address?.city && (
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {s.address.city}
                            {s.address.state ? `, ${s.address.state}` : ""}
                            {s.address.country ? `, ${s.address.country}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </aside>

          <div className="flex flex-col gap-4 min-w-0">
            {loading ? (
              <div className="text-sm text-text-muted">Loading products...</div>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
                {selectedStore ? "This store has no products yet." : "No products available yet. Check back soon."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((p) => (
                  <div key={p._id} className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">{p.currency === "INR" ? "₹" : "$"}{p.price}</p>
                        {p.discountPrice != null && (
                          <p className="text-xs text-text-muted line-through">${p.discountPrice}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{p.name}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{p.description}</p>
                      {p.storeName && (
                        <p className="text-xs text-primary-400 mt-1.5 flex items-center gap-1">
                          <Store className="w-3 h-3" /> Sold by {p.storeName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-text-muted">
                      <span>{p.quantity} in stock</span>
                      {p.unit && <span> · {p.unit}</span>}
                    </div>

                    {p.services?.length > 0 && (
                      <div className="grid gap-1.5">
                        <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Add a service
                        </p>
                        {p.services.map((s) => (
                          <label
                            key={s.serviceId}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border-default bg-bg-muted cursor-pointer hover:border-primary-500/40 transition-colors"
                          >
                            <input
                              type="radio"
                              name={`service-${p.uniqueProductId}`}
                              checked={selected[p.uniqueProductId] === s.serviceId}
                              onChange={() =>
                                setSelected((prev) => ({ ...prev, [p.uniqueProductId]: s.serviceId }))
                              }
                              className="accent-primary-500"
                            />
                            <span className="text-xs text-text-primary">{s.name}</span>
                            <span className="text-xs text-text-muted ml-auto">+${s.charges}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleAddToCart(p, selected[p.uniqueProductId])}
                      disabled={p.quantity <= 0}
                      className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                        added[`${p.uniqueProductId}|${selected[p.uniqueProductId] || ""}`]
                          ? "bg-success/15 text-success"
                          : "bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40"
                      }`}
                    >
                      {added[`${p.uniqueProductId}|${selected[p.uniqueProductId] || ""}`] ? (
                        <>
                          <Check className="w-4 h-4" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {p.quantity <= 0 ? "Out of stock" : "Add to Cart"}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-text-muted flex items-center gap-1">
          <Wrench className="w-3 h-3" /> Products with linked services show extra service options — add them alongside the product.
        </p>
      </div>
    </ShopLayout>
  );
}