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
    <article className="rounded-3xl border border-jackfruit-deep/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-4">
        {badge ? <span className="rounded-full bg-jackfruit-gold/25 px-3 py-1 text-xs font-bold text-jackfruit-deep">{badge}</span> : null}
        {meta ? <span className="text-sm font-medium text-jackfruit-leaf">{meta}</span> : null}
      </div>
      <h2 className="text-2xl font-bold text-jackfruit-deep">{title}</h2>
      <p className="mt-3 leading-7 text-jackfruit-deep/70">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </article>
  );
}