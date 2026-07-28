"use client";

import { auth, db } from "@/app/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
        const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        setUserType(docSnap.exists() ? docSnap.data().role || "customer" : "customer");
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