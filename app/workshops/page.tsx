"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { getAllWorkshops, type WorkshopRecord } from "@/lib/db/workshops";
import { workshops as staticWorkshops } from "@/lib/data";

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllWorkshops()
      .then((firestoreWorkshops) => {
        setWorkshops(
          firestoreWorkshops.length > 0
            ? firestoreWorkshops
            : staticWorkshops.map((w) => ({
                id: w.id,
                title: w.title,
                slug: w.slug,
                description: w.description,
                longDescription: w.longDescription,
                date: w.date,
                format: w.format,
                price: w.price ? parseInt(w.price.replace(/[^0-9]/g, "")) || 0 : 0,
                whatsappLink: w.whatsappLink,
                registrationsEnabled: true,
              }))
        );
      })
      .catch(() => {
        setWorkshops(
          staticWorkshops.map((w) => ({
            id: w.id,
            title: w.title,
            slug: w.slug,
            description: w.description,
            longDescription: w.longDescription,
            date: w.date,
            format: w.format,
            price: w.price ? parseInt(w.price.replace(/[^0-9]/g, "")) || 0 : 0,
            whatsappLink: w.whatsappLink,
            registrationsEnabled: true,
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageShell
      eyebrow="Workshops"
      title="Upcoming Workshops & Experiences"
      description="Discover upcoming workshops, join live sessions, and revisit recorded learning resources."
    >
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-tattvam-purple-400">Loading workshops...</div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {workshops.map((workshop) => (
            <ContentCard
              key={workshop.id}
              title={workshop.title}
              description={workshop.description}
              badge={workshop.format}
              meta={workshop.date}
            >
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/workshops/${workshop.slug}`}
                  className="rounded-full bg-tattvam-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-tattvam-purple-700"
                >
                  Click to Know More
                </Link>
                {workshop.format === "Live Zoom" ? (
                  <span className="inline-flex items-center rounded-full bg-tattvam-gold-100 px-4 py-2 text-xs font-bold text-tattvam-gold-700">
                    ● Live Zoom
                  </span>
                ) : workshop.format === "Offline" ? (
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700">
                    📍 Offline
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-tattvam-purple-100 px-4 py-2 text-xs font-bold text-tattvam-purple-600">
                    ▶ Recording
                  </span>
                )}
              </div>
            </ContentCard>
          ))}
        </div>
      )}
    </PageShell>
  );
}
