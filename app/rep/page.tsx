'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Upload } from 'lucide-react';
import PageShell from '@/components/PageShell';
import StatCard from '@/components/StatCard';
import CourseCard from '@/components/CourseCard';
import UploadResourceDrawer from '@/components/UploadResourceDrawer';
import { useLibrary } from '@/components/LibraryProvider';
import { useRequireRole } from '@/components/SessionProvider';
import type { Course, Semester } from '@/types/resource';

const SEMESTERS: Semester[] = [1, 2];

export default function RepDashboardPage() {
  const { session, permitted } = useRequireRole(['REP']);
  const { courses, resources } = useLibrary();
  const [uploadCourse, setUploadCourse] = useState<Course | null>(null);

  const myLevelCourses = useMemo(() => {
    const myLevels = session?.scopes && session.scopes.length > 0 ? session.scopes : session?.level ? [session.level] : [];
    return courses.filter((c) => myLevels.includes(c.level));
  }, [courses, session]);
  const myUploadCount = useMemo(
    () => resources.filter((r) => r.status === 'ACTIVE' && r.uploadedBy === session?.id).length,
    [resources, session?.id]
  );

  if (!permitted || !session) return null;

  return (
    <PageShell>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {session.level ? `Level ${session.level} — Rep dashboard` : 'Rep dashboard'}
      </h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Upload material for your assigned courses.</p>

      {session.level === null ? (
        <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          You don&apos;t have a level scope assigned yet. A department admin needs to set this
          before you can upload — check back soon.
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full sm:max-w-lg">
            <StatCard label="Your uploads" value={myUploadCount} />
            <StatCard label="Courses in your level" value={myLevelCourses.length} />
          </div>

          <div className="mt-4">
            <Link href="/my-uploads" className="text-sm font-medium text-[var(--text-primary)] underline">
              View / manage all your uploads
            </Link>
          </div>

          {myLevelCourses.length === 0 ? (
            <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
              No courses in your level yet.
            </div>
          ) : (
            SEMESTERS.map((semester) => {
              const inSem = myLevelCourses.filter((c) => c.semester === semester);
              if (inSem.length === 0) return null;
              return (
                <section key={semester} className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Semester {semester}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inSem.map((course) => (
                      <div key={course.code}>
                        <CourseCard course={course} />
                        <button
                          type="button"
                          onClick={() => setUploadCourse(course)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 min-h-9 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
                        >
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          Upload material
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </>
      )}

      {uploadCourse && (
        <UploadResourceDrawer
          course={uploadCourse}
          open={Boolean(uploadCourse)}
          onClose={() => setUploadCourse(null)}
        />
      )}
    </PageShell>
  );
}
