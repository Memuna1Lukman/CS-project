'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import PageShell from '@/components/PageShell';

type Profile = { name: string | null; email: string; role: string; indexNumber: string | null; scopes: { level: number }[] };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null); const [error, setError] = useState<string | null>(null);
  useEffect(() => { fetch('/api/me').then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Could not load profile.'); setProfile(data); }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Could not load profile.')); }, []);
  if (error) return <PageShell><p className="text-sm text-[var(--text-muted)]">{error}</p><Link href="/sign-in" className="mt-3 inline-flex min-h-11 items-center px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold">Sign in</Link></PageShell>;
  if (!profile) return <PageShell><p className="text-sm text-[var(--text-muted)]">Loading profile…</p></PageShell>;
  const canUpload = profile.role === 'REP' || profile.role === 'SUPER_ADMIN';
  return <PageShell><div className="max-w-md"><h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile</h1><dl className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4"><div className="py-3"><dt className="text-xs font-semibold uppercase text-[var(--text-muted)]">Email</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{profile.email}</dd></div><div className="py-3"><dt className="text-xs font-semibold uppercase text-[var(--text-muted)]">Index number</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{profile.indexNumber ?? 'Not added'}</dd></div><div className="py-3"><dt className="text-xs font-semibold uppercase text-[var(--text-muted)]">Access</dt><dd className="mt-1 text-sm text-[var(--text-primary)]">{profile.role.replace('_', ' ')}{profile.scopes.length ? ` · Levels ${profile.scopes.map((scope) => scope.level).join(', ')}` : ''}</dd></div></dl><div className="mt-5 flex flex-wrap gap-3">{!profile.indexNumber && <Link href="/onboarding" className="min-h-11 inline-flex items-center px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold">Add index number</Link>}{canUpload && <Link href="/my-uploads" className="min-h-11 inline-flex items-center px-4 rounded-lg border border-[var(--border)] text-[var(--text-primary)] font-semibold">My uploads</Link>}{profile.role === 'SUPER_ADMIN' && <Link href="/admin" className="min-h-11 inline-flex items-center px-4 rounded-lg border border-[var(--border)] text-[var(--text-primary)] font-semibold">Admin</Link>}<button type="button" onClick={() => void signOut({ callbackUrl: '/sign-in' })} className="min-h-11 px-4 rounded-lg border border-[var(--border)] text-[var(--text-primary)] font-semibold">Sign out</button></div></div></PageShell>;
}
