'use client';

import { useEffect, useMemo, useState } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import CourseCard from '@/components/CourseCard';
import StatCard from '@/components/StatCard';
import { Level, Semester } from '@/types/resource';
import { useSession } from '@/components/MockSessionProvider';
import { useLibrary } from '@/components/MockLibraryProvider';

// TODO(backend): GET /api/courses?level=&semester= — server filters by the
// session's read scope (design doc §3); the client no longer needs to.
export default function LibraryPage() {
  const { session } = useSession();
  const { courses } = useLibrary();
  const isAdmin = session?.role === 'SUPER_ADMIN';
  const [adminLevel, setAdminLevel] = useState<Level>(session?.level ?? 100);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Only super-admins can switch levels (design doc §3: student/rep reads are
  // locked to their own level). Re-sync the admin switcher's default when the
  // underlying level changes (e.g. the demo role switcher on /profile).
  useEffect(() => {
    if (session) setAdminLevel(session.level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <p className="text-sm text-[var(--text-muted)]">Browse courses and their resources.</p>
          <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Level {activeLevel}
          </h1>

          {coursesByLevel.length === 0 ? (
            <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
              No courses in this level yet.
            </div>
          ) : (
            <>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full sm:max-w-lg">
                <StatCard label="Courses" value={coursesByLevel.length} />
                <StatCard label="Resources" value={totalResources} />
                <StatCard label="Semesters" value={semesters.length} />
              </div>

              {semesters.map((semester) => {
                const courses = coursesByLevel.filter((c) => c.semester === semester);
                if (courses.length === 0) return null;

                return (
                  <section key={semester} className="mt-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                      Semester {semester}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                      {courses.map((course) => (
                        <CourseCard key={course.code} course={course} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
