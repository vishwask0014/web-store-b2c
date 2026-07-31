"use client";

import { create } from "zustand";
import useAuthStore from "./authStore";

export const useCartStore = create((set, get) => ({
  items: [],
  loading: false,
  setItems: (items) => set({ items }),
  fetchCart: async (userId) => {
    if (!userId) {
      set({ items: [] });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      const data = await res.json();
      set({ items: data.items || [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ loading: false });
    }
  },
  addItem: async (userId, item) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...item }),
    });
    const data = await res.json();
    if (res.ok) set({ items: data.items || [] });
    return { ok: res.ok, error: data.error };
  },
  updateQuantity: async (userId, productId, serviceId, quantity) => {
    const res = await fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, serviceId: serviceId || "", quantity }),
    });
    const data = await res.json();
    if (res.ok) set({ items: data.items || [] });
  },
  removeItem: async (userId, productId, serviceId) => {
    const res = await fetch(
      `/api/cart?userId=${userId}&productId=${productId}&serviceId=${serviceId || ""}`,
      { method: "DELETE" }
    );
    const data = await res.json();
    if (res.ok) set({ items: data.items || [] });
  },
  clearCart: () => set({ items: [] }),
}));

export function initCart() {
  useAuthStore.subscribe((state, prev) => {
    const currentUid = state.user?.uid;
    const prevUid = prev.user?.uid;
    if (currentUid === prevUid) return;
    if (currentUid) {
      useCartStore.getState().fetchCart(currentUid);
    } else {
      useCartStore.getState().clearCart();
    }
  });
}