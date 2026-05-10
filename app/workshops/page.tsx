import Link from "next/link";
import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { workshops } from "@/lib/data";

export default function WorkshopsPage() {
  return (
    <PageShell
      eyebrow="Workshops"
      title="Live Zoom sessions and previous recordings"
      description="Discover upcoming workshops, join live sessions, and revisit recorded learning resources."
    >
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
                  ● Live
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
    </PageShell>
  );
}
