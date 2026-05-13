"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "./use-gsap";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TextRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  type?: "words" | "chars" | "lines";
  stagger?: number;
  duration?: number;
  y?: number;
  scrollTrigger?: boolean;
  scrollThreshold?: string;
  glowColor?: string;
}

/**
 * Text that reveals word-by-word or character-by-character with GSAP.
 * Perfect for hero headlines and section titles.
 */
export function TextReveal({
  text,
  className = "",
  as: Tag = "h1",
  type = "words",
  stagger = 0.08,
  duration = 0.6,
  y = 30,
  scrollTrigger = true,
  scrollThreshold = "top 80%",
  glowColor,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReduced) {
      containerRef.current.querySelectorAll(".reveal-item").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    const items = containerRef.current.querySelectorAll(".reveal-item");
    if (items.length === 0) return;

    gsap.set(items, { opacity: 0, y });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      ease: "power3.out",
      scrollTrigger: scrollTrigger
        ? {
            trigger: containerRef.current,
            start: scrollThreshold,
            toggleActions: "play none none none",
          }
        : undefined,
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [prefersReduced, type, stagger, duration, y, scrollTrigger, scrollThreshold, text]);

  const split = type === "chars" ? text.split("") : text.split(" ");
  const isWords = type === "words";

  return (
    <Tag ref={containerRef as any} className={className}>
      {split.map((item, i) => (
        <span
          key={i}
          className="reveal-item inline-block"
          style={{
            opacity: prefersReduced ? 1 : undefined,
            transform: prefersReduced ? "none" : undefined,
            textShadow: glowColor
              ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`
              : undefined,
          }}
        >
          {item}
          {isWords && i < split.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </Tag>
  );
}

interface SanskritRevealProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
}

/**
 * Special character-by-character reveal for Sanskrit text.
 * Each character gets a brief golden glow flash on reveal.
 */
export function SanskritReveal({
  text,
  className = "",
  as: Tag = "span",
}: SanskritRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!containerRef.current) return;
    if (prefersReduced) {
      containerRef.current.querySelectorAll(".sanskrit-char").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
      });
      return;
    }

    const chars = containerRef.current.querySelectorAll(".sanskrit-char");
    gsap.set(chars, { opacity: 0 });

    const tween = gsap.to(chars, {
      opacity: 1,
      duration: 0.4,
      stagger: 0.04,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none none",
      },
      onStart: function () {
        // Brief gold glow flash on each char as it reveals
        chars.forEach((char, i) => {
          gsap.fromTo(
            char,
            { textShadow: "0 0 20px rgba(212,175,55,0.8)" },
            {
              textShadow: "0 0 0px rgba(212,175,55,0)",
              duration: 0.8,
              delay: i * 0.04,
              ease: "power2.out",
            }
          );
        });
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [prefersReduced, text]);

  const chars = text.split("");

  return (
    <Tag ref={containerRef as any} className={className}>
      {chars.map((char, i) => (
        <span
          key={i}
          className="sanskrit-char inline-block"
          style={{ opacity: prefersReduced ? 1 : undefined }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
