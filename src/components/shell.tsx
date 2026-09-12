import { Nav } from "./nav";

/** Page frame: capped width, room at the bottom for the tab bar. */
export function Shell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto max-w-lg px-4 pt-5 pb-32">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
        {children}
      </div>
      <Nav />
    </>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-line bg-panel p-4 ${className}`}
    >
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
      {children}
    </div>
  );
}
