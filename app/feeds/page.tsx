import { PageShell } from "@/components/app-shell/page-shell";
import { ContentCard } from "@/components/cards/content-card";
import { feedItems } from "@/lib/data";

export default function FeedsPage() {
  return (
    <PageShell
      eyebrow="Feeds"
      title="Updates curated for your wellness journey"
      description="See announcements, learning resources, workshop reminders, and booking prompts in one place."
    >
      <div className="grid gap-5">
        {feedItems.map((item) => (
          <ContentCard
            key={item.id}
            title={item.title}
            description={item.description}
            badge={item.tag}
            meta={item.publishedAt}
          />
        ))}
      </div>
    </PageShell>
  );
}