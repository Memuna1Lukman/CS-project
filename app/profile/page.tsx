'use client';

import Link from 'next/link';
import { GraduationCap, LogOut, Mail, ShieldCheck, Upload, UserRound } from 'lucide-react';
import PageShell from '@/components/PageShell';
import PageHeader from '@/components/PageHeader';
import { useSession } from '@/components/MockSessionProvider';
import type { Role } from '@/types/resource';

const ROLE_LABELS: Record<Role, string> = { STUDENT: 'Student', REP: 'Course Rep', SUPER_ADMIN: 'Super Admin' };

export default function ProfilePage() {
  const { session, signOut } = useSession();
  if (!session) return null;
  const levels = session.role === 'SUPER_ADMIN' ? 'All levels' : session.role === 'REP' ? (session.scopes?.map((level) => `Level ${level}`).join(', ') || 'No level assigned') : session.level ? `Level ${session.level}` : 'Level not assigned';
  return <PageShell>
    <PageHeader eyebrow="Account" title="Profile" description="Your verified account and library access scope." />
    <div className="mt-4 rounded-3xl bg-[var(--surface)] p-6 shadow-[0_2px_8px_var(--shadow)]">
      <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-[var(--accent-fg)]">{session.name.charAt(0).toUpperCase()}</div><div><p className="text-base font-bold text-[var(--text-primary)]">{session.name}</p><span className="mt-0.5 inline-block rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--accent-fg)]">{ROLE_LABELS[session.role]}</span></div></div>
      <dl className="mt-5 space-y-3 border-t border-[var(--border)] pt-4"><div className="flex items-center gap-3"><Mail className="h-4 w-4 text-[var(--text-subtle)]" /><dd className="truncate text-sm text-[var(--text-primary)]">{session.email}</dd></div><div className="flex items-center gap-3"><GraduationCap className="h-4 w-4 text-[var(--text-subtle)]" /><dd className="text-sm text-[var(--text-primary)]">{levels}</dd></div><div className="flex items-center gap-3"><UserRound className="h-4 w-4 text-[var(--text-subtle)]" /><dd className="text-sm text-[var(--text-primary)]">{session.indexNumber || 'Index number not set'}</dd></div><div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-[var(--text-subtle)]" /><dd className="text-sm text-[var(--text-primary)]">{ROLE_LABELS[session.role]}</dd></div></dl>
      <button type="button" onClick={() => void signOut()} className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--surface-2)] px-4 text-sm font-semibold text-[var(--text-primary)]"><LogOut className="h-4 w-4" />Sign out</button>
    </div>
    {(session.role === 'REP' || session.role === 'SUPER_ADMIN') && <nav aria-label="Role tools" className="mt-6"><ul className="space-y-2"><li><Link href="/my-uploads" className="flex min-h-11 items-center gap-3 rounded-2xl bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-primary)] shadow-[0_1px_3px_var(--shadow)]"><Upload className="h-4 w-4 text-[var(--text-subtle)]" />My uploads</Link></li>{session.role === 'SUPER_ADMIN' && <li><Link href="/admin" className="flex min-h-11 items-center gap-3 rounded-2xl bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text-primary)] shadow-[0_1px_3px_var(--shadow)]"><ShieldCheck className="h-4 w-4 text-[var(--text-subtle)]" />Admin</Link></li>}</ul></nav>}
  </PageShell>;
}
