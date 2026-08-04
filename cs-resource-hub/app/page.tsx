'use client';

import { useMemo, useState } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import CourseCard from '@/components/CourseCard';
import StatCard from '@/components/StatCard';
import { MOCK_COURSES } from '@/lib/mockData';
import { Level, Semester } from '@/types/resource';

// TODO(backend): GET /api/courses?level=&semester= instead of filtering
// MOCK_COURSES client-side.
export default function LibraryPage() {
  const [activeLevel, setActiveLevel] = useState<Level>(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const coursesByLevel = useMemo(
    () => MOCK_COURSES.filter((course) => course.level === activeLevel),
    [activeLevel]
  );

  const totalResources = useMemo(
    () => coursesByLevel.reduce((sum, c) => sum + c.resourceCount, 0),
    [coursesByLevel]
  );

  const semesters: Semester[] = [1, 2];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="flex flex-1">
        <Sidebar
          activeLevel={activeLevel}
          onSelectLevel={setActiveLevel}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Level {activeLevel}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Browse courses and their resources.
          </p>

          {coursesByLevel.length === 0 ? (
            <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
              No courses in this level yet.
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full sm:max-w-md">
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
