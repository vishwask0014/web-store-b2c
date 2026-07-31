"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import DashboardLayout from "../components/common/dashboardLayout";
import {
    Package,
    Store,
    ShoppingBag,
    Wallet,
    Clock,
    AlertTriangle,
    Plus,
    ArrowRight,
    Users,
    RefreshCw,
} from "lucide-react";

const STATUS_STYLES = {
    pending: "bg-warning/15 text-warning",
    confirmed: "bg-primary-500/15 text-primary-400",
    shipped: "bg-sky-500/15 text-sky-400",
    delivered: "bg-success/15 text-success",
    cancelled: "bg-danger/15 text-danger",
};

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, userType, loading } = useAuth();
    const [data, setData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

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
                            products = products.concat(list);
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

    const stats = data
        ? {
              products: data.products.length,
              stores: data.stores.length,
              orders: data.orders.length,
              revenue: data.orders.reduce((s, o) => s + (Number(o.total) || 0), 0),
              pending: data.orders.filter((o) => o.status === "pending").length,
          }
        : null;

    const recentOrders = data ? data.orders.slice(0, 6) : [];
    const lowStock = data ? data.products.filter((p) => (p.quantity || 0) <= 5) : [];
    const firstName = user?.name?.split(" ")[0] || "Seller";
    const today = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const statCards = [
        {
            label: "Total Revenue",
            value: stats ? `$${stats.revenue.toFixed(2)}` : "—",
            icon: Wallet,
            color: "bg-success/15 text-success",
            href: "/dashboard/orders",
        },
        {
            label: "Orders",
            value: stats ? String(stats.orders) : "—",
            icon: ShoppingBag,
            color: "bg-primary-500/15 text-primary-400",
            href: "/dashboard/orders",
        },
        {
            label: "Pending Orders",
            value: stats ? String(stats.pending) : "—",
            icon: Clock,
            color: "bg-warning/15 text-warning",
            href: "/dashboard/orders",
        },
        {
            label: "Products",
            value: stats ? String(stats.products) : "—",
            icon: Package,
            color: "bg-sky-500/15 text-sky-400",
            href: "/dashboard/products",
        },
        {
            label: "Stores",
            value: stats ? String(stats.stores) : "—",
            icon: Store,
            color: "bg-purple-500/15 text-purple-400",
            href: "/dashboard/store",
        },
    ];

    const quickActions = [
        { label: "New Store", href: "/dashboard/store", icon: Store },
        { label: "Add Product", href: "/dashboard/products", icon: Package },
        { label: "View Orders", href: "/dashboard/orders", icon: ShoppingBag },
    ];
    if (userType === "admin") {
        quickActions.push({ label: "Manage Users", href: "/dashboard/admin/users", icon: Users });
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                            Welcome back, {firstName} 👋
                        </h1>
                        <p className="text-sm text-text-muted mt-1">{today}</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-surface px-3.5 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-primary-500/50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Pending banner */}
                {stats?.pending > 0 && (
                    <Link
                        href="/dashboard/orders"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-5 py-4 hover:border-warning/60 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                            <p className="text-sm text-text-primary">
                                You have <span className="font-semibold text-warning">{stats.pending}</span> order{stats.pending > 1 ? "s" : ""} waiting to be confirmed.
                            </p>
                        </div>
                        <span className="flex items-center gap-1 text-sm font-medium text-warning shrink-0">
                            Review <ArrowRight className="w-4 h-4" />
                        </span>
                    </Link>
                )}

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Link
                                key={stat.label}
                                href={stat.href}
                                className="rounded-2xl border border-border-default bg-bg-surface p-4 flex flex-col gap-3 hover:border-primary-500/50 hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-text-primary leading-tight">{stat.value}</p>
                                    <p className="text-xs font-medium text-text-muted mt-0.5">{stat.label}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link
                                key={a.href}
                                href={a.href}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all duration-200 hover:shadow-primary-500/40 hover:brightness-110 active:scale-95"
                            >
                                <Icon className="w-4 h-4" />
                                {a.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent orders */}
                    <div className="lg:col-span-2 rounded-2xl border border-border-default bg-bg-surface overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border-divider">
                            <h2 className="text-base font-semibold text-text-primary">Recent Orders</h2>
                            <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="px-5 py-12 text-center">
                                <ShoppingBag className="w-10 h-10 text-text-muted mx-auto mb-3" />
                                <p className="text-sm text-text-muted">
                                    No orders yet. When customers buy your products, they&apos;ll show up here.
                                </p>
                                <Link
                                    href="/dashboard/products"
                                    className="inline-flex items-center gap-2 mt-4 rounded-xl bg-primary-500/15 px-4 py-2 text-sm font-medium text-primary-400 hover:bg-primary-500/25 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> Add products
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-text-muted border-b border-border-divider">
                                            <th className="px-5 py-3 font-medium">Order</th>
                                            <th className="px-5 py-3 font-medium">Date</th>
                                            <th className="px-5 py-3 font-medium">Items</th>
                                            <th className="px-5 py-3 font-medium">Total</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((o) => (
                                            <tr key={o._id} className="border-b border-border-divider last:border-b-0 hover:bg-bg-muted/40 transition-colors">
                                                <td className="px-5 py-3.5 font-mono text-xs text-primary-400">#{o.orderId}</td>
                                                <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">{formatDate(o.createdAt)}</td>
                                                <td className="px-5 py-3.5 text-text-secondary">{o.items?.length || 0}</td>
                                                <td className="px-5 py-3.5 font-semibold text-text-primary">${(Number(o.total) || 0).toFixed(2)}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-block text-[11px] font-medium px-2 py-1 rounded-full capitalize ${STATUS_STYLES[o.status] || "bg-bg-muted text-text-muted"}`}>
                                                        {o.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-6">
                        {/* Stores */}
                        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-text-primary">Your Stores</h2>
                                <Link href="/dashboard/store" className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                                    Manage
                                </Link>
                            </div>
                            {!data ? (
                                <p className="text-sm text-text-muted">Loading...</p>
                            ) : data.stores.length === 0 ? (
                                <p className="text-sm text-text-muted">
                                    No stores yet. Create your first store to start selling.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {data.stores.map((s) => (
                                        <div key={s._id} className="flex items-center justify-between gap-2 rounded-xl border border-border-divider px-3.5 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                                                <p className="text-xs text-text-muted truncate">
                                                    {s.category} · {data.productsByStore[s.uniqueStoreId] || 0} products
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                                    s.disabled
                                                        ? "bg-danger/15 text-danger"
                                                        : "bg-success/15 text-success"
                                                }`}
                                            >
                                                {s.disabled ? "Disabled" : "Active"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Low stock */}
                        <div className="rounded-2xl border border-border-default bg-bg-surface p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-text-primary">Low Stock</h2>
                                <Link href="/dashboard/products" className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                                    Manage
                                </Link>
                            </div>
                            {!data ? (
                                <p className="text-sm text-text-muted">Loading...</p>
                            ) : lowStock.length === 0 ? (
                                <p className="text-sm text-text-muted">All products have healthy stock levels. 🎉</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {lowStock.slice(0, 5).map((p) => (
                                        <div key={p._id} className="flex items-center justify-between gap-2">
                                            <p className="text-sm text-text-secondary truncate">{p.name}</p>
                                            <span className={`shrink-0 text-xs font-semibold ${p.quantity <= 0 ? "text-danger" : "text-warning"}`}>
                                                {p.quantity <= 0 ? "Out of stock" : `${p.quantity} left`}
                                            </span>
                                        </div>
                                    ))}
                                    {lowStock.length > 5 && (
                                        <p className="text-xs text-text-muted">+{lowStock.length - 5} more</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
