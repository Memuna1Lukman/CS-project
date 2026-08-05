'use client';

import { useEffect, useState } from 'react';
import PageShell from '@/components/PageShell';

type MaterialRequest = { id: number; courseCode: string | null; note: string; status: 'OPEN' | 'FULFILLED' | 'DISMISSED'; createdAt: string };
export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]); const [message, setMessage] = useState<string | null>(null);
  const load = async () => { const response = await fetch('/api/requests'); const data = await response.json(); if (!response.ok) { setMessage(data.error ?? 'Could not load requests.'); return; } setRequests(data); };
  useEffect(() => { void load(); }, []);
  const update = async (id: number, status: MaterialRequest['status']) => { const response = await fetch(`/api/requests/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); const data = await response.json(); if (!response.ok) { setMessage(data.error ?? 'Could not update request.'); return; } void load(); };
  return <PageShell><h1 className="text-2xl font-bold text-[var(--text-primary)]">Material requests</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Requests from students for material that is missing from the library.</p>{message && <p role="alert" className="mt-4 text-sm text-[var(--text-muted)]">{message}</p>}<div className="mt-6 space-y-3">{requests.length ? requests.map((request) => <article key={request.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="flex justify-between gap-3"><div><p className="font-mono text-xs text-[var(--text-muted)]">{request.courseCode ?? 'No course specified'}</p><p className="mt-1 text-sm text-[var(--text-primary)]">{request.note}</p></div><span className="h-fit rounded-full bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold text-[var(--text-muted)]">{request.status.toLowerCase()}</span></div><div className="mt-3 flex gap-2"><button onClick={() => void update(request.id, 'FULFILLED')} className="min-h-11 px-3 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold">Fulfilled</button><button onClick={() => void update(request.id, 'DISMISSED')} className="min-h-11 px-3 rounded-lg border border-[var(--border)] text-sm text-[var(--text-primary)]">Dismiss</button></div></article>) : <p className="text-sm text-[var(--text-muted)]">No material requests yet.</p>}</div></PageShell>;
}
