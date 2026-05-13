"use client";

import { useEffect, useRef } from "react";

interface AuroraBackgroundProps {
  className?: string;
  variant?: "light" | "dark";
}

/**
 * Animated aurora gradient background that slowly shifts colors.
 * Creates a living, breathing atmosphere behind sections.
 */
export function AuroraBackground({
  className = "",
  variant = "light",
}: AuroraBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const el = ref.current;
    if (!el) return;

    // Animate the gradient position for a shifting aurora effect
    const keyframes = [
      { backgroundPosition: "0% 50%" },
      { backgroundPosition: "100% 50%" },
      { backgroundPosition: "0% 50%" },
    ];

    const animation = el.animate(keyframes, {
      duration: 15000,
      iterations: Infinity,
      easing: "ease-in-out",
    });

    return () => animation.cancel();
  }, []);

  const gradient =
    variant === "light"
      ? `radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
         radial-gradient(ellipse at 80% 70%, rgba(91, 62, 140, 0.06) 0%, transparent 50%),
         radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.04) 0%, transparent 60%)`
      : `radial-gradient(ellipse at 20% 30%, rgba(212, 175, 55, 0.12) 0%, transparent 50%),
         radial-gradient(ellipse at 80% 70%, rgba(149, 120, 201, 0.08) 0%, transparent 50%),
         radial-gradient(ellipse at 50% 50%, rgba(212, 175, 55, 0.06) 0%, transparent 60%)`;

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background: gradient,
        backgroundSize: "200% 200%",
      }}
      aria-hidden="true"
    />
  );
}
