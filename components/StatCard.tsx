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
    <div className="bg-[var(--surface)] rounded-2xl px-4 py-3.5 shadow-[0_1px_3px_var(--shadow)]">
      <p className="text-[11px] font-semibold text-[var(--text-subtle)]">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-[var(--text-primary)] tabular-nums leading-tight">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
