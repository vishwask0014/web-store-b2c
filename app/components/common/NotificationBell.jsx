"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import { useNotificationStore, initNotifications } from "@/app/stores/notificationStore";

if (typeof window !== "undefined") {
  initNotifications();
}

const TYPE_ICONS = {
  order_new: "🛒",
  order_status: "📦",
  store_disabled: "⚠️",
  admin: "📢",
  system: "🔔",
};

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, fetchNotifications } =
    useNotificationStore();

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const handleItemClick = (notification) => {
    if (!notification.read) markRead(notification._id);
    setOpen(false);
    if (notification.link) router.push(notification.link);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border-default bg-bg-surface shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-divider">
              <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
                  <Inbox className="w-8 h-8 text-text-muted" />
                  <p className="text-sm text-text-muted">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleItemClick(n)}
                    className={`w-full text-left px-4 py-3 flex gap-3 border-b border-border-divider last:border-b-0 transition-colors ${
                      n.read ? "opacity-60 hover:opacity-90" : "bg-bg-muted/40 hover:bg-bg-muted"
                    }`}
                  >
                    <span className="text-lg leading-none mt-0.5">
                      {TYPE_ICONS[n.type] || TYPE_ICONS.system}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                        )}
                      </span>
                      <span className="block text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {n.message}
                      </span>
                      <span className="block text-[10px] text-text-muted mt-1">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
