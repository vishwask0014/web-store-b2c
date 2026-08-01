"use client";

import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

interface SplashScreenProps {
  /** Wordmark to render, e.g. "LOOM" */
  brand: string;
  /** Small line under the wordmark, e.g. "finding your size" */
  tagline?: string;
  /** Accent color for the tagline (any valid CSS color) */
  accent?: string;
  /** Minimum time (ms) the splash stays visible, even if the app is ready sooner */
  minDuration?: number;
  /** Set true once your app has what it needs (auth check, initial fetch, fonts, etc) */
  ready?: boolean;
  /** Called after the exit transition finishes and the splash has unmounted */
  onFinish?: () => void;
}

export default function SplashScreen({
  brand,
  tagline,
  accent = "#3B82F6",
  minDuration = 1800,
  ready = true,
  onFinish,
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    if (ready && minTimeElapsed && !exiting) {
      setExiting(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onFinish?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ready, minTimeElapsed, exiting, onFinish]);

  if (!visible) return null;

  const letters = brand.split("").map((letter) => (letter === " " ? "\u00A0" : letter));

  return (
    <div
      className={`${styles.overlay} ${exiting ? styles.exiting : ""}`}
      style={{ "--accent": accent } as React.CSSProperties}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className={styles.word}>
        {letters.map((letter, i) => (
          <span
            key={i}
            className={styles.letter}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
      {tagline && <div className={styles.tagline}>{tagline}</div>}
    </div>
  );
}
