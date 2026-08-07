import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center shadow-[0_1px_3px_var(--shadow)] sm:px-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--text-muted)]">
        <Icon className="h-8 w-8" aria-hidden="true" strokeWidth={1.5} />
      </div>
      <h2 className="mt-4 text-base font-bold text-[var(--text-primary)]">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[var(--text-muted)]">
        {description}
      </p>
      <div className="mt-5">{action ?? <Link href="/" className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-fg)]">Browse courses</Link>}</div>
    </div>
  );
}
