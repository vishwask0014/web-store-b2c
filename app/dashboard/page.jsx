"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../providers/AuthProvider";
import DashboardLayout from "../components/common/dashboardLayout";

export default function DashboardPage() {
    const router = useRouter();
    const { user, userType, loading } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (!loading && userType === "customer") {
            router.replace("/shop");
        }
    }, [userType, loading, router]);

    useEffect(() => {
        if (!user?.uid || userType === "customer") return;
        const load = async () => {
            try {
                const stores = await fetch(`/api/stores?ownerId=${user.uid}`).then((r) => r.json());
                let productCount = 0;
                await Promise.all(
                    stores.map(async (s) => {
                        try {
                            const products = await fetch(`/api/stores/${s.uniqueStoreId}/products`).then((r) => r.json());
                            productCount += Array.isArray(products) ? products.length : 0;
                        } catch {
                            // skip
                        }
                    })
                );
                const orders = await fetch(`/api/orders?sellerId=${user.uid}`).then((r) => r.json());
                setStats({
                    stores: (stores || []).length,
                    products: productCount,
                    orders: Array.isArray(orders) ? orders.length : 0,
                });
            } catch {
                // keep null
            }
        };
        load();
    }, [user?.uid, userType]);

    const statCards = stats
        ? [
            { label: "Total Products", value: String(stats.products), color: "bg-primary-500", href: "/dashboard/products" },
            { label: "Active Stores", value: String(stats.stores), color: "bg-success", href: "/dashboard/store" },
            { label: "Orders", value: String(stats.orders), color: "bg-warning", href: "/dashboard/orders" },
        ]
        : [
            { label: "Total Products", value: "0", color: "bg-primary-500", href: "/dashboard/products" },
            { label: "Active Stores", value: "0", color: "bg-success", href: "/dashboard/store" },
            { label: "Orders", value: "0", color: "bg-warning", href: "/dashboard/orders" },
        ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
                    <p className="text-sm text-text-muted mt-1">Overview of your store</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statCards.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="rounded-2xl border border-border-default bg-bg-surface p-5 flex items-center gap-4 hover:border-primary-500/50 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {stat.value}
                            </div>
                            <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="rounded-2xl border border-border-default bg-bg-surface p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Recent Orders</h2>
                    {stats?.orders ? (
                        <Link href="/dashboard/orders" className="text-sm text-primary-400 hover:text-primary-500 font-medium">
                            View all {stats.orders} order{stats.orders > 1 ? "s" : ""} &rarr;
                        </Link>
                    ) : (
                        <p className="text-sm text-text-muted">
                            No orders yet. When customers buy your products, they&apos;ll show up here.
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}