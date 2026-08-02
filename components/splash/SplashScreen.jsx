"use client";

import { useEffect, useState } from "react";
import styles from "./SplashScreen.module.css";

export default function SplashScreen({
  brand,
  tagline,
  accent = "#3B82F6",
  minDuration = 1800,
  ready = true,
  onFinish,
}) {
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
      style={{ "--accent": accent }}
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
