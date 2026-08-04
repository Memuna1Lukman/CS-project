import Link from 'next/link';
import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

const ADMIN_SECTIONS = [
  { href: '/admin/courses', label: 'Manage courses' },
  { href: '/admin/users', label: 'Manage users / reps' },
  { href: '/admin/requests', label: 'Material requests inbox' },
];

// Super-admin only, once role-gating lands.
export default function AdminOverviewPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Admin"
        note="Overview for super-admins — coming in Stage 6."
      >
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
      </StagePlaceholder>
    </PageShell>
  );
}
