"use client";

import { motion } from "framer-motion";
import { Store as StoreIcon } from "lucide-react";
import { formatCurrency } from "@/data/dashboard";
import type { SellerRow } from "@/types/dashboard";
import SectionHeader from "./SectionHeader";

interface SellerPerformanceProps {
  sellers: SellerRow[];
}

const MAX_REVENUE = 5000;

export default function SellerPerformance({ sellers }: SellerPerformanceProps) {
  if (sellers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-white/5 bg-zinc-900 p-8 text-center">
        <StoreIcon className="h-8 w-8 text-zinc-600" />
        <p className="text-sm text-zinc-500">No stores yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <SectionHeader title="Seller Performance" subtitle="Revenue by store" />
      <div className="flex flex-col gap-4">
        {sellers.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="truncate font-medium text-zinc-300">{s.name}</span>
              <span className="shrink-0 text-zinc-500">
                {s.orders} orders · {formatCurrency(s.revenue)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((s.revenue / MAX_REVENUE) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.15 + i * 0.08 }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-xs text-zinc-500">★ {s.rating.toFixed(1)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
