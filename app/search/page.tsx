'use client';

import { use, useMemo, useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import PageShell from '@/components/PageShell';
import CourseCard from '@/components/CourseCard';
import ResourceRow from '@/components/ResourceRow';
import { useLibrary } from '@/components/MockLibraryProvider';

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
      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-subtle)]">
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
export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = use(searchParams);
  const { courses, resources } = useLibrary();
  const [query, setQuery] = useState(q ?? '');

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

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Search</h1>

      <form role="search" className="mt-4" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="search-page-input" className="sr-only">
          Search courses and resources
        </label>
        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
          <input
            id="search-page-input"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course code, title, or resource..."
            className="w-full h-11 pl-9 pr-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>
      </form>

      {!hasQuery && (
        <p className="mt-6 text-sm text-[var(--text-muted)]">
          Start typing to search across courses and resources.
        </p>
      )}

      {hasQuery && !hasResults && (
        <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          No matches for &quot;{query}&quot;.
        </div>
      )}

      {hasQuery && matchedCourses.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Courses ({matchedCourses.length})
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Resources ({matchedResources.length})
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
