"use client";

import Link from "next/link";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";

export default function InnerChildHealingPage() {
  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center px-6 pt-20">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal delay={100}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
              Inner Child <span className="gradient-text">Healing</span>
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              A gentle, transformative journey to meet, nurture, and heal the younger version of you — so you can live with more freedom, love, and authenticity.
            </p>
          </Reveal>

          <Reveal delay={500}>
            <div className="mt-10">
              <Link href="/booking" className="btn-primary inline-flex">
                Book a Session
                <span className="ml-2">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Placeholder Content */}
      <section className="section-padding bg-gradient-to-b from-white to-tattvam-purple-50">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
              Coming Soon
            </span>
            <h2 className="mt-6 font-serif text-3xl font-bold text-tattvam-purple-900 md:text-4xl">
              Detailed Inner Child Healing Overview
            </h2>
            <p className="mt-4 text-tattvam-purple-600/70">
              {/* TODO: Replace with final content from inner_child_healing.md */}
              This page will include the full service description, benefits, session flow, pricing, and FAQs once the content document is provided.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-tattvam-purple-100 bg-tattvam-purple-50 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm text-tattvam-purple-500">
            © 2026 Tattvam Niramaya. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
