"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { getVisibleServices, type ServiceRecord } from "@/lib/db/services";
import { services as staticServices } from "@/lib/data";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      .catch(() => {
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

  return (
    <PageShell
      eyebrow="Services"
      title="Personal support when you need guidance"
      description="Choose a consultation or guided package, then continue into booking and confirmation."
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading services...</div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {services.map((service) => (
            <ContentCard
              key={service.id}
              title={service.title}
              description={service.description}
              badge={service.price}
              meta={service.duration}
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
    </PageShell>
  );
}
