'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import PageShell from '@/components/PageShell';

export default function SignInPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState<string | null>(null); const [submitting, setSubmitting] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setMessage(null); const normalized = email.trim().toLowerCase(); if (!normalized.endsWith('@st.knust.edu.gh')) { setMessage('Use your @st.knust.edu.gh student email address.'); return; } setSubmitting(true); const result = await signIn('email', { email: normalized, callbackUrl: '/' }); setSubmitting(false); setMessage(result?.error ? 'We could not send the sign-in link. Please try again.' : 'Check your student email for your secure sign-in link.'); };
  return <PageShell><div className="max-w-md"><h1 className="text-2xl font-bold text-[var(--text-primary)]">Sign in</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Use your KNUST student email. We&apos;ll send a password-free sign-in link.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold text-[var(--text-primary)]" htmlFor="email">Student email</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@st.knust.edu.gh" className="w-full min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--text-primary)]" /><button disabled={submitting} className="min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold disabled:opacity-60">{submitting ? 'Sending…' : 'Email me a sign-in link'}</button>{message && <p role="status" className="text-sm text-[var(--text-muted)]">{message}</p>}</form></div></PageShell>;
}
