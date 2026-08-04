'use client';

import Link from 'next/link';
import { BookOpen, Inbox, Users } from 'lucide-react';
import PageShell from '@/components/PageShell';
import StatCard from '@/components/StatCard';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';

const ADMIN_SECTIONS = [
  { href: '/admin/courses', label: 'Manage courses', icon: BookOpen },
  { href: '/admin/users', label: 'Manage users / reps', icon: Users },
  { href: '/admin/requests', label: 'Material requests inbox', icon: Inbox },
];

export default function AdminOverviewPage() {
  const { permitted } = useRequireRole(['SUPER_ADMIN']);
  const { courses, resources, users, requests } = useLibrary();

  if (!permitted) return null;

  const activeResources = resources.filter((r) => r.status === 'ACTIVE').length;
  const openRequests = requests.filter((r) => r.status === 'OPEN').length;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Department overview for super-admins.
      </p>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Courses" value={courses.length} />
        <StatCard label="Resources" value={activeResources} />
        <StatCard label="Users" value={users.length} />
        <StatCard label="Open requests" value={openRequests} />
      </div>

      <ul className="mt-6 space-y-2">
        {ADMIN_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex items-center gap-3 min-h-11 px-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
            >
              <section.icon className="w-4 h-4 text-[var(--text-subtle)]" aria-hidden="true" />
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
