import { Navigation } from "./navigation";

interface PageShellProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
}

/**
 * Consistent page frame for all learner app sections.
 */
export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-6xl px-5 py-10">
        <section className="mb-8 rounded-[2rem] bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-jackfruit-leaf">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-jackfruit-deep md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-jackfruit-deep/70">{description}</p>
        </section>
        {children}
      </main>
    </>
  );
}