'use client';

import { useState } from 'react';
import { BookOpenCheck, MailCheck } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useSession } from '@/components/MockSessionProvider';

const EMAIL_DOMAIN = '@st.knust.edu.gh';

export default function SignInPage() {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = email.trim().toLowerCase().endsWith(EMAIL_DOMAIN) && email.trim().length > EMAIL_DOMAIN.length;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(null);
    if (!valid) { setError(`Use a valid ${EMAIL_DOMAIN} address.`); return; }
    const result = await signIn(email);
    if (!result.ok) setError(result.error ?? 'We could not send the sign-in link.');
    else setSent(true);
  };

  if (sent) return <PageShell><div className="max-w-sm mx-auto mt-6 rounded-3xl bg-[var(--surface)] p-6 text-center shadow-[0_2px_8px_var(--shadow)]"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-subtle)]"><MailCheck className="h-6 w-6" aria-hidden="true" /></div><h1 className="mt-4 text-2xl font-bold text-[var(--text-primary)]">Check your KNUST inbox</h1><p className="mt-2 text-sm text-[var(--text-muted)]">A one-time sign-in link was sent to <strong>{email.trim().toLowerCase()}</strong>. Open it to continue.</p><button type="button" onClick={() => setSent(false)} className="mt-5 min-h-11 w-full rounded-full text-sm font-semibold text-[var(--text-muted)]">Use a different email</button></div></PageShell>;

  return <PageShell><div className="mx-auto mt-6 max-w-sm text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--accent-fg)]"><BookOpenCheck className="h-6 w-6" aria-hidden="true" /></span><p className="mt-3 text-sm font-bold text-[var(--text-primary)]">CS Resource Hub</p></div><div className="mx-auto mt-6 max-w-sm rounded-3xl bg-[var(--surface)] p-6 shadow-[0_2px_8px_var(--shadow)]"><h1 className="text-2xl font-bold text-[var(--text-primary)]">Sign in</h1><p className="mt-1.5 text-sm text-[var(--text-muted)]">Use your KNUST student email. No password is stored.</p><form onSubmit={submit} className="mt-5"><label htmlFor="knust-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">KNUST email</label><input id="knust-email" type="email" autoComplete="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="yourname@st.knust.edu.gh" className="h-11 w-full rounded-xl bg-[var(--surface-2)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--focus)]" /><p className="mt-1.5 text-xs text-[var(--text-muted)]">Only {EMAIL_DOMAIN} addresses can sign in.</p>{error && <p className="mt-2 text-xs text-[var(--text-primary)]" role="alert">{error}</p>}<button type="submit" className="mt-5 min-h-11 w-full rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-fg)]">Send magic link</button></form></div></PageShell>;
}
