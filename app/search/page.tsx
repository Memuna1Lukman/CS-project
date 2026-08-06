'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import PageShell from '@/components/PageShell';
import CourseCard from '@/components/CourseCard';
import ResourceRow from '@/components/ResourceRow';
import { useLibrary } from '@/components/MockLibraryProvider';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

function ResultTag({
  code,
  level,
  semester,
}: {
  code: string;
  level: number;
  semester: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-subtle)]">
        {code}
      </span>
      <span className="text-[11px] text-[var(--text-muted)]">
        Level {level} · Semester {semester}
      </span>
    </div>
  );
}

// TODO(backend): wire to GET /api/courses + GET /api/courses/:code/resources
// (structured search over course code/title, resource title/type/year — see Appendix B)
export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const { courses, resources } = useLibrary();
  const [query, setQuery] = useState(q);

  // Keep the input in sync when arriving/navigating with a new ?q= (e.g. the
  // TopBar search), without clobbering further typing on this page.
  useEffect(() => {
    setQuery(q);
  }, [q]);

  const trimmed = query.trim().toLowerCase();

  const matchedCourses = useMemo(() => {
    if (!trimmed) return [];
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(trimmed) || c.title.toLowerCase().includes(trimmed)
    );
  }, [courses, trimmed]);

  const matchedResources = useMemo(() => {
    if (!trimmed) return [];
    return resources.filter(
      (r) =>
        r.status === 'ACTIVE' &&
        (r.title.toLowerCase().includes(trimmed) ||
          r.courseCode.toLowerCase().includes(trimmed) ||
          r.courseTitle.toLowerCase().includes(trimmed))
    );
  }, [resources, trimmed]);

  const hasQuery = trimmed.length > 0;
  const hasResults = matchedCourses.length > 0 || matchedResources.length > 0;
  const suggestions = ['Past questions', 'Slides', 'Level 200'];

  return (
    <PageShell>
      <PageHeader eyebrow="Resource library" title="Search" description="Find courses and study materials by code, title, or resource type." />

      <form role="search" className="mt-4" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-page-input" className="sr-only">
          Search courses and resources
        </label>
        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            id="search-page-input"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course code, title, or resource..."
            className="w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] shadow-[0_1px_2px_var(--shadow)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>
      </form>

      {!hasQuery && (
        <div className="mt-6 rounded-3xl bg-[var(--surface)] p-5 shadow-[0_1px_3px_var(--shadow)]">
          <p className="text-sm text-[var(--text-muted)]">Start typing to search across courses and resources, or try a shortcut.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)} className="min-h-10 rounded-full bg-[var(--surface-2)] px-4 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-3)]">
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && !hasResults && (
        <div className="mt-6"><EmptyState icon={SearchIcon} title={`No matches for “${query}”`} description="Try a broader term, or clear the search and use one of the shortcuts." action={<button type="button" onClick={() => setQuery('')} className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-fg)]">Clear search</button>} /></div>
      )}

      {hasQuery && matchedCourses.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Courses <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-primary)]">{matchedCourses.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedCourses.map((course) => (
              <div key={course.code}>
                <ResultTag code={course.code} level={course.level} semester={course.semester} />
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        </section>
      )}

      {hasQuery && matchedResources.length > 0 && (
        <section className="mt-6">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Resources <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-primary)]">{matchedResources.length}</span>
          </h2>
          <div className="space-y-3">
            {matchedResources.map((resource) => (
              <div key={resource.id}>
                <ResultTag
                  code={resource.courseCode}
                  level={resource.level}
                  semester={resource.semester}
                />
                <ResourceRow resource={resource} />
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}
