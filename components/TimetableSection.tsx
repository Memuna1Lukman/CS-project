'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CalendarClock, ExternalLink, Plus, Sparkles, Trash2 } from 'lucide-react';
import { api } from '@/lib/clientApi';
import { useToast } from './ToastProvider';
import type { Course } from '@/types/resource';

type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

interface ClassSessionDto {
  id: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string | null;
  lecturer: string | null;
  sourceResourceId: number | null;
}

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
};

const EXTRACT_COOLDOWN_MS = 5 * 60 * 1000;
const EMPTY_ROW = { dayOfWeek: 'MON' as DayOfWeek, startTime: '09:00', endTime: '10:00', room: '', lecturer: '' };

function formatTime12h(time: string): string {
  const [hourStr, minute] = time.split(':');
  const hour = Number(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

function sortByDayThenTime(a: ClassSessionDto, b: ClassSessionDto) {
  const dayDiff = DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
  return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
}

export default function TimetableSection({ course, canUpload }: { course: Course; canUpload: boolean }) {
  const toast = useToast();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [published, setPublished] = useState<ClassSessionDto[]>([]);
  const [draft, setDraft] = useState<ClassSessionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [newRow, setNewRow] = useState(EMPTY_ROW);
  const [addingRow, setAddingRow] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPublished(await api<ClassSessionDto[]>(`/api/courses/${encodeURIComponent(course.code)}/timetable`));
    } catch {
      setError('Could not load the timetable right now.');
    }
    if (canUpload) {
      try {
        setDraft(await api<ClassSessionDto[]>(`/api/courses/${encodeURIComponent(course.code)}/timetable?status=draft`));
      } catch {
        // Published section already loaded/reported — a queue-fetch failure
        // shouldn't block the student-facing part of the page.
      }
    }
    setLoading(false);
  }, [course.code, canUpload]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!cooldownUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const cooldownRemaining = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0;

  const groupedPublished = useMemo(() => {
    const byDay = new Map<DayOfWeek, ClassSessionDto[]>();
    for (const session of [...published].sort(sortByDayThenTime)) {
      const list = byDay.get(session.dayOfWeek) ?? [];
      list.push(session);
      byDay.set(session.dayOfWeek, list);
    }
    return DAYS.filter((day) => byDay.has(day)).map((day) => ({ day, sessions: byDay.get(day)! }));
  }, [published]);

  const sourceResourceIds = useMemo(
    () => Array.from(new Set(published.map((s) => s.sourceResourceId).filter((id): id is number => id !== null))),
    [published]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || extracting || cooldownRemaining > 0) return;

    setExtracting(true);
    try {
      const formData = new FormData();
      formData.set('file', file);
      const result = await api<{ created: number; message?: string }>(
        `/api/courses/${encodeURIComponent(course.code)}/timetable/extract`,
        { method: 'POST', body: formData }
      );
      setCooldownUntil(Date.now() + EXTRACT_COOLDOWN_MS);
      setNow(Date.now());
      if (result.created === 0) {
        toast(result.message ?? "Couldn't confidently read this timetable — add sessions manually below.", 'error');
      } else {
        toast(`Read ${result.created} session${result.created === 1 ? '' : 's'} — review and publish below.`);
      }
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't read this timetable — try a clearer photo or enter manually.", 'error');
      setCooldownUntil(Date.now() + EXTRACT_COOLDOWN_MS);
      setNow(Date.now());
    } finally {
      setExtracting(false);
    }
  };

  const patchRow = async (id: number, patch: Partial<Omit<ClassSessionDto, 'id' | 'sourceResourceId'>>) => {
    setDraft((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    try {
      await api(`/api/timetable/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save that change.', 'error');
      await load();
    }
  };

  const deleteRow = async (id: number) => {
    const previous = draft;
    setDraft((rows) => rows.filter((r) => r.id !== id));
    try {
      await api(`/api/timetable/${id}`, { method: 'DELETE' });
    } catch (err) {
      setDraft(previous);
      toast(err instanceof Error ? err.message : 'Could not delete that row.', 'error');
    }
  };

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addingRow) return;
    if (newRow.endTime <= newRow.startTime) {
      toast('End time must be after start time.', 'error');
      return;
    }
    setAddingRow(true);
    try {
      const created = await api<ClassSessionDto>(`/api/courses/${encodeURIComponent(course.code)}/timetable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: newRow.dayOfWeek,
          startTime: newRow.startTime,
          endTime: newRow.endTime,
          room: newRow.room.trim() || undefined,
          lecturer: newRow.lecturer.trim() || undefined,
        }),
      });
      setDraft((rows) => [...rows, created]);
      setNewRow(EMPTY_ROW);
      toast('Session added — review and publish below.');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not add that session.', 'error');
    } finally {
      setAddingRow(false);
    }
  };

  const handlePublish = async () => {
    if (publishing || draft.length === 0) return;
    setPublishing(true);
    try {
      const result = await api<{ published: number }>(`/api/courses/${encodeURIComponent(course.code)}/timetable/publish`, {
        method: 'POST',
      });
      toast(`Published ${result.published} session${result.published === 1 ? '' : 's'} — now visible to students.`);
      await load();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not publish the timetable.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const uploadLabel = extracting ? 'Reading timetable…' : cooldownRemaining > 0 ? `Wait ${cooldownRemaining}s` : 'Upload timetable';
  const inputClass =
    'h-11 sm:h-9 px-2.5 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus)]';

  return (
    <section className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Class Timetable</h2>
        {canUpload && (
          <div className="flex items-center gap-2">
            <label htmlFor={fileInputId} className="sr-only">
              Upload timetable image or PDF
            </label>
            <input
              id={fileInputId}
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="sr-only"
              disabled={extracting || cooldownRemaining > 0}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting || cooldownRemaining > 0}
              aria-live="polite"
              className="inline-flex items-center gap-1.5 min-h-11 sm:min-h-9 px-3.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              {uploadLabel}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-[var(--text-muted)] mb-3" role="alert">
          {error}
        </p>
      )}

      {canUpload && draft.length > 0 && (
        <div className="mb-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-semibold text-[var(--text-primary)]">Review before publishing ({draft.length})</p>
          <p className="mt-0.5 mb-3 text-[11px] text-[var(--text-subtle)]">
            AI-read from the uploaded file — check and correct every row before it goes live to students.
          </p>

          <div className="space-y-2">
            {draft.map((row) => (
              <div key={row.id} className="rounded-xl bg-[var(--surface-2)] p-2.5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <select
                    aria-label="Day"
                    value={row.dayOfWeek}
                    onChange={(e) => patchRow(row.id, { dayOfWeek: e.target.value as DayOfWeek })}
                    className={inputClass}
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {DAY_LABELS[day]}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Start time"
                    type="time"
                    value={row.startTime}
                    onChange={(e) => patchRow(row.id, { startTime: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    aria-label="End time"
                    type="time"
                    value={row.endTime}
                    onChange={(e) => patchRow(row.id, { endTime: e.target.value })}
                    className={inputClass}
                  />
                  <input
                    aria-label="Room"
                    type="text"
                    placeholder="Room"
                    value={row.room ?? ''}
                    onChange={(e) => setDraft((rows) => rows.map((r) => (r.id === row.id ? { ...r, room: e.target.value } : r)))}
                    onBlur={(e) => patchRow(row.id, { room: e.target.value || null })}
                    className={inputClass}
                  />
                  <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                    <input
                      aria-label="Lecturer"
                      type="text"
                      placeholder="Lecturer"
                      value={row.lecturer ?? ''}
                      onChange={(e) => setDraft((rows) => rows.map((r) => (r.id === row.id ? { ...r, lecturer: e.target.value } : r)))}
                      onBlur={(e) => patchRow(row.id, { lecturer: e.target.value || null })}
                      className={`${inputClass} flex-1 min-w-0`}
                    />
                    <button
                      type="button"
                      onClick={() => deleteRow(row.id)}
                      aria-label="Delete this session"
                      className="shrink-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface-3)] active:bg-[var(--surface-3)]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddRow} className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Add a session manually</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <select
                aria-label="Day"
                value={newRow.dayOfWeek}
                onChange={(e) => setNewRow((r) => ({ ...r, dayOfWeek: e.target.value as DayOfWeek }))}
                className={inputClass}
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {DAY_LABELS[day]}
                  </option>
                ))}
              </select>
              <input
                aria-label="Start time"
                type="time"
                value={newRow.startTime}
                onChange={(e) => setNewRow((r) => ({ ...r, startTime: e.target.value }))}
                className={inputClass}
              />
              <input
                aria-label="End time"
                type="time"
                value={newRow.endTime}
                onChange={(e) => setNewRow((r) => ({ ...r, endTime: e.target.value }))}
                className={inputClass}
              />
              <input
                aria-label="Room"
                type="text"
                placeholder="Room"
                value={newRow.room}
                onChange={(e) => setNewRow((r) => ({ ...r, room: e.target.value }))}
                className={inputClass}
              />
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                <input
                  aria-label="Lecturer"
                  type="text"
                  placeholder="Lecturer"
                  value={newRow.lecturer}
                  onChange={(e) => setNewRow((r) => ({ ...r, lecturer: e.target.value }))}
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <button
                  type="submit"
                  disabled={addingRow}
                  aria-label="Add session"
                  className="shrink-0 w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="mt-3 w-full min-h-11 sm:min-h-9 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
          >
            {publishing ? 'Publishing…' : `Publish ${draft.length} session${draft.length === 1 ? '' : 's'} to students`}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-pulse" />
          ))}
        </div>
      ) : groupedPublished.length === 0 ? (
        <div className="text-center py-8 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          No timetable published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {sourceResourceIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sourceResourceIds.map((id) => (
                <a
                  key={id}
                  href={`/api/resources/${id}/download`}
                  className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full bg-[var(--surface-2)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  View original file
                </a>
              ))}
            </div>
          )}

          {groupedPublished.map(({ day, sessions }) => (
            <div key={day}>
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)] mb-2">
                <CalendarClock className="w-3.5 h-3.5" aria-hidden="true" />
                {DAY_LABELS[day]}
              </h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-3.5 py-3 shadow-[0_1px_2px_var(--shadow)]"
                  >
                    <div className="shrink-0 w-24 text-xs font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatTime12h(session.startTime)}
                      <span className="block text-[10px] font-normal text-[var(--text-subtle)]">
                        – {formatTime12h(session.endTime)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 border-l border-[var(--border)] pl-3">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {session.room || 'Room TBA'}
                      </p>
                      {(session.lecturer || course.lecturer) && (
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {session.lecturer || course.lecturer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
