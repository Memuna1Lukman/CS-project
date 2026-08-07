'use client';

import { useState } from 'react';
import Drawer from './Drawer';
import { useLibrary } from './MockLibraryProvider';

export default function RequestMaterialDrawer({
  courseCode,
  open,
  onClose,
}: {
  courseCode: string;
  open: boolean;
  onClose: () => void;
}) {
  const { addRequest } = useLibrary();
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = note.trim().length > 0;

  const reset = () => {
    setNote('');
    setTouched(false);
    setSubmitted(false);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    // TODO(backend): POST /api/requests with { courseCode, note }
    const result = await addRequest({ courseCode, note: note.trim() });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <Drawer open={open} onClose={handleClose} title={`Request material for ${courseCode}`}>
      {submitted ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-primary)]">
            Thanks — your request has been sent to the admins.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-11 px-4 rounded-full bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] text-sm font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="request-note"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
            >
              What are you looking for?
            </label>
            <textarea
              id="request-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 2023/2024 past questions"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
            />
            {touched && !isValid && (
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">Please describe what you need.</p>
            )}
            {error && (
              <p className="mt-1.5 text-xs text-[var(--text-primary)]" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-11 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold"
          >
            Send request
          </button>
        </form>
      )}
    </Drawer>
  );
}
