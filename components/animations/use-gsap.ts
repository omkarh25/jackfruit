"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Check if user prefers reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}

/**
 * Hook to create a GSAP context that auto-cleans up on unmount.
 * Usage:
 *   const scopeRef = useRef<HTMLDivElement>(null);
 *   useEffect(() => {
 *     if (!scopeRef.current) return;
 *     const ctx = gsap.context(() => {
 *       gsap.to(...);
 *     }, scopeRef.current);
 *     return () => ctx.revert();
 *   }, []);
 */
export function useGsapContext<T extends HTMLElement>(
  scopeRef: React.RefObject<T | null>
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!scopeRef.current) return;

    ctxRef.current = gsap.context(() => {}, scopeRef.current);

    return () => {
      ctxRef.current?.revert();
    };
  }, [scopeRef]);

  const contextSafe = (fn: () => void) => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.add(fn);
      } else {
        fn();
      }
    };
  };

  return { contextSafe, ctx: ctxRef };
}
