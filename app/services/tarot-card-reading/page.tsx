"use client";

import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";

const WHATSAPP_LINK = "https://wa.me/916363606088";
const TAROT_PAYMENT_BUTTON_ID = "pl_SiNXqS3vOzGc7l"; // Reuse existing or create specific

const exploreCards = [
  {
    icon: "🧭",
    title: "Life Direction & Decision Clarity",
    description: "Gain perspective on your path and available choices",
  },
  {
    icon: "💞",
    title: "Relationships & Emotional Patterns",
    description: "Understand dynamics and recurring patterns",
  },
  {
    icon: "💼",
    title: "Career & Financial Guidance",
    description: "Clarity on opportunities, blocks, and alignment",
  },
  {
    icon: "🔮",
    title: "Inner Blockages & Energy Shifts",
    description: "Identify fears and limiting beliefs",
  },
  {
    icon: "✨",
    title: "Spiritual Growth & Self-Connection",
    description: "Reconnect with your inner voice",
  },
];

const sessionSteps = [
  "One-on-one guided tarot reading",
  "Safe, non-judgmental space",
  "Intuitive + grounded interpretation",
  "Practical, actionable insights",
];

export default function TarotCardReadingPage() {
  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Section 1: Hero */}
      <section className="relative flex min-h-[90vh] items-center px-6 pt-20">
        <FloatingOrbs count={5} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center md:text-left md:mx-0">
            <Reveal delay={100}>
              <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-7xl">
                Tarot Card <span className="gradient-text">Reading</span>
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <h2 className="mt-6 font-serif text-2xl font-medium text-tattvam-purple-700 md:text-3xl">
                Clarity when your mind feels scattered. Direction when your heart feels unsure.
              </h2>
            </Reveal>

            <Reveal delay={500}>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
                At Tattvam Niramaya, tarot is not about predicting a fixed future. It is a tool for self-awareness, emotional clarity, and conscious decision-making.
              </p>
            </Reveal>

            <Reveal delay={700}>
              <div className="mt-8 max-w-xl rounded-2xl bg-gradient-to-r from-tattvam-gold-400/10 to-tattvam-purple-400/10 p-6">
                <p className="font-serif text-lg text-tattvam-purple-800">
                  You don&apos;t come here to be told what will happen.
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-tattvam-gold-600">
                  You come here to understand what is happening within you.
                </p>
              </div>
            </Reveal>

            <Reveal delay={900}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:items-start">
                <RazorpayPaymentButton paymentButtonId={TAROT_PAYMENT_BUTTON_ID} />
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex"
                >
                  WhatsApp Enquiry
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 2: What You Will Gain */}
      <section className="section-padding bg-gradient-to-b from-white to-tattvam-purple-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div>
                <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                  Benefits
                </span>
                <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                  What You Will <span className="gradient-text">Gain</span>
                </h2>
                <ul className="mt-8 space-y-5">
                  {[
                    { icon: "🔍", text: "Clarity in confusing situations" },
                    { icon: "💡", text: "Emotional insight and awareness" },
                    { icon: "🧭", text: "Guidance for decision-making" },
                    { icon: "🌙", text: "Stronger connection with your intuition" },
                    { icon: "⚖️", text: "Grounded perspective on your current phase" },
                  ].map((item) => (
                    <li key={item.text} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-100 text-lg">
                        {item.icon}
                      </div>
                      <span className="text-lg text-tattvam-purple-700">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal direction="right" delay={200}>
              <div className="relative">
                <div className="glass-card aspect-[4/3] overflow-hidden rounded-[2rem]">
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-tattvam-purple-300 to-tattvam-gold-300">
                    <span className="text-6xl">🔮</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-tattvam-gold-300/30" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Section 3: What We Can Explore */}
      <section className="section-padding">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                Areas of Exploration
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                What We Can <span className="text-tattvam-gold-500">Explore</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <div className="card-hover rounded-3xl bg-white p-8 shadow-soft">
                  <div className="mb-4 text-4xl">{card.icon}</div>
                  <h3 className="font-serif text-xl font-semibold text-tattvam-purple-800">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-tattvam-purple-600/70">
                    {card.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: How The Session Works */}
      <section className="section-padding bg-gradient-to-b from-tattvam-purple-50 to-white">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <span className="inline-block rounded-full bg-tattvam-purple-100 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
                The Process
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                How The <span className="gradient-text">Session Works</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-4">
            {sessionSteps.map((step, i) => (
              <Reveal key={step} delay={i * 150}>
                <div className="relative text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-tattvam-purple-100 to-tattvam-gold-100">
                    <span className="font-serif text-2xl font-bold text-tattvam-purple-600">
                      {i + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-medium text-tattvam-purple-700">
                    {step}
                  </p>
                  {i < sessionSteps.length - 1 && (
                    <div className="absolute left-1/2 top-10 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-tattvam-purple-200 to-tattvam-gold-200 md:left-full md:top-10 md:block md:w-[calc(100%-5rem)]" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Outcome of a Session */}
      <section className="section-padding bg-tattvam-purple-50">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="text-center">
              <span className="inline-block rounded-full bg-tattvam-gold-100 px-4 py-2 text-sm font-medium text-tattvam-gold-700">
                After The Session
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold text-tattvam-purple-900 md:text-5xl">
                What You Will <span className="gradient-text">Walk Away With</span>
              </h2>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-10 rounded-3xl bg-white p-8 shadow-soft">
              <ul className="space-y-4">
                {[
                  "Feel clearer and more centered",
                  "Understand your situation deeply",
                  "Make decisions with confidence",
                  "Recognize patterns influencing your life",
                  "Leave with actionable clarity",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tattvam-gold-100">
                      <span className="text-tattvam-gold-600">✓</span>
                    </div>
                    <span className="text-lg text-tattvam-purple-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 6: Who Is This For */}
      <section className="section-padding">
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
                  "Feeling stuck or emotionally overwhelmed",
                  "Facing an important decision",
                  "Seeking clarity in relationships or career",
                  "Want deeper self-understanding",
                  "Ready to look within",
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

      {/* Section 7: Important Note */}
      <section className="section-padding bg-tattvam-purple-50">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <div className="glass-card rounded-[2rem] p-10">
              <h2 className="font-serif text-3xl font-bold text-tattvam-purple-900">
                Important <span className="gradient-text">Note</span>
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-tattvam-purple-600/80">
                Tarot is a guidance tool—not a fixed prediction.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-tattvam-purple-600/80">
                Your choices, awareness, and actions shape your life.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-lg font-medium text-tattvam-purple-700">
                We use tarot to empower you—not create dependency.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Section 8: Final CTA */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={4} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
              Clarity begins when you choose to <span className="text-tattvam-gold-400">look within</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-purple-100/80">
              Your answers are not outside.
            </p>
            <p className="mx-auto mt-2 text-xl font-semibold text-tattvam-gold-400">
              They are waiting to be seen.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <RazorpayPaymentButton paymentButtonId={TAROT_PAYMENT_BUTTON_ID} />
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex"
              >
                WhatsApp Enquiry
              </a>
            </div>
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
