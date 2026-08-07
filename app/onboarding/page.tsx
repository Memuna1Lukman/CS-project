'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { useSession } from '@/components/SessionProvider';
import { useToast } from '@/components/ToastProvider';

export default function OnboardingPage() {
  const router = useRouter();
  const { refresh } = useSession();
  const toast = useToast();
  const [indexNumber, setIndexNumber] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = indexNumber.trim();
  const isValid = /^\d{7}$/.test(trimmed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ indexNumber: trimmed }) });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.error || 'Could not save your index number. Try again.');
        setSubmitting(false);
        return;
      }
      if (body?.levelNotice) toast(body.levelNotice);
      await refresh();
      router.push('/');
    } catch {
      setError('Could not save your index number. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] rounded-3xl p-6 shadow-[0_2px_8px_var(--shadow)]">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Welcome</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Enter your index number so we can route you to the right level.
        </p>

        <form onSubmit={handleSubmit} className="mt-5">
          <label
            htmlFor="index-number"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
          >
            Index number
          </label>
          <input
            id="index-number"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            maxLength={7}
            value={indexNumber}
            onChange={(e) => setIndexNumber(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g. 8412621"
            aria-invalid={touched && !isValid}
            aria-describedby="index-number-error"
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)] tabular-nums"
          />
          {touched && !isValid && (
            <p id="index-number-error" className="mt-1.5 text-xs text-[var(--text-muted)]">
              Enter a valid 7-digit index number.
            </p>
          )}
          {error && (
            <p className="mt-1.5 text-xs text-[var(--text-primary)]" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-5 w-full min-h-11 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
            disabled={(touched && !isValid) || submitting}
          >
            {submitting ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
