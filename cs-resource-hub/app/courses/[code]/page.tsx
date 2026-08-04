'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FilterPills from '@/components/FilterPills';
import ResourceRow from '@/components/ResourceRow';
import { MOCK_COURSES, MOCK_RESOURCES } from '@/lib/mockData';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

// TODO(backend): GET /api/courses/:code for the header, GET
// /api/courses/:code/resources?type=&year= for the list below (server-side
// filtering instead of the client-side filter used here on mock data).
export default function CourseDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const courseCode = decodeURIComponent(code);

  const course = MOCK_COURSES.find((c) => c.code === courseCode);
  const resources = useMemo(
    () => MOCK_RESOURCES.filter((r) => r.courseCode === courseCode),
    [courseCode]
  );

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);

  const typeOptions = useMemo(
    () => Array.from(new Set(resources.map((r) => RESOURCE_TYPE_LABELS[r.type]))),
    [resources]
  );
  const yearOptions = useMemo(
    () => Array.from(new Set(resources.map((r) => r.academicYear))).sort().reverse(),
    [resources]
  );

  const filteredResources = resources.filter((r) => {
    if (typeFilter && RESOURCE_TYPE_LABELS[r.type] !== typeFilter) return false;
    if (yearFilter && r.academicYear !== yearFilter) return false;
    return true;
  });

  if (!course) {
    return (
      <PageShell>
        <p className="text-sm text-[var(--text-muted)]">Course not found.</p>
        <Link href="/" className="text-sm font-medium text-[var(--text-primary)] underline mt-2 inline-block">
          Back to library
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to library
      </Link>

      <header>
        <span className="inline-block font-mono text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
          {course.code}
        </span>
        <h1 className="mt-2.5 text-xl font-bold text-[var(--text-primary)] leading-snug">
          {course.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {course.lecturer ? `${course.lecturer} · ` : ''}Level {course.level} · Semester {course.semester}
        </p>
      </header>

      <div className="mt-6 space-y-2.5">
        <FilterPills label="Type" options={typeOptions} active={typeFilter} onChange={setTypeFilter} />
        <FilterPills label="Year" options={yearOptions} active={yearFilter} onChange={setYearFilter} />
      </div>

      <div className="mt-5 space-y-2">
        {filteredResources.length > 0 ? (
          filteredResources.map((resource) => (
            <ResourceRow key={resource.id} resource={resource} />
          ))
        ) : (
          <div className="text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
            No resources match these filters.
          </div>
        )}
      </div>

      <div className="mt-6 pt-5 border-t border-[var(--border)]">
        {/* TODO(backend): POST /api/requests with { courseCode, note } */}
        <button
          type="button"
          onClick={() => {}}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
        >
          Can&apos;t find what you&apos;re looking for? Request material
        </button>
      </div>
    </PageShell>
  );
}
