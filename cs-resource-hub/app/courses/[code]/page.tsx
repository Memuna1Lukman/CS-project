'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FilterPills from '@/components/FilterPills';
import ResourceRow from '@/components/ResourceRow';
import UploadResourceDrawer from '@/components/UploadResourceDrawer';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useSession } from '@/components/MockSessionProvider';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

// TODO(backend): GET /api/courses/:code for the header, GET
// /api/courses/:code/resources?type=&year= for the list below (server-side
// filtering instead of the client-side filter used here on mock data).
export default function CourseDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const courseCode = decodeURIComponent(code);
  const { session } = useSession();
  const { courses, resources: allResources } = useLibrary();
  const [uploadOpen, setUploadOpen] = useState(false);

  const course = courses.find((c) => c.code === courseCode);
  const resources = useMemo(
    () => allResources.filter((r) => r.courseCode === courseCode && r.status === 'ACTIVE'),
    [allResources, courseCode]
  );

  // Real scope check (design doc §3): a rep can only write within the
  // level(s) they're assigned — never trust the client for real enforcement,
  // but this mirrors what the eventual server-side check will gate.
  const canUpload = Boolean(
    session && course && session.role === 'REP' && session.level === course.level
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

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-block font-mono text-[11px] font-semibold px-2 py-1 rounded-md bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
            {course.code}
          </span>
          <h1 className="mt-2.5 text-xl font-bold text-[var(--text-primary)] leading-snug">
            {course.title}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {course.lecturer ? `${course.lecturer} · ` : ''}Level {course.level} · Semester {course.semester}
          </p>
        </div>

        {canUpload && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="shrink-0 flex items-center gap-1.5 min-h-11 px-3.5 rounded-lg text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
          >
            <Upload className="w-3.5 h-3.5" aria-hidden="true" />
            Upload material
          </button>
        )}
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

      {canUpload && (
        <UploadResourceDrawer
          course={course}
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </PageShell>
  );
}
