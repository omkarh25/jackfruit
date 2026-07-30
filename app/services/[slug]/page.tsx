"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { FloatingOrbs, Reveal } from "@/components/animations";
import { Navigation } from "@/components/app-shell/navigation";
import { WorkshopPayButton } from "@/components/payments/workshop-pay-button";
import { getServiceBySlug, type ServiceRecord } from "@/lib/db/services";

const DEFAULT_WHATSAPP = "https://wa.me/916363606088";

function parsePrice(price: string): number {
  return parseInt((price || "").replace(/[^0-9]/g, ""), 10) || 0;
}

/**
 * Dynamic detail page for services without a bespoke static page —
 * primarily workshop-style offerings (workshops were merged into services).
 * Static routes (project-ananda, inner-power-camp, …) take precedence.
 */
export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [service, setService] = useState<ServiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getServiceBySlug(params.slug)
      .then((data) => setService(data))
      .catch((err) => console.error("Error loading service details:", err))
      .finally(() => setIsLoading(false));
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-tattvam-neutral-50">
        <div className="font-medium text-tattvam-purple-500">Loading details...</div>
      </div>
    );
  }

  if (!service || service.isVisible === false) {
    notFound();
  }

  const isWorkshop = service.kind === "workshop";
  const format = service.format || (isWorkshop ? "Live Zoom" : service.duration);
  const isReservable = !isWorkshop || service.format === "Live Zoom" || service.format === "Offline";
  const isOffline = service.format === "Offline";
  const price = parsePrice(service.price);

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
              <span className={`h-2 w-2 rounded-full ${isReservable ? "bg-green-400 animate-pulse" : "bg-tattvam-purple-400"}`} />
              {format}
            </div>
          </Reveal>

          <Reveal delay={300}>
            <h1 className="font-serif text-5xl font-bold leading-tight tracking-tight text-tattvam-purple-900 md:text-6xl">
              {service.title}
            </h1>
          </Reveal>

          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-tattvam-purple-600/80">
              {service.longDescription || service.description}
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-4 rounded-2xl bg-white p-6 shadow-soft">
              {service.date && (
                <>
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Date</p>
                    <p className="mt-1 font-semibold text-tattvam-purple-800">{service.date}</p>
                  </div>
                  <div className="h-8 w-px bg-tattvam-purple-100" />
                </>
              )}
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">
                  {isWorkshop ? "Format" : "Duration"}
                </p>
                <p className="mt-1 font-semibold text-tattvam-purple-800">{format}</p>
              </div>
              <div className="h-8 w-px bg-tattvam-purple-100" />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Price</p>
                <p className="mt-1 font-semibold text-tattvam-gold-600">
                  {service.enquiryMode ? "Enquiry Only" : service.price || "Free"}
                </p>
              </div>
              {isOffline && service.venueLink && (
                <>
                  <div className="h-8 w-px bg-tattvam-purple-100" />
                  <div className="text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-tattvam-purple-400">Venue</p>
                    <a
                      href={service.venueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block font-semibold text-tattvam-purple-800 underline transition hover:text-tattvam-purple-600"
                    >
                      View Map 📍
                    </a>
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={900}>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {isReservable ? (
                service.enquiryMode ? (
                  <a
                    href={service.whatsappLink || DEFAULT_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex"
                  >
                    Enquire on WhatsApp
                  </a>
                ) : (
                  <>
                    {price > 0 && (
                      <div className="w-full sm:w-auto">
                        <WorkshopPayButton
                          workshopId={service.id || service.slug}
                          workshopTitle={service.title}
                          price={price}
                          redirectUrl={service.paymentRedirectUrl}
                        />
                      </div>
                    )}
                    <a
                      href={service.whatsappLink || DEFAULT_WHATSAPP}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary inline-flex"
                    >
                      Enquire on WhatsApp
                    </a>
                  </>
                )
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

      {/* Content Section */}
      <section className="section-padding">
        <div className="mx-auto max-w-4xl px-6">
          <Reveal>
            <div className="glass-card rounded-[2rem] p-10">
              <h2 className="font-serif text-3xl font-bold text-tattvam-purple-900">
                What You&apos;ll <span className="gradient-text">Learn</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-tattvam-purple-600/80">
                {service.longDescription || service.description}
              </p>
              {service.outcomes && service.outcomes.length > 0 && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {service.outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-xl bg-tattvam-purple-50 p-4">
                      <span className="mt-0.5 text-tattvam-gold-500">✓</span>
                      <span className="text-sm text-tattvam-purple-700">{item}</span>
                    </div>
                  ))}
                </div>
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
