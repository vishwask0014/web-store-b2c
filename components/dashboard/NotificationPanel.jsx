"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Bell, CheckCheck, Package, Store as StoreIcon, AlertTriangle, CreditCard, Star, Megaphone, ShoppingBag } from "lucide-react";
import { useNotificationStore } from "@/app/stores/notificationStore";
import SectionHeader from "./SectionHeader";

const TYPE_ICONS = {
  order_new: { icon: ShoppingBag, color: "#3B82F6" },
  order_status: { icon: Package, color: "#22C55E" },
  store_disabled: { icon: StoreIcon, color: "#EF4444" },
  admin: { icon: Megaphone, color: "#8B5CF6" },
  system: { icon: Bell, color: "#71717A" },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationPanel({ limit = 6 }) {
  const { notifications, unreadCount, fetchNotifications, markAllRead } = useNotificationStore();

  useEffect(() => {
    void Promise.resolve().then(fetchNotifications);
  }, [fetchNotifications]);

  const list = notifications.slice(0, limit);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-zinc-900 p-5 shadow-lg shadow-black/20 md:p-6">
      <SectionHeader
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        action={
          list.length > 0 ? (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-full border border-white/5 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-blue-500/30 hover:text-blue-400"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          ) : undefined
        }
      />
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Bell className="h-8 w-8 text-zinc-700" />
          <p className="text-sm text-zinc-500">You&apos;re all caught up.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((n, i) => {
            const meta = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            const Icon = meta.icon;
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-3 rounded-2xl border px-3.5 py-3 ${
                  n.read ? "border-white/5 bg-zinc-950" : "border-blue-500/20 bg-blue-500/[0.04]"
                }`}
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${meta.color}1f`, color: meta.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  {n.link ? (
                    <Link href={n.link} className="text-sm text-zinc-200 hover:text-blue-400">
                      {n.title}
                    </Link>
                  ) : (
                    <p className="text-sm text-zinc-200">{n.title}</p>
                  )}
                  {n.message && <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{n.message}</p>}
                  <p className="mt-1 text-[11px] text-zinc-600">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
