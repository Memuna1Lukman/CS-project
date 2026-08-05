import Link from 'next/link';
import PageShell from '@/components/PageShell';

const ADMIN_SECTIONS = [
  { href: '/admin/courses', label: 'Manage courses' },
  { href: '/admin/users', label: 'Manage users / reps' },
  { href: '/admin/requests', label: 'Material requests inbox' },
];

export default function AdminOverviewPage() {
  return (
    <PageShell>
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Manage the catalog, student access, and incoming requests.</p>
        <ul className="space-y-2">
          {ADMIN_SECTIONS.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="flex items-center min-h-11 px-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
              >
                {section.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
