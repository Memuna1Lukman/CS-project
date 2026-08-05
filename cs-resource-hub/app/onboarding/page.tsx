'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';

export default function OnboardingPage() {
  const router = useRouter(); const [indexNumber, setIndexNumber] = useState(''); const [message, setMessage] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setMessage(null); const response = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ indexNumber }) }); const data = await response.json(); if (!response.ok) { setMessage(data.error ?? 'Could not save your profile.'); return; } router.push('/'); };
  return <PageShell><div className="max-w-md"><h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Add your index number to complete your profile and help us tailor the library to your level.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-[var(--text-primary)]" htmlFor="index-number">Index number</label><input id="index-number" required minLength={5} maxLength={40} value={indexNumber} onChange={(event) => setIndexNumber(event.target.value)} className="w-full min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text-primary)]" /><button className="min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold">Save and browse</button>{message && <p role="alert" className="text-sm text-[var(--text-muted)]">{message}</p>}</form></div></PageShell>;
}
