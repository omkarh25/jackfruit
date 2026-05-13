"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * A floating Tattvam logo that travels down the viewport
 * as the user scrolls through the page.
 * Includes a gentle golden pulse and particle trail effect.
 */
export function TravelingLogo() {
  const logoRef = useRef<HTMLButtonElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!logoRef.current) return;

    // Main scroll-tracking animation
    const tween = gsap.to(logoRef.current, {
      y: "70vh",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    // Continuous pulse animation
    const pulse = gsap.to(logoRef.current, {
      scale: 1.08,
      duration: 1.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Trail particles fade animation
    const trailParticles = trailRef.current?.querySelectorAll(".trail-dot");
    if (trailParticles) {
      gsap.to(trailParticles, {
        opacity: 0,
        y: 20,
        duration: 1.2,
        stagger: {
          each: 0.3,
          repeat: -1,
          yoyo: true,
        },
        ease: "sine.inOut",
      });
    }

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      pulse.kill();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        ref={logoRef}
        onClick={scrollToTop}
        className="traveling-logo fixed z-40 hidden md:flex"
        style={{
          right: "24px",
          top: "15vh",
        }}
        aria-label="Back to top"
        title="Back to top"
      >
        <div className="relative h-11 w-11 rounded-full border-2 border-tattvam-gold-400/60 bg-tattvam-purple-900/80 p-1.5 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-110 hover:border-tattvam-gold-400">
          <Image
            src="/assets/homepage/founder.png"
            alt=""
            fill
            className="object-contain p-0.5"
          />
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-full border border-tattvam-gold-400/20" />
        </div>

        {/* Tooltip */}
        <div className="traveling-logo-tooltip absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-tattvam-purple-900/90 px-3 py-1 text-xs text-tattvam-gold-300 opacity-0 backdrop-blur-sm transition-opacity duration-300">
          Back to top
        </div>
      </button>

      {/* Particle trail behind logo */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed hidden md:block"
        style={{ right: "34px", top: "15vh", zIndex: 39 }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="trail-dot absolute h-1.5 w-1.5 rounded-full bg-tattvam-gold-400/40"
            style={{ top: `${-10 - i * 8}px` }}
          />
        ))}
      </div>
    </>
  );
}
