"use client";

import React from "react";

type AuraColor = "gold" | "purple" | "mixed";
type AuraIntensity = "subtle" | "medium" | "strong";
type AuraSpeed = "slow" | "medium" | "fast";

interface PulsatingAuraProps {
  children: React.ReactNode;
  color?: AuraColor;
  intensity?: AuraIntensity;
  speed?: AuraSpeed;
  className?: string;
  enabled?: boolean;
  as?: "span" | "div";
}

const intensityMap: Record<AuraIntensity, Record<AuraColor, string>> = {
  subtle: {
    gold: "0 0 15px rgba(212,175,55,0.15), 0 0 30px rgba(212,175,55,0.08)",
    purple: "0 0 15px rgba(91,62,140,0.15), 0 0 30px rgba(91,62,140,0.08)",
    mixed: "0 0 15px rgba(212,175,55,0.12), 0 0 30px rgba(91,62,140,0.1)",
  },
  medium: {
    gold: "0 0 25px rgba(212,175,55,0.25), 0 0 50px rgba(212,175,55,0.12), 0 0 75px rgba(212,175,55,0.06)",
    purple: "0 0 25px rgba(91,62,140,0.25), 0 0 50px rgba(91,62,140,0.12), 0 0 75px rgba(91,62,140,0.06)",
    mixed: "0 0 25px rgba(212,175,55,0.18), 0 0 50px rgba(91,62,140,0.15), 0 0 75px rgba(212,175,55,0.06)",
  },
  strong: {
    gold: "0 0 35px rgba(212,175,55,0.4), 0 0 70px rgba(212,175,55,0.2), 0 0 100px rgba(212,175,55,0.1)",
    purple: "0 0 35px rgba(91,62,140,0.4), 0 0 70px rgba(91,62,140,0.2), 0 0 100px rgba(91,62,140,0.1)",
    mixed: "0 0 35px rgba(212,175,55,0.3), 0 0 70px rgba(91,62,140,0.2), 0 0 100px rgba(212,175,55,0.08)",
  },
};

const speedClassMap: Record<AuraSpeed, string> = {
  slow: "aura-pulse-slow",
  medium: "aura-pulse-medium",
  fast: "aura-pulse-fast",
};

/**
 * Wraps children with a soft pulsating glow aura.
 * Uses CSS keyframes for GPU-friendly performance.
 */
export function PulsatingAura({
  children,
  color = "gold",
  intensity = "medium",
  speed = "slow",
  className = "",
  enabled = true,
  as: Tag = "span",
}: PulsatingAuraProps) {
  if (!enabled) return <>{children}</>;

  const shadowValue = intensityMap[intensity][color];
  const speedClass = speedClassMap[speed];

  return (
    <Tag
      className={`${speedClass} ${className}`}
      style={
        {
          "--aura-shadow": shadowValue,
          "--aura-shadow-dim": shadowValue
            .replace(/\d+px/g, (m) => `${Math.round(parseInt(m) * 0.6)}px`)
            .replace(/[\d.]+\)/g, (m) =>
              m.replace(/[\d.]+/, (n) =>
                String(Math.max(0.02, parseFloat(n) * 0.5))
              )
            ),
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  );
}
