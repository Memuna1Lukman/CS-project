export default function StagePlaceholder({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)] max-w-prose">{note}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
