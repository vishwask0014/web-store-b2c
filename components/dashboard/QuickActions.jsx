"use client";

import { motion } from "framer-motion";
import { Package, Store, Percent, FileDown, Megaphone } from "lucide-react";
import Link from "next/link";

export default function QuickActions({ isAdmin }) {
  const actions = [
    { label: "Add Product", href: "/dashboard/products", icon: Package, accent: "#3B82F6" },
    { label: "Add Store", href: "/dashboard/store", icon: Store, accent: "#8B5CF6" },
    ...(isAdmin ? [{ label: "Create Coupon", href: "/dashboard/admin/settings", icon: Percent, accent: "#F59E0B" }] : []),
    { label: "Manage Orders", href: "/dashboard/orders", icon: FileDown, accent: "#22C55E" },
    ...(isAdmin ? [{ label: "Send Notification", href: "/dashboard/admin/users", icon: Megaphone, accent: "#EF4444" }] : []),
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <motion.div key={a.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={a.href}
              className="flex items-center gap-2 rounded-full border border-white/5 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-300 shadow-lg shadow-black/20 transition-colors hover:border-white/10 hover:text-white"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ backgroundColor: `${a.accent}26`, color: a.accent }}
              >
                <Icon className="h-3 w-3" />
              </span>
              {a.label}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
