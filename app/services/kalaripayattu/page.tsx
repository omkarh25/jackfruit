"use client";

import Link from "next/link";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { KALARI_PLANS } from "@/lib/kalari-pricing";

export default function KalaripayattuPage() {
  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center justify-center px-6 pt-20">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <Reveal delay={100}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
              Kalari <span className="gradient-text">Payattu</span>
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <h2 className="mt-6 font-serif text-2xl font-medium text-tattvam-purple-700 md:text-3xl">
              The ancient path to total well-being
            </h2>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              Build discipline, strength, awareness, and self-defense through the traditional martial and healing art of Kerala. Train online from anywhere or experience it in person at the Kalari.
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-gradient-to-r from-tattvam-gold-400/10 to-tattvam-purple-400/10 p-6">
              <p className="font-serif text-xl text-tattvam-purple-800">
                Discipline. Strength. Awareness.
              </p>
            </div>
          </Reveal>

          <Reveal delay={900}>
            <div className="mt-10">
              <Link
                href="#kalari-paths"
                className="btn-primary inline-flex"
              >
                View Training Options
                <span className="ml-2">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About */}
      <section className="section-padding bg-gradient-to-b from-white to-tattvam-purple-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                Our Training
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                About <span className="gradient-text">Kalari Payattu</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-lg leading-relaxed text-tattvam-purple-700">
                Kalari Payattu is a complete movement and awareness practice from Kerala. It develops strength, flexibility, agility, and self-defense through traditional movements, breathing, and focused training.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-tattvam-purple-600/80">
                Choose online training for flexibility, or train offline at the Kalari for personal correction and immersive practice.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Choose Your Path */}
      <section id="kalari-paths" className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                Training Options
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                Choose Your <span className="text-tattvam-gold-400">Path</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2">
            {Object.entries(KALARI_PLANS).map(([mode, plan], index) => (
              <Reveal key={mode} delay={100 + index * 100}>
                <div className="glass-card-dark flex h-full flex-col rounded-3xl p-8">
                  <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                    {plan.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-tattvam-purple-300">
                    {plan.subtitle}
                  </p>
                  <p className="mt-4 text-purple-100/80">
                    {plan.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-purple-100/80">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 text-tattvam-gold-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-xl bg-tattvam-purple-800/50 p-4">
                    <p className="text-sm text-tattvam-purple-200">
                      <span className="text-tattvam-gold-400">Focus:</span> {plan.focus}
                    </p>
                  </div>
                  <div className="mt-auto pt-8">
                    <Link
                      href="/services/kalaripayattu/pricing"
                      className="btn-secondary block w-full text-center"
                    >
                      View Plans
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
