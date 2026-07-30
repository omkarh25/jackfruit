"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getVisibleServices, type ServiceRecord } from "@/lib/db/services";

/**
 * Secondary navigation bar rendered directly below the site header.
 * Always visible (no scroll dependency) with quick links to Services
 * (dropdown of all visible services), Project Ananda, and Courses.
 */
export function QuickNav() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getVisibleServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  // Close dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const linkClass =
    "whitespace-nowrap rounded-full bg-tattvam-purple-50 px-5 py-2.5 text-sm font-medium text-tattvam-purple-700 transition hover:bg-tattvam-purple-100 hover:text-tattvam-purple-900";

  return (
    <div className="border-b border-tattvam-purple-100 bg-white/90 backdrop-blur-md">
      <div
        ref={containerRef}
        className="relative mx-auto flex max-w-7xl items-center justify-start gap-3 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-6"
      >
        {/* Services dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`${linkClass} inline-flex items-center gap-1.5`}
            aria-expanded={open}
            aria-haspopup="true"
          >
            Services
            <span
              className={`inline-block text-xs transition-transform ${open ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-tattvam-purple-100 bg-white p-2 shadow-xl">
              <Link
                href="/services"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-tattvam-purple-800 transition hover:bg-tattvam-purple-50"
              >
                All Services
              </Link>
              <Link
                href="/booking"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-2.5 text-sm text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
              >
                1:1 Consultation
              </Link>
              {services.length > 0 && (
                <div className="my-1 border-t border-tattvam-purple-100" />
              )}
              {services.map((s) => (
                <Link
                  key={s.id}
                  href={`/services/${s.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-tattvam-purple-600 transition hover:bg-tattvam-purple-50"
                >
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/services/project-ananda" className={linkClass}>
          Project Ananda
        </Link>
        <Link href="/courses" className={linkClass}>
          Courses
        </Link>
        <Link
          href="/booking"
          className="whitespace-nowrap rounded-full bg-tattvam-gold-100 px-5 py-2.5 text-sm font-medium text-tattvam-gold-800 transition hover:bg-tattvam-gold-200"
        >
          Book 1:1 Consultation
        </Link>
      </div>
    </div>
  );
}
