"use client";

import { motion } from "framer-motion";
import { Wallet, Percent, Hourglass, ArrowDownToLine } from "lucide-react";
import { formatCurrency } from "@/data/dashboard";
import SectionHeader from "./SectionHeader";

const CARDS = [
  { key: "revenue", label: "Total Revenue", icon: Wallet, color: "#3B82F6" },
  { key: "commission", label: "Commission", icon: Percent, color: "#8B5CF6" },
  { key: "pendingPayout", label: "Pending Payout", icon: Hourglass, color: "#F59E0B" },
  { key: "withdrawals", label: "Withdrawals", icon: ArrowDownToLine, color: "#22C55E" },
];

export default function WalletSummary({ wallet }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <SectionHeader title="Wallet" subtitle="Earnings at a glance" />
      <div className="grid grid-cols-2 gap-3">
        {CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-white/5 bg-zinc-950 p-4"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}1f`, color: c.color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-lg font-bold text-zinc-100 tabular-nums">{formatCurrency(wallet[c.key])}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{c.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
