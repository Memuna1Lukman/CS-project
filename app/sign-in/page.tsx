'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useSession } from '@/components/MockSessionProvider';
import { MOCK_USERS } from '@/lib/mockData';
import type { MockUser } from '@/types/resource';

const EMAIL_DOMAIN = '@st.knust.edu.gh';

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);

  const trimmed = email.trim();
  const isValid = trimmed.toLowerCase().endsWith(EMAIL_DOMAIN) && trimmed.length > EMAIL_DOMAIN.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    // TODO(backend): wire to Auth.js Email provider at /api/auth/* (see Appendix B) —
    // sends a real magic link / OTP to the KNUST mailbox instead of this mock confirmation.
    setSent(true);
  };

  const handleOpenLink = () => {
    const normalized = trimmed.toLowerCase();
    const found = MOCK_USERS.find((u) => u.email.toLowerCase() === normalized);
    // TODO(backend): replace this lookup with a real Auth.js magic-link
    // callback + Prisma User lookup (see design doc §4, Appendix B).
    const user: MockUser = found ?? {
      email: normalized,
      name: normalized.split('@')[0],
      role: 'STUDENT',
      level: 100,
      indexNumber: '',
      status: 'ACTIVE',
    };
    signIn(user);
    router.push('/');
  };

  if (sent) {
    return (
      <PageShell>
        <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[0_2px_6px_var(--shadow)] text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-[var(--text-primary)]" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
            Check your KNUST inbox
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            We sent a sign-in link to <span className="font-medium text-[var(--text-primary)]">{trimmed}</span>.
            Open it on this device to continue.
          </p>

          {/* TODO(backend): demo-only shortcut — remove once Auth.js magic-link
              callback (/api/auth/callback/email) actually completes sign-in. */}
          <button
            type="button"
            onClick={handleOpenLink}
            className="mt-5 w-full min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold"
          >
            Open the link (demo)
          </button>

          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-2.5 w-full min-h-11 px-4 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Use a different email
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[0_2px_6px_var(--shadow)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Sign in</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Sign in with your KNUST student email — no password needed.
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="knust-email"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
          >
            KNUST email
          </label>
          <input
            id="knust-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="yourname@st.knust.edu.gh"
            aria-invalid={touched && !isValid}
            aria-describedby="knust-email-hint"
            className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
          <p
            id="knust-email-hint"
            className={`mt-1.5 text-xs ${
              touched && !isValid ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
            }`}
          >
            Only {EMAIL_DOMAIN} addresses can sign in.
          </p>

          <button
            type="submit"
            className="mt-5 w-full min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
            disabled={touched && !isValid}
          >
            Send magic link
          </button>
        </form>
      </div>
    </PageShell>
  );
}
