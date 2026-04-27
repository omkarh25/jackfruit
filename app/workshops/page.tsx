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
            <button className="rounded-full bg-jackfruit-leaf px-5 py-3 text-sm font-semibold text-white transition hover:bg-jackfruit-deep">
              {workshop.format === "Live Zoom" ? "View Zoom details" : "Watch recording"}
            </button>
          </ContentCard>
        ))}
      </div>
    </PageShell>
  );
}