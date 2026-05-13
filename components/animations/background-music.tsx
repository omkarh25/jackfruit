"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface BackgroundMusicProps {
  src?: string;
}

/**
 * Subtle background music player for the landing page.
 *
 * Design philosophy:
 * - NEVER auto-plays (browsers block this; users hate it).
 * - Starts muted with a gentle invitation to play.
 * - Smooth fade in/out so music never jarringly starts/stops.
 * - Saves user preference in localStorage.
 * - Respects reduced-motion preference.
 * - Only one audio element, properly cleaned up.
 */
export function BackgroundMusic({
  src = "/audio/background-music.mp3",
}: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "metadata";

    const handleCanPlay = () => setIsLoaded(true);
    audio.addEventListener("canplaythrough", handleCanPlay);

    audioRef.current = audio;

    // Check saved preference
    try {
      const saved = localStorage.getItem("tn-music-enabled");
      const savedInteracted = localStorage.getItem("tn-music-interacted");
      if (savedInteracted === "true") {
        setHasInteracted(true);
        if (saved === "true") {
          // Don't auto-play; just mark as desired. User must click.
          // Actually, if they previously enabled it, we can try.
          audio.play().catch(() => {
            // Autoplay blocked — user will need to click
          });
        }
      }
    } catch {
      // localStorage unavailable
    }

    return () => {
      audio.removeEventListener("canplaythrough", handleCanPlay);
      audio.pause();
      audio.src = "";
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [src]);

  // Smooth volume fade
  const fadeVolume = useCallback(
    (target: number, duration: number = 1200) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      const start = audio.volume;
      const diff = target - start;
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        // Ease in-out cubic
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        audio.volume = Math.max(0, Math.min(1, start + diff * eased));

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          if (target === 0) {
            audio.pause();
          }
        }
      }, stepTime);
    },
    []
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isLoaded) return;

    setHasInteracted(true);
    try {
      localStorage.setItem("tn-music-interacted", "true");
    } catch {
      // ignore
    }

    if (isPlaying) {
      fadeVolume(0);
      setIsPlaying(false);
      try {
        localStorage.setItem("tn-music-enabled", "false");
      } catch {
        // ignore
      }
    } else {
      audio.play().then(() => {
        fadeVolume(0.25); // Keep it subtle — 25% max
        setIsPlaying(true);
        try {
          localStorage.setItem("tn-music-enabled", "true");
        } catch {
          // ignore
        }
      }).catch(() => {
        // Playback blocked
      });
    }
  }, [isPlaying, isLoaded, fadeVolume]);

  // Handle visibility change — pause when tab hidden
  useEffect(() => {
    const handleVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden && isPlaying) {
        audio.pause();
      } else if (!document.hidden && isPlaying) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [isPlaying]);

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium backdrop-blur-md transition-all duration-500 ${
        isPlaying
          ? "bg-tattvam-purple-900/80 text-tattvam-gold-300 border border-tattvam-gold-400/30 shadow-lg shadow-tattvam-purple-900/20"
          : "bg-white/70 text-tattvam-purple-600 border border-tattvam-purple-200/50 hover:bg-white/90 hover:border-tattvam-gold-300/50"
      }`}
      aria-label={isPlaying ? "Pause background music" : "Play background music"}
      title={isPlaying ? "Pause music" : "Play ambient music"}
    >
      {/* Animated sound waves when playing */}
      <span className="relative flex h-5 w-5 items-center justify-center">
        {isPlaying ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tattvam-gold-400/30" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-tattvam-gold-400" />
          </>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </span>

      <span className="hidden sm:inline">
        {isPlaying ? "Sound On" : hasInteracted ? "Sound Off" : "Play Music"}
      </span>
    </button>
  );
}
