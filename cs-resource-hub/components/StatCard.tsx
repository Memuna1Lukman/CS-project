export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-[0_1px_2px_var(--shadow)]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
        {label}
      </p>
      <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums leading-none ml-auto">
        {value}
      </p>
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
