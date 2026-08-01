"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/data/dashboard";

interface StatCardProps {
  title: string;
  value: number;
  growth: number;
  icon: LucideIcon;
  accent: string;
  spark: number[];
  href?: string;
  format?: "currency" | "number";
}

function useCountUp(target: number, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration]);

  return display;
}

export default function StatCard({ title, value, growth, icon: Icon, accent, spark, href, format = "currency" }: StatCardProps) {
  const count = useCountUp(value);
  const up = growth >= 0;
  const rendered =
    format === "currency"
      ? formatCurrency(count)
      : Math.round(count).toLocaleString();

  const inner = (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10">
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          }`}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(growth).toFixed(1)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-zinc-100 tabular-nums">{rendered}</p>
        <p className="text-sm text-zinc-500 mt-0.5">{title}</p>
      </div>
      <div className="h-10 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={spark.map((v, i) => ({ i, v }))} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={accent}
              strokeWidth={2}
              fill={`url(#spark-${title})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Link href={href} className="block">
          {inner}
        </Link>
      </motion.div>
    );
  }
  return <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>{inner}</motion.div>;
}
