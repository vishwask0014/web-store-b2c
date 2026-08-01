"use client";

import useAuthStore from "@/app/stores/authStore";
import SplashScreen from "./SplashScreen";

export default function SplashGate() {
  const loading = useAuthStore((s) => s.loading);

  return (
    <SplashScreen
      brand="B2C STORE"
      tagline="your marketplace"
      accent="#3B82F6"
      minDuration={1600}
      ready={!loading}
    />
  );
}
