'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';
import PageShell from '@/components/PageShell';
import FilterPills from '@/components/FilterPills';
import ResourceRow from '@/components/ResourceRow';
import UploadResourceDrawer from '@/components/UploadResourceDrawer';
import RequestMaterialDrawer from '@/components/RequestMaterialDrawer';
import { useLibrary } from '@/components/LibraryProvider';
import { useSession } from '@/components/SessionProvider';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

export default function CourseDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const courseCode = decodeURIComponent(code);

  const { session } = useSession();
  const { courses, resources: allResources } = useLibrary();

  const course = courses.find((c) => c.code.toLowerCase() === courseCode.toLowerCase());
  const resources = useMemo(
    () => allResources.filter((r) => r.courseCode.toLowerCase() === courseCode.toLowerCase() && r.status === 'ACTIVE'),
    [allResources, courseCode]
  );

  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const canUpload =
    Boolean(course) &&
    (session?.role === 'SUPER_ADMIN' ||
      (session?.role === 'REP' && session.level === course?.level));

  const typeOptions = useMemo(
    () => Array.from(new Set(resources.map((r) => RESOURCE_TYPE_LABELS[r.type]))),
    [resources]
  );
  const yearOptions = useMemo(
    () =>
      Array.from(new Set(resources.flatMap((r) => (r.academicYear ? [r.academicYear] : []))))
        .sort()
        .reverse(),
    [resources]
  );

  const filteredResources = useMemo(
    () =>
      resources.filter(
        (r) =>
          (!typeFilter || RESOURCE_TYPE_LABELS[r.type] === typeFilter) &&
          (!yearFilter || r.academicYear === yearFilter)
      ),
    [resources, typeFilter, yearFilter]
  );

  if (!course) {
    return (
      <PageShell>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Link>
        <div className="text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          Course not found or not in your level scope.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Link>
        {canUpload && (
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-10 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload material
          </button>
        )}
      </div>

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
        {filteredResources.length ? (
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
        <button
          type="button"
          onClick={() => setRequestOpen(true)}
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

      <RequestMaterialDrawer
        courseCode={course.code}
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
      />
    </PageShell>
  );
}

