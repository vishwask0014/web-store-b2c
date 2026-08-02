"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Store as StoreIcon, Package, Clock, RotateCcw, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/data/dashboard";

const ROWS = [
  { key: "todayRevenue", label: "Today's Revenue", icon: TrendingUp, format: "currency" },
  { key: "topStore", label: "Top Performing Store", icon: StoreIcon },
  { key: "bestProduct", label: "Best Selling Product", icon: Package },
  { key: "pendingOrders", label: "Pending Orders", icon: Clock },
  { key: "pendingRefunds", label: "Pending Refunds", icon: RotateCcw },
  { key: "lowStock", label: "Low Stock Products", icon: AlertTriangle },
];

export default function AIInsights({ insights }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-zinc-900 p-5 shadow-lg shadow-violet-500/5 md:p-6">
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
          <Sparkles className="h-5 w-5" />
          <motion.span
            className="absolute inset-0 rounded-2xl bg-violet-500/40 blur-md"
            animate={{ opacity: [0.15, 0.45, 0.15], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-100">AI Insights</h2>
          <p className="text-xs text-zinc-500">Live signals from your data</p>
        </div>
      </div>

      <div className="relative mt-5 flex flex-col gap-2.5">
        {ROWS.map((row, i) => {
          const Icon = row.icon;
          const raw = insights[row.key];
          const value =
            row.format === "currency" ? formatCurrency(Number(raw) || 0) : raw || 0;
          return (
            <motion.div
              key={row.key}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-zinc-950 px-3.5 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm text-zinc-500">
                <Icon className="h-4 w-4 shrink-0 text-violet-400/70" />
                <span className="truncate">{row.label}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold text-zinc-100">{value}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
