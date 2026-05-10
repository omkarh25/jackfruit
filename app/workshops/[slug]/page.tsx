"use client";

import { notFound } from "next/navigation";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { RazorpayPaymentButton } from "@/components/payments/razorpay-payment-button";
import { getWorkshopBySlug } from "@/lib/data";

const paymentButtonId = "pl_SiNXqS3vOzGc7l";

export default function WorkshopDetailPage({ params }: { params: { slug: string } }) {
  const workshop = getWorkshopBySlug(params.slug);

  if (!workshop) {
    notFound();
  }

  const isLive = workshop.format === "Live Zoom";

  return (
    <div className="relative overflow-x-hidden bg-tattvam-neutral-50">
      <Navigation />

      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center px-6 pt-20">
        <FloatingOrbs count={4} />
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-tattvam-gold-200/30 blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-tattvam-purple-200/30 blur-3xl animate-float-slow" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal delay={100}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tattvam-purple-50 px-4 py-2 text-sm font-medium text-tattvam-purple-600">
              <span className={`h-2 w-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-tattvam-purple-400"}`} />
              {workshop.format}
            </div>
          </Reveal>

          <Reveal delay={300}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-6xl">
              {workshop.title}
            </h1>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              {workshop.longDescription || workshop.description}
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-soft">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Date</p>
                <p className="mt-1 font-semibold text-tattvam-purple-800">{workshop.date}</p>
              </div>
              <div className="h-8 w-px bg-tattvam-purple-100" />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Format</p>
                <p className="mt-1 font-semibold text-tattvam-purple-800">{workshop.format}</p>
              </div>
              <div className="h-8 w-px bg-tattvam-purple-100" />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Price</p>
                <p className="mt-1 font-semibold text-tattvam-gold-600">{workshop.price || "Free"}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={900}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isLive ? (
                <>
                  <RazorpayPaymentButton paymentButtonId={paymentButtonId} />
                  <a
                    href={workshop.whatsappLink || "https://wa.me/916363606088"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex"
                  >
                    Enquire on WhatsApp
                  </a>
                </>
              ) : (
                <button className="btn-primary inline-flex">
                  Watch Recording
                  <span className="ml-2">▶</span>
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Content Sections */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="glass-card rounded-[2rem] p-10">
              <h2 className="font-serif text-3xl font-bold text-tattvam-purple-900">
                What You&apos;ll <span className="gradient-text">Learn</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-tattvam-purple-600/80">
                {workshop.longDescription || workshop.description}
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "Guided instruction from an experienced practitioner",
                  "Practical techniques you can use immediately",
                  "Q&A session for personalized guidance",
                  "Lifetime access to session recording",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl bg-tattvam-purple-50 p-4">
                    <span className="mt-0.5 text-tattvam-gold-500">✓</span>
                    <span className="text-sm text-tattvam-purple-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-tattvam-purple-900">
        <FloatingOrbs count={3} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">
              Ready to <span className="text-tattvam-gold-400">Begin?</span>
            </h2>
          </Reveal>

          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-purple-100/80">
              {isLive
                ? "Secure your spot today. Limited seats available for live sessions."
                : "Get instant access to the full recording and start learning right away."}
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isLive ? (
                <>
                  <RazorpayPaymentButton paymentButtonId={paymentButtonId} />
                  <a
                    href={workshop.whatsappLink || "https://wa.me/916363606088"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary inline-flex"
                  >
                    WhatsApp Enquiry
                  </a>
                </>
              ) : (
                <button className="btn-primary inline-flex">
                  Get Recording Access
                  <span className="ml-2">→</span>
                </button>
              )}
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
