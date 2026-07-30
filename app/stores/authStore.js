"use client";

import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  userType: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserType: (userType) => set({ userType }),
  setLoading: (loading) => set({ loading }),
}));

let initialized = false;

export function initAuth() {
  if (initialized) return;
  initialized = true;

  onAuthStateChanged(auth, async (firebaseUser) => {
    const { setUser, setUserType, setLoading } = useAuthStore.getState();
    setUser(firebaseUser);
    if (firebaseUser) {
      try {
        const res = await fetch(`/api/users?uid=${firebaseUser.uid}`);
        if (res.ok) {
          const userData = await res.json();
          setUserType(userData.role || "customer");
        } else {
          const createRes = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
              email: firebaseUser.email,
              role: "customer",
            }),
          });
          const newUser = await createRes.json();
          setUserType(newUser.role || "customer");
        }
      } catch {
        setUserType("customer");
      }
    } else {
      setUserType(null);
    }
    setLoading(false);
  });
}

export default useAuthStore;