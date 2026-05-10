interface AdminShellProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: React.ReactNode;
}

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-tattvam-neutral-50">
      <main className="ml-64 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-tattvam-purple-900">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-tattvam-purple-600/70">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
