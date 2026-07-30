"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { getVisibleServices, type ServiceRecord } from "@/lib/db/services";
import { services as staticServices } from "@/lib/data";

type Tab = "all" | "services" | "workshops";

// Ensure a rupee symbol on plain numeric prices entered without one.
function formatPrice(price: string): string {
  const trimmed = (price || "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes("₹")) return trimmed;
  if (/^\d[\d,]*(\.\d+)?$/.test(trimmed)) return `₹${trimmed}`;
  return trimmed;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    getVisibleServices()
      .then((firestoreServices) => {
        // Fall back to static data if Firestore is empty
        setServices(firestoreServices.length > 0 ? firestoreServices : staticServices.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          duration: s.duration,
          price: s.price,
          outcomes: [...s.outcomes],
          isVisible: true,
        })));
      })
      .catch((err) => {
        console.error("Failed to load services:", err);
        setServices(staticServices.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          duration: s.duration,
          price: s.price,
          outcomes: [...s.outcomes],
          isVisible: true,
        })));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const hasWorkshops = services.some((s) => s.kind === "workshop");
  const filtered = services.filter((s) => {
    if (tab === "workshops") return s.kind === "workshop";
    if (tab === "services") return s.kind !== "workshop";
    return true;
  });

  return (
    <PageShell
      eyebrow="Services"
      title="Personal support when you need guidance"
      description="Choose a consultation, guided package, or workshop, then continue into booking and confirmation."
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading services...</div>
        </div>
      ) : (
        <>
          {hasWorkshops && (
            <div className="mb-6 inline-flex rounded-full border border-tattvam-purple-200 bg-white p-1">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "services", label: "Services" },
                  { key: "workshops", label: "Workshops" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    tab === t.key
                      ? "bg-tattvam-purple-600 text-white"
                      : "text-tattvam-purple-600 hover:text-tattvam-purple-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-tattvam-purple-400">
              Nothing available here yet.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filtered.map((service) => (
                <ContentCard
                  key={service.id}
                  title={service.title}
                  description={service.description}
                  badge={service.enquiryMode ? "Enquiry Only" : formatPrice(service.price)}
                  meta={service.kind === "workshop" ? service.format || service.date || service.duration : service.duration}
                  shareUrl={`/services/${service.slug}`}
                >
                  <ul className="mb-5 list-inside list-disc space-y-2 text-sm text-jackfruit-deep/70">
                    {(service.outcomes || []).map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/services/${service.slug}`}
                      className="rounded-full bg-tattvam-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-tattvam-purple-700"
                    >
                      Click to Know More
                    </Link>
                  </div>
                </ContentCard>
              ))}
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
