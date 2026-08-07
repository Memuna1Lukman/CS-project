'use client';

import Link from 'next/link';
import { BookOpen, Inbox, ShieldAlert, Users } from 'lucide-react';
import PageShell from '@/components/PageShell';
import StatCard from '@/components/StatCard';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import PageHeader from '@/components/PageHeader';
import { AdminCardsSkeleton } from '@/components/LoadingSkeletons';

const ADMIN_SECTIONS = [
  { href: '/admin/courses', label: 'Manage courses', icon: BookOpen },
  { href: '/admin/users', label: 'Manage users / reps', icon: Users },
  { href: '/admin/requests', label: 'Material requests inbox', icon: Inbox },
  { href: '/admin/resources', label: 'Moderate resources', icon: ShieldAlert },
];

export default function AdminOverviewPage() {
  const { permitted } = useRequireRole(['SUPER_ADMIN']);
  const { courses, resources, users, requests, isLoading } = useLibrary();

  if (!permitted) return null;

  const activeResources = resources.filter((r) => r.status === 'ACTIVE').length;
  const openRequests = requests.filter((r) => r.status === 'OPEN').length;
  const removedResources = resources.filter((r) => r.status === 'REMOVED').length;
  const reps = users.filter((user) => user.role === 'REP' && user.status === 'ACTIVE').length;

  return (
    <PageShell>
      <PageHeader eyebrow="Administration" title="Admin overview" description="Department overview for super-admins." />

      <div className="mt-5">{isLoading ? <AdminCardsSkeleton /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><StatCard label="Courses" value={courses.length} /><StatCard label="Resources" value={activeResources} /><StatCard label="Users" value={users.length} /><StatCard label="Open requests" value={openRequests} /></div>}</div>

      <ul className="mt-6 space-y-2">
        {ADMIN_SECTIONS.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex items-center gap-3 min-h-11 px-4 rounded-2xl bg-(--surface) shadow-[0_1px_3px_var(--shadow)] text-sm font-medium text-(--text-primary) hover:bg-(--surface-3)"
            >
              <section.icon className="w-4 h-4 text-(--text-subtle)" aria-hidden="true" />
              {section.label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-7">
        <p className="text-xs font-bold uppercase tracking-wider text-(--text-subtle)">Needs attention</p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-(--text-primary)">Coverage radar</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Link href="/admin/requests" className="rounded-2xl bg-(--surface) p-4 shadow-[0_1px_3px_var(--shadow)] hover:bg-(--surface-3)"><p className="text-2xl font-bold tabular-nums text-(--text-primary)">{openRequests}</p><p className="mt-1 text-sm text-(--text-muted)">open material requests</p></Link>
          <Link href="/admin/resources" className="rounded-2xl bg-(--surface) p-4 shadow-[0_1px_3px_var(--shadow)] hover:bg-(--surface-3)"><p className="text-2xl font-bold tabular-nums text-(--text-primary)">{removedResources}</p><p className="mt-1 text-sm text-(--text-muted)">removed resources to review</p></Link>
          <Link href="/admin/users" className="rounded-2xl bg-(--surface) p-4 shadow-[0_1px_3px_var(--shadow)] hover:bg-(--surface-3)"><p className="text-2xl font-bold tabular-nums text-(--text-primary)">{reps}</p><p className="mt-1 text-sm text-(--text-muted)">active course reps</p></Link>
        </div>
      </section>
    </PageShell>
  );
}
