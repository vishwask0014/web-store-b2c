"use client";

import ShopLayout from "@/app/components/common/ShopLayout";
import ProductCard from "@/app/components/shop/ProductCard";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Clock, MapPin, Phone, Store, Truck } from "lucide-react";

export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [storeRes, productsRes] = await Promise.all([
          fetch(`/api/stores/${params.storeId}`),
          fetch(`/api/stores/${params.storeId}/products`),
        ]);
        const storeJson = await storeRes.json();
        const productsJson = await productsRes.json();
        if (!storeRes.ok) throw new Error(storeJson.error || "Store not found.");
        if (!cancelled) {
          setStore(storeJson);
          setProducts(productsJson || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.storeId]);

  if (loading) {
    return (
      <ShopLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-28 rounded-2xl bg-bg-muted" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-bg-muted" />
            ))}
          </div>
        </div>
      </ShopLayout>
    );
  }

  if (error || !store) {
    return (
      <ShopLayout>
        <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center">
          <p className="text-sm text-text-muted">{error || "Store not found."}</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-primary-400">
            Back to shop
          </Link>
        </div>
      </ShopLayout>
    );
  }

  return (
    <ShopLayout>
      <div className="flex flex-col gap-5">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-400">
              <Store className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-text-primary">{store.name}</h1>
              <p className="text-xs text-text-muted">{store.category}</p>
              {store.description && (
                <p className="mt-2 text-sm text-text-secondary">{store.description}</p>
              )}
              <div className="mt-3 grid gap-1.5 text-xs text-text-muted sm:grid-cols-2">
                {store.phoneNumber && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {store.phoneNumber}
                  </p>
                )}
                {store.address?.city && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {store.address.city}
                    {store.address.state ? `, ${store.address.state}` : ""}
                    {store.address.country ? `, ${store.address.country}` : ""}
                  </p>
                )}
                {store.etaMinutes > 0 && (
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Delivery in ~{store.etaMinutes} min
                  </p>
                )}
                <p className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {store.deliveryFee > 0
                    ? `Delivery $${store.deliveryFee.toFixed(2)}`
                    : "Free delivery"}
                  {store.freeDeliveryAbove > 0 && ` above $${store.freeDeliveryAbove.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary">
            Products ({products.length})
          </h2>
          {products.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
              This store has no products yet.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.uniqueProductId} product={{ ...p, storeName: store.name }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
