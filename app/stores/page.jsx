"use client";

import PublicHeader from "@/app/components/common/PublicHeader";
import Pagination from "@/app/components/common/Pagination";
import Logo from "@/app/components/common/Logo";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Store, Phone, MapPin, Package, AlertTriangle } from "lucide-react";

const PAGE_SIZE = 12;

export default function StoresPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [counts, setCounts] = useState({});
  const [nearStores, setNearStores] = useState([]);
  const [mode, setMode] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = (await res.json()).filter((s) => !s.disabled);
        setStores(data);

        const c = {};
        await Promise.all(
          data.map(async (s) => {
            try {
              const r = await fetch(`/api/stores/${s.uniqueStoreId}/products`);
              const products = await r.json();
              c[s.uniqueStoreId] = (products || []).filter((p) => p.isActive !== false).length;
            } catch {
              c[s.uniqueStoreId] = 0;
            }
          })
        );
        setCounts(c);

        if (user?.uid) {
          try {
            const u = await fetch(`/api/users?uid=${user.uid}`).then((r) => r.json());
            const city = u.location?.city?.trim().toLowerCase();
            const zip = u.location?.zip?.trim().toLowerCase();
            if (city || zip) {
              const near = data.filter((s) => {
                const sc = s.address?.city?.trim().toLowerCase() || "";
                const sz = s.address?.zip?.trim().toLowerCase() || "";
                return (city && sc === city) || (zip && sz === zip);
              });
              setNearStores(near);
            }
          } catch {
            // no location available
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const list = mode === "near" ? nearStores : stores;
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Stores</h1>
            <p className="text-sm text-text-muted mt-1">
              {loading ? "Loading..." : `${stores.length} stores across the marketplace`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode("all"); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "all"
                  ? "bg-primary-500 text-white"
                  : "border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary"
              }`}
            >
              All Stores
            </button>
            <button
              onClick={() => { setMode("near"); setPage(1); }}
              disabled={nearStores.length === 0}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                mode === "near"
                  ? "bg-primary-500 text-white"
                  : "border border-border-default bg-bg-surface text-text-secondary hover:text-text-primary disabled:opacity-40"
              }`}
            >
              Near You {nearStores.length > 0 && `(${nearStores.length})`}
            </button>
          </div>

          {mode === "near" && nearStores.length === 0 && !loading && (
            <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              No stores found near your location. Add your city / zip in your{" "}
              <Link href="/profile-settings" className="underline hover:opacity-80">profile</Link>{" "}
              to find stores close to you.
            </div>
          )}

          {loading ? (
            <div className="text-sm text-text-muted">Loading stores...</div>
          ) : list.length === 0 ? (
            <div className="rounded-2xl border border-border-default bg-bg-surface p-8 text-center text-sm text-text-muted">
              No stores found.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((s) => (
                  <div key={s._id} className="rounded-2xl border border-border-default bg-bg-surface p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-primary-400">
                        <Store className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-primary-400 font-medium bg-primary-500/10 px-2 py-1 rounded-full">
                        {s.category}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{s.name}</p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {s.description || "Browse our products and services."}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {counts[s.uniqueStoreId] || 0} products
                      </span>
                      {s.phoneNumber && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {s.phoneNumber}
                        </span>
                      )}
                      {s.address?.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.address.city}
                          {s.address.state ? `, ${s.address.state}` : ""}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/shop"
                      className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-primary-500/40 text-primary-400 px-4 py-2.5 text-sm font-medium hover:bg-primary-500/10 transition-colors"
                    >
                      Shop This Store
                    </Link>
                  </div>
                ))}
              </div>
              <Pagination page={safePage} pageCount={pageCount} onPage={setPage} />
            </>
          )}
        </div>
      </main>
      <footer className="border-t border-border-default bg-bg-primary py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo showText={false} />
            <span className="text-sm font-semibold text-text-primary">B2C Store</span>
          </div>
          <p className="text-sm text-text-muted">&copy; {new Date().getFullYear()} B2C Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}