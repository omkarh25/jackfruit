"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  color: string;
}

/**
 * Canvas-based subtle energy particle system.
 * Golden and purple motes drift upward like energy dust.
 * Only renders on client to avoid hydration mismatches.
 */
export function EnergyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const scrollVelRef = useRef(0);
  const lastScrollRef = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Disable on touch devices
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    // Disable if reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Track scroll velocity
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      scrollVelRef.current = currentScroll - lastScrollRef.current;
      lastScrollRef.current = currentScroll;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize particles
    const colors = [
      "rgba(212, 175, 55, 0.4)",
      "rgba(91, 62, 140, 0.3)",
      "rgba(212, 175, 55, 0.25)",
    ];
    const particleCount = 45;
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      x: ((i * 37.3) % 1000) / 1000 * canvas.width,
      y: ((i * 53.7) % 1000) / 1000 * canvas.height,
      size: ((i * 17.1) % 100) / 100 * 2 + 1,
      speedY: ((i * 23.5) % 100) / 100 * 0.4 + 0.15,
      speedX: (((i * 31.2) % 100) / 100 - 0.5) * 0.2,
      opacity: ((i * 41.7) % 100) / 100 * 0.4 + 0.2,
      color: colors[i % colors.length],
    }));

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Render every 2nd frame for performance (~30fps)
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach((p) => {
          // Update position
          p.y -= p.speedY;
          p.x += p.speedX + scrollVelRef.current * 0.02;

          // Wrap around
          if (p.y < -10) {
            p.y = canvas.height + 10;
            p.x = ((p.x * 997) % canvas.width + canvas.width) % canvas.width;
          }
          if (p.x < -10) p.x = canvas.width + 10;
          if (p.x > canvas.width + 10) p.x = -10;

          // Draw
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fill();
        });

        ctx.globalAlpha = 1;
        // Decay scroll velocity
        scrollVelRef.current *= 0.9;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
