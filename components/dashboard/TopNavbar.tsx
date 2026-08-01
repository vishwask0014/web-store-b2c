"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Menu,
  ChevronRight,
  ChevronDown,
  Calendar,
  Download,
  Store as StoreIcon,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import NotificationBell from "@/app/components/common/NotificationBell";
import ProfileDropdown from "@/app/components/common/ProfileDropdown";
import { RANGE_LABELS, ordersToCsv } from "@/data/dashboard";
import type { RangeKey, StoreSummary } from "@/types/dashboard";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  store: "Store",
  products: "Products",
  orders: "Orders",
  admin: "Admin",
  users: "Users",
  settings: "Settings",
  "profile-settings": "Profile",
};

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export default function TopNavbar({ onToggleSidebar }: TopNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<"stores" | "range" | "messages" | null>(null);
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [exporting, setExporting] = useState(false);

  const segments = pathname?.split("/").filter(Boolean) || [];
  const currentPage = segments[segments.length - 1] || "dashboard";
  const pageTitle = PAGE_TITLES[currentPage] || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  const range = (searchParams.get("range") as RangeKey) || "30";

  useEffect(() => {
    if (!user?.uid) return;
    void Promise.resolve()
      .then(() => fetch(`/api/stores?ownerId=${user.uid}`))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStores(data);
      })
      .catch(() => {});
  }, [user?.uid]);

  const storesRef = useClickOutside(() => setOpenMenu((m) => (m === "stores" ? null : m)));
  const rangeRef = useClickOutside(() => setOpenMenu((m) => (m === "range" ? null : m)));
  const messagesRef = useClickOutside(() => setOpenMenu((m) => (m === "messages" ? null : m)));

  const closeMenus = () => setOpenMenu(null);
  const toggleMenu = (menu: "stores" | "range" | "messages") =>
    setOpenMenu((current) => (current === menu ? null : menu));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/dashboard/products?q=${encodeURIComponent(q)}` : "/dashboard/products");
  };

  const setRange = (key: RangeKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", key);
    router.replace(`${pathname}?${params.toString()}`);
    setOpenMenu(null);
  };

  const handleExport = async () => {
    if (!user?.uid || exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/orders?sellerId=${user.uid}`);
      const data = await res.json();
      const orders = Array.isArray(data) ? data : [];
      const csv = ordersToCsv(orders);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const iconButtonClass =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-zinc-900 text-zinc-400 transition-colors hover:border-white/10 hover:text-zinc-200";

  return (
    <div className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        {/* Left: title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-zinc-100">{pageTitle}</h1>
            {segments.length > 1 && (
              <nav className="flex items-center gap-1 text-[11px] text-zinc-600" aria-label="Breadcrumb">
                <span>Dashboard</span>
                {segments.slice(1).map((seg) => (
                  <span key={seg} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-zinc-700" />
                    <span className={seg === segments[segments.length - 1] ? "text-zinc-400" : ""}>
                      {PAGE_TITLES[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)}
                    </span>
                  </span>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="h-9 w-52 rounded-full border border-white/5 bg-zinc-900 pl-9 pr-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:w-64 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10"
            />
          </form>

          <div ref={storesRef} className="relative">
            <button
              onClick={() => toggleMenu("stores")}
              className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-zinc-900 px-3.5 text-sm text-zinc-300 transition-colors hover:border-white/10"
            >
              <StoreIcon className="h-4 w-4 text-zinc-500" />
              <span className="hidden max-w-28 truncate sm:block">
                {stores.length > 0 ? stores[0].name : "My Stores"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
            </button>
            <AnimateMenu open={openMenu === "stores"}>
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Your Stores
              </p>
              {stores.length === 0 ? (
                <p className="px-3 py-2 text-sm text-zinc-500">No stores yet.</p>
              ) : (
                stores.map((s) => (
                  <a
                    key={s.uniqueStoreId}
                    href="/dashboard/store"
                    onClick={closeMenus}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${s.disabled ? "bg-red-500" : "bg-emerald-500"}`}
                    />
                    <span className="truncate">{s.name}</span>
                    <span className="ml-auto text-[11px] text-zinc-600">{s.category}</span>
                  </a>
                ))
              )}
            </AnimateMenu>
          </div>

          <div ref={rangeRef} className="relative">
            <button
              onClick={() => toggleMenu("range")}
              className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-zinc-900 px-3.5 text-sm text-zinc-300 transition-colors hover:border-white/10"
            >
              <Calendar className="h-4 w-4 text-zinc-500" />
              {RANGE_LABELS[range]}
              <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
            </button>
            <AnimateMenu open={openMenu === "range"}>
              {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition-colors hover:bg-white/[0.04]"
                >
                  {RANGE_LABELS[key]}
                  {range === key && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-blue-500" />}
                </button>
              ))}
            </AnimateMenu>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex h-9 items-center gap-2 rounded-full bg-blue-500 px-4 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:block">{exporting ? "Exporting..." : "Export"}</span>
          </button>

          <NotificationBell />

          <div ref={messagesRef} className="relative">
            <button
              onClick={() => toggleMenu("messages")}
              className={iconButtonClass}
              aria-label="Messages"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <AnimateMenu open={openMenu === "messages"}>
              <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Messages
              </p>
              <p className="px-3 py-2 text-sm text-zinc-500">No messages yet.</p>
            </AnimateMenu>
          </div>

          <div className="flex items-center pl-1">
            <ProfileDropdown compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimateMenu({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-1.5 shadow-2xl shadow-black/50"
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
