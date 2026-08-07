'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import PageShell from '@/components/PageShell';

const EMAIL_DOMAIN = '@st.knust.edu.gh';
// TEMPORARY(dev-only): mirrors the gmail.com allowance in lib/auth.ts so the
// form doesn't block testing email delivery. Remove before deployment.
const ALLOWED_EMAIL_DOMAINS = [EMAIL_DOMAIN, '@gmail.com'];

// NextAuth redirects back to this page (pages.signIn in lib/auth.ts doubles
// as the error page) with ?error=<code> when the magic link fails to verify.
const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  Verification:
    'That link expired, was already used, or was opened automatically by your email app before you clicked it. Request a new one below.',
  AccessDenied: 'Sign-in was denied for that address. Use your KNUST student email.',
  Configuration: 'Sign-in is temporarily misconfigured. Try again shortly.',
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const [inactiveError, setInactiveError] = useState(false);

  const trimmed = email.trim();
  const lower = trimmed.toLowerCase();
  const isValid = ALLOWED_EMAIL_DOMAINS.some((domain) => lower.endsWith(domain) && trimmed.length > domain.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    const result = await signIn('email', { email: trimmed.toLowerCase(), callbackUrl: '/', redirect: false });
    setInactiveError(Boolean(result?.error));
    setSent(!result?.error);
  };

  if (sent) {
    return (
      <PageShell>
        <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] rounded-3xl p-6 shadow-[0_2px_8px_var(--shadow)] text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-[var(--text-primary)]" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Check your KNUST inbox
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            We sent a sign-in link to <span className="font-medium text-[var(--text-primary)]">{trimmed}</span>.
            Open it on this device to continue.
          </p>

          {inactiveError && (
            <p className="mt-4 text-sm text-[var(--text-primary)]" role="alert">
              This account has been deactivated. Contact a department admin if you believe
              this is a mistake.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setInactiveError(false);
            }}
            className="mt-2.5 w-full min-h-11 px-4 rounded-full text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            Use a different email
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] rounded-3xl p-6 shadow-[0_2px_8px_var(--shadow)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Sign in</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Sign in with your KNUST student email — no password needed.
        </p>

        {callbackError && (
          <p className="mt-4 text-sm text-[var(--text-primary)] bg-[var(--surface-2)] rounded-xl px-3 py-2.5" role="alert">
            {CALLBACK_ERROR_MESSAGES[callbackError] ?? 'That sign-in link didn\'t work. Request a new one below.'}
          </p>
        )}

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
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
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
            className="mt-5 w-full min-h-11 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
            disabled={touched && !isValid}
          >
            Send magic link
          </button>
        </form>
      </div>
    </PageShell>
  );
}
