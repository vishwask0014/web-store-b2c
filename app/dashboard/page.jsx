"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ShoppingBag, Users, Package, RefreshCw, AlertTriangle, ArrowRight, Store as StoreIcon } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import DashboardLayout from "../components/common/dashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import OrdersChart from "@/components/dashboard/OrdersChart";
import OrdersTable from "@/components/dashboard/OrdersTable";
import AIInsights from "@/components/dashboard/AIInsights";
import SellerPerformance from "@/components/dashboard/SellerPerformance";
import InventoryChart from "@/components/dashboard/InventoryChart";
import CustomerChart from "@/components/dashboard/CustomerChart";
import NotificationPanel from "@/components/dashboard/NotificationPanel";
import WalletSummary from "@/components/dashboard/WalletSummary";
import QuickActions from "@/components/dashboard/QuickActions";
import {
  RANGE_DAYS,
  buildInsights,
  buildRevenueSeries,
  buildSellerPerformance,
  buildWallet,
  countUniqueCustomers,
  growthPct,
  previousWindow,
} from "@/data/dashboard";

const ACCENTS = {
  revenue: "#3B82F6",
  orders: "#8B5CF6",
  customers: "#22C55E",
  products: "#F59E0B",
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userType, loading } = useAuth();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const range = (["7", "30", "90", "365"]).includes(searchParams.get("range"))
    ? searchParams.get("range")
    : "30";

  useEffect(() => {
    if (!loading && userType === "customer") {
      router.replace("/shop");
    }
  }, [userType, loading, router]);

  const load = async () => {
    if (!user?.uid || userType === "customer") return;
    try {
      const stores = await fetch(`/api/stores?ownerId=${user.uid}`).then((r) => r.json());
      const storeList = Array.isArray(stores) ? stores : [];

      const productsByStore = {};
      let products = [];
      await Promise.all(
        storeList.map(async (s) => {
          try {
            const res = await fetch(`/api/stores/${s.uniqueStoreId}/products`);
            const list = await res.json();
            if (Array.isArray(list)) {
              productsByStore[s.uniqueStoreId] = list.length;
              products = products.concat(
                list.map((p) => ({ _id: p._id, name: p.name, quantity: p.quantity, price: p.price }))
              );
            }
          } catch {
            productsByStore[s.uniqueStoreId] = 0;
          }
        })
      );

      const orders = await fetch(`/api/orders?sellerId=${user.uid}`).then((r) => r.json());
      const orderList = Array.isArray(orders) ? orders : [];

      setData({ stores: storeList, products, orders: orderList, productsByStore });
    } catch {
      // keep previous data
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user?.uid) {
      void Promise.resolve().then(load);
    }
  }, [user?.uid, userType]);

  const orders = data?.orders || [];
  const products = data?.products || [];
  const stores = data?.stores || [];
  const days = RANGE_DAYS[range];

  const series = buildRevenueSeries(orders, days);
  const prevOrders = previousWindow(orders, days);

  const customers = countUniqueCustomers(orders);
  const customersInRange = countUniqueCustomers(orders, days);
  const prevCustomers = countUniqueCustomers(prevOrders);

  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const revenueInRange = series.reduce((s, p) => s + p.revenue, 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const ordersInRange = series.reduce((s, p) => s + p.orders, 0);

  const kpis = [
    {
      title: "Revenue",
      value: revenueInRange,
      growth: growthPct(revenueInRange, prevRevenue),
      icon: Wallet,
      accent: ACCENTS.revenue,
      spark: series.map((p) => p.revenue),
      href: "/dashboard/orders",
    },
    {
      title: "Orders",
      value: ordersInRange,
      growth: growthPct(ordersInRange, prevOrders.length),
      icon: ShoppingBag,
      accent: ACCENTS.orders,
      spark: series.map((p) => p.orders),
      href: "/dashboard/orders",
      format: "number",
    },
    {
      title: "Customers",
      value: customers,
      growth: growthPct(customersInRange, prevCustomers),
      icon: Users,
      accent: ACCENTS.customers,
      spark: series.map((p) => p.orders),
      href: "/dashboard/orders",
      format: "number",
    },
    {
      title: "Products",
      value: products.length,
      growth: 0,
      icon: Package,
      accent: ACCENTS.products,
      spark: (data?.productsByStore ? Object.values(data.productsByStore) : []).slice(0, 30),
      href: "/dashboard/products",
      format: "number",
    },
  ];

  const pending = orders.filter((o) => o.status === "pending").length;
  const firstName = user?.name?.split(" ")[0] || "Seller";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          className="flex flex-wrap items-start justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Marketplace Overview</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Monitor your marketplace performance in real time · {today} · Welcome back, {firstName}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-full border border-white/5 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-white/10 hover:text-zinc-200 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </motion.div>

        {/* Pending banner */}
        {pending > 0 && (
          <motion.div variants={fadeUp}>
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-5 py-3.5 transition-colors hover:border-amber-500/40"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                <p className="text-sm text-zinc-300">
                  <span className="font-semibold text-amber-400">{pending}</span> order{pending > 1 ? "s" : ""} waiting
                  to be confirmed.
                </p>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-amber-400 shrink-0">
                Review <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </motion.div>
        )}

        {/* Onboarding banner */}
        {data && data.stores.length === 0 && (
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-zinc-900 p-6 shadow-lg shadow-blue-500/5 md:p-8">
              <div className="pointer-events-none absolute -top-24 right-10 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
                    <StoreIcon className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-100">
                    You&apos;re all set — let&apos;s launch your store
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500">
                    Create your first store, add products, and start receiving orders across the marketplace.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Create store", "Add products", "Get orders"].map((s, i) => (
                      <span
                        key={s}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-400"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/15 text-[10px] font-bold text-blue-400">
                          {i + 1}
                        </span>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href="/dashboard/store"
                  className="flex w-fit items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 active:scale-[0.98]"
                >
                  Launch your store <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* KPI cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <StatCard key={kpi.title} {...kpi} />
          ))}
        </motion.div>

        {/* Revenue + AI */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart orders={orders} />
          </div>
          <AIInsights insights={data ? buildInsights(data) : {
            todayRevenue: 0,
            topStore: "—",
            bestProduct: "—",
            pendingOrders: 0,
            pendingRefunds: 0,
            lowStock: 0,
          }} />
        </motion.div>

        {/* Orders chart + table */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <OrdersChart orders={orders} />
          <div className="xl:col-span-2">
            <OrdersTable orders={orders} />
          </div>
        </motion.div>

        {/* Seller + inventory */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SellerPerformance sellers={buildSellerPerformance(stores, orders)} />
          <InventoryChart stores={stores} productsByStore={data?.productsByStore || {}} />
        </motion.div>

        {/* Customers + wallet + notifications */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <CustomerChart orders={orders} />
          <WalletSummary wallet={buildWallet(orders)} />
          <NotificationPanel />
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp}>
          <QuickActions isAdmin={userType === "admin"} />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
