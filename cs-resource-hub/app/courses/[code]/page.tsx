'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FilterPills from '@/components/FilterPills';
import ResourceRow from '@/components/ResourceRow';
import { ApiCourse, ApiResource } from '@/types/resource';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

export default function CourseDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const courseCode = decodeURIComponent(code);
  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [note, setNote] = useState('');
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [courseResponse, resourcesResponse] = await Promise.all([
        fetch(`/api/courses/${encodeURIComponent(courseCode)}`),
        fetch(`/api/courses/${encodeURIComponent(courseCode)}/resources`),
      ]);
      const [courseData, resourcesData] = await Promise.all([courseResponse.json(), resourcesResponse.json()]);
      if (!courseResponse.ok) throw new Error(courseData.error ?? 'Could not load this course.');
      if (!resourcesResponse.ok) throw new Error(resourcesData.error ?? 'Could not load resources.');
      setCourse(courseData); setResources(resourcesData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load this course.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [courseCode]);

  const typeOptions = useMemo(() => Array.from(new Set(resources.map((r) => RESOURCE_TYPE_LABELS[r.type]))), [resources]);
  const yearOptions = useMemo(() => Array.from(new Set(resources.flatMap((r) => r.academicYear ? [r.academicYear] : []))).sort().reverse(), [resources]);
  const filteredResources = resources.filter((r) => (!typeFilter || RESOURCE_TYPE_LABELS[r.type] === typeFilter) && (!yearFilter || r.academicYear === yearFilter));

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault(); setRequestStatus(null);
    const response = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseCode, note }) });
    const data = await response.json();
    if (!response.ok) { setRequestStatus(data.error ?? 'Could not submit your request.'); return; }
    setNote(''); setRequestOpen(false); setRequestStatus('Your request has been sent to the course reps.');
  };

  if (loading) return <PageShell><p className="text-sm text-[var(--text-muted)]">Loading course…</p></PageShell>;
  if (error || !course) return <PageShell><p className="text-sm text-[var(--text-muted)]">{error ?? 'Course not found.'}</p><button type="button" onClick={() => void load()} className="mt-3 min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold">Try again</button></PageShell>;

  return (
    <PageShell>
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6"><ArrowLeft className="w-4 h-4" /> Back to library</Link>
      <header>
        <span className="inline-block font-mono text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">{course.code}</span>
        <h1 className="mt-2.5 text-xl font-bold text-[var(--text-primary)] leading-snug">{course.title}</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{course.lecturer ? `${course.lecturer} · ` : ''}Level {course.level} · Semester {course.semester}</p>
      </header>
      <div className="mt-6 space-y-2.5"><FilterPills label="Type" options={typeOptions} active={typeFilter} onChange={setTypeFilter} /><FilterPills label="Year" options={yearOptions} active={yearFilter} onChange={setYearFilter} /></div>
      <div className="mt-5 space-y-2">{filteredResources.length ? filteredResources.map((resource) => <ResourceRow key={resource.id} resource={resource} />) : <div className="text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">No resources match these filters.</div>}</div>
      <div className="mt-6 pt-5 border-t border-[var(--border)]">
        {requestStatus && <p className="mb-3 text-sm text-[var(--text-muted)]" role="status">{requestStatus}</p>}
        {requestOpen ? <form onSubmit={submitRequest} className="space-y-3"><label className="block text-sm font-semibold text-[var(--text-primary)]" htmlFor="request-note">What material are you looking for?</label><textarea id="request-note" required minLength={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text-primary)]" /><div className="flex gap-2"><button className="min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold">Send request</button><button type="button" onClick={() => setRequestOpen(false)} className="min-h-11 px-4 rounded-lg border border-[var(--border)] text-[var(--text-primary)]">Cancel</button></div></form> : <button type="button" onClick={() => setRequestOpen(true)} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline">Can&apos;t find what you&apos;re looking for? Request material</button>}
      </div>
    </PageShell>
  );
}
