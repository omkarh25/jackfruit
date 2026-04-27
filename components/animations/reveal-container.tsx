"use client";

import { useScrollReveal } from "./use-scroll-reveal";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
  threshold?: number;
}

/**
 * Wrapper component that animates its children into view on scroll.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.1
}: RevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold });

  const baseClasses = {
    up: "reveal",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale"
  };

  const delayClass = delay > 0 ? `delay-${delay}` : "";

  return (
    <div
      ref={ref}
      className={`${baseClasses[direction]} ${delayClass} ${isVisible ? "active" : ""} ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}