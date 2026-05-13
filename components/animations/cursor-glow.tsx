"use client";

import { useEffect, useRef } from "react";

/**
 * A soft radial glow that follows the mouse cursor,
 * creating an ethereal aurora-like atmosphere.
 * Disabled on touch devices and when reduced motion is preferred.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -9999, y: -9999 });
  const targetRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Disable on touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Disable if reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    // Show glow only when mouse enters viewport
    let isActive = false;
    let inactivityTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      isActive = true;

      // Fade in on first interaction
      if (glow.style.opacity === "0") {
        glow.style.opacity = "1";
      }

      // Reset inactivity timer
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      inactivityTimeout = setTimeout(() => {
        isActive = false;
        if (glow) glow.style.opacity = "0";
      }, 3000);
    };

    const handleMouseLeave = () => {
      isActive = false;
      glow.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isActive = true;
      glow.style.opacity = "1";
    };

    // Smooth follow animation
    const animate = () => {
      if (isActive) {
        // Lerp toward target for smooth, organic movement
        const ease = 0.08;
        posRef.current.x += (targetRef.current.x - posRef.current.x) * ease;
        posRef.current.y += (targetRef.current.y - posRef.current.y) * ease;

        glow.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(rafRef.current);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[2] transition-opacity duration-700"
      style={{
        opacity: 0,
        background: `radial-gradient(600px circle at 50% 50%, rgba(212, 175, 55, 0.15), rgba(91, 62, 140, 0.08), transparent 60%)`,
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
