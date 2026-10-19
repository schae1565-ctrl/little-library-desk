export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-normal text-foreground">{title}</h1>
      {description && <p className="mt-2 text-base text-muted">{description}</p>}
    </header>
  );
}

export function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline bg-surface-soft p-8 text-center text-base text-muted">
      {children}
    </div>
  );
}
