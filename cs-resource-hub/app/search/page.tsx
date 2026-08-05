'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/PageShell';
import CourseCard from '@/components/CourseCard';
import ResourceRow from '@/components/ResourceRow';
import { ApiCourse, ApiResource } from '@/types/resource';

export default function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void searchParams.then(({ q }) => {
      const value = q?.trim() ?? ''; setQuery(value);
      if (value.length < 2) return;
      setLoading(true); setError(null);
      fetch(`/api/search?q=${encodeURIComponent(value)}`).then(async (response) => {
        const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Search failed.');
        setCourses(data.courses); setResources(data.resources);
      }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Search failed.')).finally(() => setLoading(false));
    });
  }, [searchParams]);

  return <PageShell><h1 className="text-2xl font-bold text-[var(--text-primary)]">Search</h1>{query.length < 2 ? <p className="mt-2 text-sm text-[var(--text-muted)]">Enter at least two characters in the search bar to find courses and materials.</p> : loading ? <p className="mt-6 text-sm text-[var(--text-muted)]">Searching…</p> : error ? <p className="mt-6 text-sm text-[var(--text-muted)]">{error}</p> : <div className="mt-6 space-y-8"><section><h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Courses</h2>{courses.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{courses.map((course) => <CourseCard key={course.id} course={course} />)}</div> : <p className="text-sm text-[var(--text-muted)]">No matching courses.</p>}</section><section><h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Resources</h2>{resources.length ? <div className="space-y-2">{resources.map((resource) => <div key={resource.id}><ResourceRow resource={resource} /><Link href={`/courses/${encodeURIComponent(resource.course?.code ?? '')}`} className="ml-3 text-xs text-[var(--text-muted)] underline">{resource.course?.code} · {resource.course?.title}</Link></div>)}</div> : <p className="text-sm text-[var(--text-muted)]">No matching resources.</p>}</section></div>}</PageShell>;
}
