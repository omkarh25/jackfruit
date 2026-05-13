"use client";

import { useMemo } from "react";

interface FloatingOrbsProps {
  count?: number;
  className?: string;
}

/**
 * Deterministic seeded random for consistent SSR/hydration.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Floating decorative orbs for premium background effect.
 * Uses deterministic values so server and client render identically.
 */
export function FloatingOrbs({ count = 5, className = "" }: FloatingOrbsProps) {
  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: Math.round(seededRandom(i * 7 + 1) * 300 + 150),
        left: Math.round(seededRandom(i * 13 + 2) * 100 * 10) / 10,
        top: Math.round(seededRandom(i * 17 + 3) * 100 * 10) / 10,
        duration: Math.round((seededRandom(i * 19 + 4) * 4 + 6) * 10) / 10,
        delay: Math.round(seededRandom(i * 23 + 5) * 2 * 10) / 10,
        type: i % 2 === 0 ? "purple" : "gold",
      })),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`orb orb-${orb.type} animate-float-slow`}
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
