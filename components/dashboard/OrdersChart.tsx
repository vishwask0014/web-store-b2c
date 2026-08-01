"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { buildOrderBreakdown } from "@/data/dashboard";
import type { OrderSummary } from "@/types/dashboard";
import SectionHeader from "./SectionHeader";

interface OrdersChartProps {
  orders: OrderSummary[];
}

export default function OrdersChart({ orders }: OrdersChartProps) {
  const data = buildOrderBreakdown(orders);

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <SectionHeader title="Orders" subtitle="Status distribution across all time" />
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={38}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#71717A", fontSize: 11 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#18181B",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                fontSize: 12,
              }}
              labelStyle={{ color: "#A1A1AA", marginBottom: 4 }}
              formatter={(value: number, name: string) => [value.toFixed(0), name === "value" ? "Orders" : name]}
            />
            <Bar dataKey="value" radius={[8, 8, 2, 2]}>
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.map((d) => (
          <div key={d.label} className="rounded-2xl border border-white/5 bg-zinc-950 px-3 py-2.5">
            <p className="text-lg font-bold text-zinc-100 tabular-nums">{d.value}</p>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
