'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import CourseCard from '@/components/CourseCard';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { CourseGridSkeleton } from '@/components/LoadingSkeletons';
import RecentMaterialCard from '@/components/RecentMaterialCard';
import { Level, Semester } from '@/types/resource';
import { useSession } from '@/components/MockSessionProvider';
import { useLibrary } from '@/components/MockLibraryProvider';

export default function LibraryPage() {
  const { session } = useSession();
  const { courses, resources, isLoading } = useLibrary();
  const isAdmin = session?.role === 'SUPER_ADMIN';
  const [adminLevel, setAdminLevel] = useState<Level>(session?.level ?? 100);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only super-admins can switch levels (design doc §3: student/rep reads are
  // locked to their own level). Re-sync the admin switcher's default when the
  // underlying level changes (e.g. the demo role switcher on /profile).
  useEffect(() => {
    if (session) setAdminLevel(session.level);
  }, [session?.level]);

  const activeLevel: Level = isAdmin ? adminLevel : session?.level ?? 100;

  const coursesByLevel = useMemo(
    () => courses.filter((course) => course.level === activeLevel),
    [courses, activeLevel]
  );

  const totalResources = useMemo(
    () => coursesByLevel.reduce((sum, c) => sum + c.resourceCount, 0),
    [coursesByLevel]
  );

  const semesters: Semester[] = [1, 2];

  const recentMaterials = useMemo(
    () =>
      resources
        .filter((resource) => resource.status === 'ACTIVE')
        .slice(0, 4),
    [resources]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1 items-start">
        <Sidebar
          activeLevel={activeLevel}
          onSelectLevel={isAdmin ? setAdminLevel : () => {}}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6">
          <div className="rounded-3xl bg-[var(--surface)] p-5 shadow-[0_1px_3px_var(--shadow)] sm:p-6">
            <PageHeader
              eyebrow={`Your study library · Level ${activeLevel}`}
              title={`Welcome back, ${session?.name.split(' ')[0] ?? 'student'}.`}
              description="Pick up where you left off or explore material for this semester."
              actions={<a href="#courses" className="inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-2)]">Explore courses</a>}
            />
          </div>

          {isLoading ? (
            <div className="mt-6"><CourseGridSkeleton /></div>
          ) : coursesByLevel.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                icon={FolderOpen}
                title="Your course library is getting ready"
                description="Courses for this level have not been added yet. Check back soon or ask your course rep."
              />
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full sm:max-w-lg">
                <StatCard label="Courses" value={coursesByLevel.length} />
                <StatCard label="Resources" value={totalResources} />
                <StatCard label="Semesters" value={semesters.length} />
              </div>

              <section className="mt-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                      Fresh for you
                    </p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">
                      Recently added materials
                    </h2>
                  </div>
                  <BookOpenCheck className="mb-1 h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
                </div>
                {recentMaterials.length ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {recentMaterials.map((resource) => (
                      <RecentMaterialCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-3">
                    <EmptyState
                      icon={BookOpenCheck}
                      title="No materials yet"
                      description="New slides, notes, and past questions will appear here as soon as they are shared."
                    />
                  </div>
                )}
              </section>

              <section className="mt-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">Keep going</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">Continue studying</h2>
                  </div>
                  <Link href="#courses" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    All courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">{coursesByLevel.slice(0, 3).map((course) => <CourseCard key={`continue-${course.code}`} course={course} />)}</div>
              </section>

              <div id="courses">
              {semesters.map((semester) => {
                const coursesInSem = coursesByLevel.filter((c) => c.semester === semester);
                if (coursesInSem.length === 0) return null;

                return (
                  <section key={semester} className="mt-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Semester {semester}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {coursesInSem.map((course) => (
                        <CourseCard key={course.code} course={course} />
                      ))}
                    </div>
                  </section>
                );
              })}
              </div>
            </>
          )}

          <footer className="mt-10 rounded-3xl bg-[var(--surface)] px-5 py-6 shadow-[0_1px_3px_var(--shadow)] sm:flex sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-base font-bold tracking-tight">CS Resource Hub</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">A calmer place to learn, share, and stay on track.</p>
            </div>
            <p className="mt-4 text-xs font-medium text-[var(--text-muted)] sm:mt-0">
              Made for the CS community
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
