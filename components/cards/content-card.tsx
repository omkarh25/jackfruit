interface ContentCardProps {
  readonly title: string;
  readonly description: string;
  readonly meta?: string;
  readonly badge?: string;
  readonly children?: React.ReactNode;
}

/**
 * Reusable content card for feeds, courses, workshops, and services.
 */
export function ContentCard({ title, description, meta, badge, children }: ContentCardProps) {
  return (
    <article className="rounded-3xl border border-tattvam-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-4">
        {badge ? <span className="rounded-full bg-tattvam-gold-100 px-3 py-1 text-xs font-bold text-tattvam-gold-700">{badge}</span> : null}
        {meta ? <span className="text-sm font-medium text-tattvam-purple-500">{meta}</span> : null}
      </div>
      <h2 className="font-serif text-2xl font-bold text-tattvam-purple-800">{title}</h2>
      <p className="mt-3 leading-7 text-tattvam-purple-600/70">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}
