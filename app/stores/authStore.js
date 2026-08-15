"use client";

import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  userType: null,
  loading: true,

  setUser: (user) => set({ user, userType: user?.role || null }),
  setLoading: (loading) => set({ loading }),

  login: async (idToken, name) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Authentication failed");
    set({ user: data.user, userType: data.user.role, loading: false });
    return data.user;
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // cookie may already be gone; still clear local state
    }
    set({ user: null, userType: null, loading: false });
  },

  refreshUser: async () => {
    try {
      console.log('[Auth] Refreshing user session...');
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      console.log('[Auth] /api/auth/me response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[Auth] User restored from session:', data.user?.email || data.user?.uid);
        set({ user: data.user, userType: data.user.role, loading: false });
        return data.user;
      }
      console.log('[Auth] No active session found');
      set({ user: null, userType: null, loading: false });
      return null;
    } catch (error) {
      console.error('[Auth] Error refreshing user:', error);
      set({ user: null, userType: null, loading: false });
      return null;
    }
  },
}));

let initialized = false;

export function initAuth() {
  if (initialized) {
    console.log('[Auth] Already initialized, skipping');
    return;
  }
  initialized = true;
  console.log('[Auth] Initializing authentication...');
  useAuthStore.getState().refreshUser();
}

export default useAuthStore;
