'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';
import { useSession } from '@/components/MockSessionProvider';
import type { Level } from '@/types/resource';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateSession } = useSession();
  const [indexNumber, setIndexNumber] = useState('');
  const [level, setLevel] = useState<Level | ''>('');
  const [touched, setTouched] = useState(false);

  const trimmed = indexNumber.trim();
  const isValid = /^\d{6,8}$/.test(trimmed) && level !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    // TODO(backend): PATCH /api/me with { indexNumber } (see Appendix B).
    const result = await updateSession({ indexNumber: trimmed, level: level as Level });
    if (result.ok) router.push('/');
  };

  return (
    <PageShell>
      <div className="max-w-sm mx-auto mt-6 bg-[var(--surface)] rounded-3xl p-6 shadow-[0_2px_8px_var(--shadow)]">
        <div className="mb-5 flex items-center gap-2" aria-label="Onboarding step 1 of 2">
          <span className="h-1.5 flex-1 rounded-full bg-[var(--accent)]" />
          <span className="h-1.5 flex-1 rounded-full bg-[var(--surface-2)]" />
          <span className="ml-1 text-xs font-medium text-[var(--text-muted)]">Step 1 of 2</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Welcome</h1>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Enter your index number so we can route you to the right level.
        </p>
        <p className="mt-3 rounded-2xl bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]">Next, we’ll confirm your library access and course level.</p>

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
              Enter a valid 6–8 digit index number.
            </p>
          )}

          <label htmlFor="student-level" className="mt-4 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Current level</label>
          <select id="student-level" value={level} onChange={(e) => setLevel(Number(e.target.value) as Level)} className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--focus)]">
            <option value="">Select your level</option>
            {[100, 200, 300, 400].map((item) => <option key={item} value={item}>Level {item}</option>)}
          </select>

          <button
            type="submit"
            className="mt-5 w-full min-h-11 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
            disabled={touched && !isValid}
          >
            Continue
          </button>
        </form>
      </div>
    </PageShell>
  );
}
