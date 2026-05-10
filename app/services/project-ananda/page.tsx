"use client";

import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";

const WHATSAPP_LINK = "https://wa.me/916363606088";

export default function ProjectAnandaPage() {
  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Section 1: Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center px-6 pt-20">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <Reveal delay={100}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
              Project <span className="gradient-text">Ananda</span>
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <h2 className="mt-6 font-serif text-2xl font-medium text-tattvam-purple-700 md:text-3xl">
              A space for Body–Mind–Emotion transformation
            </h2>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              A structured wellness journey designed to bring your Body, Mind, and Emotions into balance — through movement, healing, awareness, and guided growth.
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-gradient-to-r from-tattvam-gold-400/10 to-tattvam-purple-400/10 p-6">
              <p className="font-serif text-xl text-tattvam-purple-800">
                This is not a fitness studio.
              </p>
              <p className="mt-1 font-serif text-xl font-semibold text-tattvam-gold-600">
                This is a space for alignment.
              </p>
            </div>
          </Reveal>

          <Reveal delay={900}>
            <div className="mt-10">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                Enquire Now
                <span className="ml-2">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 2: About */}
      <section className="section-padding bg-gradient-to-b from-white to-tattvam-purple-50">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                Our Signature Program
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                About <span className="gradient-text">Project Ananda</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-lg leading-relaxed text-tattvam-purple-700">
                Project Ananda is Tattvam Niramaya&apos;s signature transformation program, built for people seeking balance, energy, emotional clarity, and purpose.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-tattvam-purple-600/80">
                Unlike generic wellness plans, we use a structured <strong>3-Step Diagnosis System</strong> to understand where you truly are—before guiding you forward.
              </p>
              <p className="mt-4 font-medium text-tattvam-gold-600">
                Every recommendation, session, and practice is personalized to you. Not one-size-fits-all.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 3: 3-Step Diagnosis System */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                Our Approach
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Our <span className="text-tattvam-gold-500">3-Step Diagnosis System</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Body Analysis",
                content:
                  "We assess physical state, energy levels, flexibility, posture, sleep quality, and body type tendencies.",
                purpose: "Understand what your body actually needs—not a generic plan.",
                delay: 100,
              },
              {
                step: "02",
                title: "Mind Analysis",
                content:
                  "We study reaction patterns, stress triggers, focus, decision-making, and daily responses.",
                purpose: "Understand how you think and respond.",
                delay: 200,
              },
              {
                step: "03",
                title: "Emotional Energy Analysis",
                content:
                  "We identify emotional imbalances, blocked feelings, and energy flow patterns.",
                purpose: "Uncover what's held inside—so healing can begin.",
                delay: 300,
              },
            ].map((item) => (
              <Reveal key={item.title} delay={item.delay}>
                <div className="card-hover group relative h-full rounded-3xl bg-white p-8 shadow-soft">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-tattvam-purple-500/5 to-tattvam-gold-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <span className="font-serif text-5xl font-bold text-tattvam-gold-400/40">
                      {item.step}
                    </span>
                    <h3 className="mt-4 font-serif text-2xl font-semibold text-tattvam-purple-800">
                      {item.title}
                    </h3>
                    <p className="mt-4 leading-relaxed text-tattvam-purple-600/70">
                      {item.content}
                    </p>
                    <div className="mt-6 rounded-xl bg-tattvam-purple-50 p-4">
                      <p className="text-sm font-medium text-tattvam-purple-600">
                        <span className="text-tattvam-gold-500">Purpose:</span> {item.purpose}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Choose Your Path */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
                Membership Tiers
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
                Choose Your <span className="text-tattvam-gold-400">Path</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Card 1: Ananda Flow */}
            <Reveal delay={100}>
              <div className="glass-card-dark flex h-full flex-col rounded-3xl p-8">
                <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                  Ananda Flow
                </h3>
                <p className="mt-2 text-sm font-medium text-tattvam-purple-300">
                  Entry Level
                </p>
                <p className="mt-4 text-purple-100/80">
                  Get your body and energy moving
                </p>
                <ul className="mt-6 space-y-3 text-purple-100/80">
                  {[
                    "Daily Yoga & Kalari",
                    "Group practices",
                    "Trataka, Animal Walks, Laughter",
                    "1 Open Healing Session",
                    "Community Day (optional)",
                    "3-Step Diagnosis",
                    "Event access",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 text-tattvam-gold-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-tattvam-purple-800/50 p-4">
                  <p className="text-sm text-tattvam-purple-200">
                    <span className="text-tattvam-gold-400">Focus:</span> Discipline, consistency, movement
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary block w-full text-center"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Card 2: Ananda Rise (Most Recommended) */}
            <Reveal delay={200}>
              <div className="relative flex h-full flex-col rounded-3xl border-2 border-tattvam-gold-400 bg-gradient-to-b from-tattvam-purple-800 to-tattvam-purple-900 p-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-tattvam-gold-400 px-4 py-1 text-xs font-bold text-tattvam-purple-900">
                  Most Recommended
                </div>
                <h3 className="mt-2 font-serif text-2xl font-semibold text-tattvam-gold-400">
                  Ananda Rise
                </h3>
                <p className="mt-2 text-sm font-medium text-tattvam-purple-300">
                  Transformation Level
                </p>
                <p className="mt-4 text-purple-100/80">
                  Shift patterns. Experience real change.
                </p>
                <ul className="mt-6 space-y-3 text-purple-100/80">
                  {[
                    "Everything in Flow",
                    "Weekly Emotional Healing",
                    "Personalized guidance",
                    "Priority access",
                    "Discounted events",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 text-tattvam-gold-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-tattvam-purple-800/50 p-4">
                  <p className="text-sm text-tattvam-purple-200">
                    <span className="text-tattvam-gold-400">Focus:</span> Body + Mind + Emotional transformation
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary block w-full text-center"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Card 3: Ananda Inner Circle */}
            <Reveal delay={300}>
              <div className="glass-card-dark flex h-full flex-col rounded-3xl p-8">
                <h3 className="font-serif text-2xl font-semibold text-tattvam-gold-400">
                  Ananda Inner Circle
                </h3>
                <p className="mt-2 text-sm font-medium text-tattvam-purple-300">
                  Premium
                </p>
                <p className="mt-4 text-purple-100/80">
                  Your life, guided personally
                </p>
                <ul className="mt-6 space-y-3 text-purple-100/80">
                  {[
                    "Everything in Rise",
                    "Monthly 1:1 sessions",
                    "Personalized tracking",
                    "Direct access",
                    "Premium events included",
                  ].map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-1 text-tattvam-gold-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-xl bg-tattvam-purple-800/50 p-4">
                  <p className="text-sm text-tattvam-purple-200">
                    <span className="text-tattvam-gold-400">Focus:</span> Deep, accelerated transformation
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary block w-full text-center"
                  >
                    Enquire Now
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 5: Why Project Ananda Works */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <div className="glass-card rounded-[2rem] p-12">
              <h2 className="font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Why Project Ananda <span className="gradient-text">Works</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
                Real transformation happens when body, mind, and emotions work together.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-tattvam-purple-700">
                Most people try to fix one part.
              </p>
              <p className="mx-auto mt-2 text-xl font-bold text-tattvam-gold-600">
                We align all three.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 6: Who Is This For */}
      <section className="section-padding bg-gradient-to-b from-tattvam-purple-50 to-white">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                Is This You?
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                Who Is This <span className="gradient-text">For?</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft">
              <ul className="space-y-4">
                {[
                  "Stuck in repeating patterns",
                  "Low energy / inconsistency",
                  "Emotional heaviness",
                  "Mental overwhelm",
                  "Feeling disconnected",
                  "Ready for real change",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-100">
                      <span className="text-tattvam-gold-600">✦</span>
                    </div>
                    <span className="text-lg text-tattvam-purple-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 7: Starter Experience (Free Trial) */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={3} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-tattvam-gold-400/20 px-4 py-2 text-sm font-medium text-tattvam-gold-300">
              Try Before You Commit
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold text-white md:text-5xl">
              Starter Experience — <span className="text-tattvam-gold-400">Free Trial</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-tattvam-purple-800/50 p-8 glass-card-dark">
              <h3 className="font-serif text-xl font-semibold text-white">Includes:</h3>
              <ul className="mt-6 space-y-4 text-purple-100/90">
                {[
                  "1 Physical Session",
                  "1 Mindful Session",
                  "1 Healing Experience",
                ].map((item) => (
                  <li key={item} className="flex items-center justify-center gap-3">
                    <span className="text-tattvam-gold-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-tattvam-purple-300">
                Perfect for trying before committing
              </p>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex"
              >
                Enquire Now
                <span className="ml-2">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer CTA */}
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
