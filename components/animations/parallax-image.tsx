"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./use-gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxImageProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative = slower than scroll (creates depth)
  scrub?: boolean | number;
}

/**
 * Wraps an image or element with GSAP scrub-driven parallax.
 * speed: -0.5 = moves at half scroll speed (appears further back)
 * speed: 0.3 = moves faster than scroll (appears closer)
 */
export function ParallaxImage({
  children,
  className = "",
  speed = -0.2,
  scrub = 0.5,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReduced) return;

    const el = ref.current;
    const yPercent = speed * 100;

    const tween = gsap.fromTo(
      el,
      { yPercent: -yPercent },
      {
        yPercent: yPercent,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [prefersReduced, speed, scrub]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
  layers?: Array<{
    selector: string;
    speed: number;
  }>;
}

/**
 * Multi-layer parallax container.
 * Each child matching a selector moves at a different speed.
 */
export function ParallaxContainer({
  children,
  className = "",
  layers = [],
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || prefersReduced || layers.length === 0) return;

    const tweens: gsap.core.Tween[] = [];

    layers.forEach(({ selector, speed }) => {
      const el = ref.current!.querySelector(selector);
      if (!el) return;

      const yPercent = speed * 100;
      const tween = gsap.fromTo(
        el,
        { yPercent: -yPercent },
        {
          yPercent: yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        }
      );
      tweens.push(tween);
    });

    return () => {
      tweens.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
    };
  }, [prefersReduced, layers]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
