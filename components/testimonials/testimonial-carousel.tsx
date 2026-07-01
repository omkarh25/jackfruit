"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import type { TestimonialItem } from "@/lib/types";

interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
  autoPlayInterval?: number;
}

export function TestimonialCarousel({
  testimonials,
  autoPlayInterval: _autoPlayInterval = 6000, // kept for API compatibility
}: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto-play video testimonials when they scroll into view.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay may be blocked by browser policies; user can still press play.
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [current, testimonials]);

  // Auto-play removed for carousel slides — user navigates manually.

  if (testimonials.length === 0) {
    return (
      <p className="text-center text-tattvam-purple-400">
        No testimonials yet.
      </p>
    );
  }

  const item = testimonials[current];

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Card */}
      <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-white/5 p-8 backdrop-blur-sm md:p-12">
        {item.type === "text" && (
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-4 text-4xl text-tattvam-gold-400 opacity-50">
                &ldquo;
              </div>
              <p className="text-lg leading-relaxed text-purple-100/90 md:text-xl">
                {item.quote}
              </p>
            </div>
            <div className="mt-8 border-t border-tattvam-purple-600/30 pt-6">
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-tattvam-purple-300/70">{item.role}</p>
            </div>
          </div>
        )}

        {item.type === "image" && item.mediaUrl && (
          <div className="flex h-full flex-col items-center justify-between">
            <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={item.mediaUrl}
                alt={`Testimonial from ${item.name}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-tattvam-purple-300/70">{item.role}</p>
            </div>
          </div>
        )}

        {item.type === "video" && item.mediaUrl && (
          <div className="flex h-full flex-col items-center justify-between">
            <div className="mb-6 w-full">
              <video
                ref={videoRef}
                src={item.mediaUrl}
                controls
                muted
                playsInline
                className="mx-auto aspect-video w-full rounded-2xl"
                preload="metadata"
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-tattvam-purple-300/70">{item.role}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {testimonials.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 rounded-full bg-tattvam-purple-800/80 p-3 text-white shadow-lg transition hover:bg-tattvam-purple-700 md:-translate-x-6"
            aria-label="Previous testimonial"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-tattvam-purple-800/80 p-3 text-white shadow-lg transition hover:bg-tattvam-purple-700 md:translate-x-6"
            aria-label="Next testimonial"
          >
            ›
          </button>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === current
                    ? "w-8 bg-tattvam-gold-400"
                    : "w-2.5 bg-tattvam-purple-600 hover:bg-tattvam-purple-500"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
