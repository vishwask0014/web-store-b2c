"use client";

import { create } from "zustand";
import useAuthStore from "./authStore";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      const res = await fetch("/api/notifications?limit=50", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        set({
          notifications: data.notifications || [],
          unreadCount: data.unreadCount || 0,
          loading: false,
        });
      }
    } catch {
      // network error — keep current state
    }
  },

  markRead: async (id) => {
    const current = get().notifications;
    const target = current.find((n) => n._id === id);
    if (!target || target.read) return;

    set({
      notifications: current.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });

    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch {
      // keep optimistic state
    }
  },

  markAllRead: async () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
    try {
      await fetch("/api/notifications/read-all", { method: "PUT" });
    } catch {
      // keep optimistic state
    }
  },
}));

let initialized = false;

export function initNotifications() {
  if (initialized) return;
  initialized = true;

  useAuthStore.subscribe((state, prev) => {
    if (state.user?.uid === prev.user?.uid) return;
    if (state.user?.uid) {
      useNotificationStore.getState().fetchNotifications();
    } else {
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    }
  });
}
