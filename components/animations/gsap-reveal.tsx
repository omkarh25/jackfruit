"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./use-gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type RevealDirection = "up" | "left" | "right" | "scale" | "fade";

interface GSAPRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
  distance?: number;
  scrub?: boolean | number;
  stagger?: number;
  once?: boolean;
  threshold?: string;
}

const directionMap: Record<RevealDirection, gsap.TweenVars> = {
  up: { y: 40, opacity: 0 },
  left: { x: -60, opacity: 0 },
  right: { x: 60, opacity: 0 },
  scale: { scale: 0.9, opacity: 0 },
  fade: { opacity: 0 },
};

/**
 * GSAP ScrollTrigger-powered reveal wrapper.
 * Drop-in replacement for the CSS IntersectionObserver Reveal component.
 */
export function GSAPReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.8,
  distance,
  scrub = false,
  stagger,
  once = true,
  threshold = "top 85%",
}: GSAPRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current) return;
    if (prefersReduced) {
      gsap.set(ref.current, { opacity: 1, x: 0, y: 0, scale: 1 });
      return;
    }

    const el = ref.current;
    const fromVars: gsap.TweenVars = { ...directionMap[direction] };

    if (distance !== undefined) {
      if (direction === "up") fromVars.y = distance;
      if (direction === "left") fromVars.x = -distance;
      if (direction === "right") fromVars.x = distance;
    }

    gsap.set(el, fromVars);

    const tween = gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      duration,
      delay: delay / 1000,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: threshold,
        toggleActions: once ? "play none none none" : "play reverse play reverse",
        scrub: scrub === false ? false : scrub,
      },
      stagger: stagger ? stagger : undefined,
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [prefersReduced, direction, duration, delay, distance, scrub, once, threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
