"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { RANGE_DAYS, RANGE_LABELS, buildRevenueSeries, formatCompact } from "@/data/dashboard";
import SectionHeader from "./SectionHeader";

const SERIES = [
  { key: "revenue", label: "Revenue", color: "#3B82F6" },
  { key: "orders", label: "Orders", color: "#8B5CF6" },
  { key: "profit", label: "Profit", color: "#22C55E" },
];

export default function RevenueChart({ orders }) {
  const [range, setRange] = useState("30");
  const series = buildRevenueSeries(orders, RANGE_DAYS[range]);

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeader title="Revenue Overview" subtitle="Revenue, orders and estimated profit" />
        <div className="flex rounded-full border border-white/5 bg-zinc-950 p-1">
          {(Object.keys(RANGE_LABELS)).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                range === key ? "bg-blue-500 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`rev-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717A", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={32}
            />
            <YAxis
              tick={{ fill: "#71717A", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => formatCompact(v)}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                background: "#18181B",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#A1A1AA", marginBottom: 4 }}
              formatter={(value, name) => {
                const meta = SERIES.find((s) => s.key === name);
                const label = meta?.label || name;
                return [name === "orders" ? value.toFixed(0) : formatCompact(value), label];
              }}
            />
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#rev-${s.key})`}
                animationDuration={700}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
