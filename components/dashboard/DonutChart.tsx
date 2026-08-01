"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartSlice } from "@/types/dashboard";
import SectionHeader from "./SectionHeader";

interface DonutProps {
  title: string;
  subtitle: string;
  data: ChartSlice[];
}

export function DonutChart({ title, subtitle, data }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <SectionHeader title={title} subtitle={subtitle} />
      {total === 0 ? (
        <p className="text-sm text-zinc-500">No data yet.</p>
      ) : (
        <>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    background: "#18181B",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#A1A1AA" }}
                />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={3}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data.map((d) => (
                    <Cell key={d.label} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-zinc-100 tabular-nums">{total}</p>
              <p className="text-xs text-zinc-500">Total</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.map((d) => (
              <div key={d.label} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate text-zinc-400">{d.label}</span>
                <span className="ml-auto font-medium text-zinc-200 tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
