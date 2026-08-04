'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Level } from '@/types/resource';
import { useLibrary } from './MockLibraryProvider';
import { useSession } from './MockSessionProvider';

const LEVELS: Level[] = [100, 200, 300, 400];
const SEMESTERS: (1 | 2)[] = [1, 2];

interface SidebarProps {
  activeLevel: Level;
  onSelectLevel: (level: Level) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ activeLevel, onSelectLevel, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { session } = useSession();
  const { courses: allCourses } = useLibrary();
  const [expanded, setExpanded] = useState<Set<Level>>(new Set([activeLevel]));
  const [collapsed, setCollapsed] = useState(false);

  const toggleExpanded = (level: Level) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  return (
    <>
      {open && (
        <div
          className="fixed top-16 inset-x-0 bottom-0 z-20 bg-[var(--scrim)] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static top-16 bottom-0 md:top-auto md:bottom-auto left-0 z-30 shrink-0 bg-[var(--surface-2)] border-r border-[var(--border)] transform transition-[transform,width] duration-200 md:translate-x-0 flex flex-col ${
          collapsed ? 'md:w-16' : 'w-64 md:w-[220px]'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          {!collapsed && (
            <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
              Levels
            </p>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] ml-auto"
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav aria-label="Level" className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {LEVELS.map((level) => {
            const isActiveLevel = level === activeLevel;
            const isExpanded = expanded.has(level) && !collapsed;
            const courses = allCourses.filter((c) => c.level === level);

            return (
              <div key={level}>
                <div
                  className={`flex items-center rounded-lg text-sm font-medium ${
                    isActiveLevel
                      ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)]'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)]'
                  }`}
                >
                  <button
                    type="button"
                    aria-current={isActiveLevel ? 'page' : undefined}
                    onClick={() => {
                      onSelectLevel(level);
                      onClose();
                    }}
                    className="flex-1 text-left px-3 min-h-11 md:min-h-9 flex items-center justify-between gap-2"
                    title={collapsed ? `Level ${level}` : undefined}
                  >
                    <span className="truncate">{collapsed ? level : `Level ${level}`}</span>
                    {!collapsed && session?.level === level && (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                        Your level
                      </span>
                    )}
                  </button>

                  {!collapsed && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} Level ${level}`}
                      onClick={() => toggleExpanded(level)}
                      className="w-11 h-11 md:w-9 md:h-9 shrink-0 flex items-center justify-center"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="ml-2 pl-3 border-l border-[var(--border)] mb-1 space-y-1">
                    {SEMESTERS.map((semester) => {
                      const semCourses = courses.filter((c) => c.semester === semester);
                      if (semCourses.length === 0) return null;
                      return (
                        <div key={semester} className="pt-1">
                          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                            Semester {semester}
                          </p>
                          <ul>
                            {semCourses.map((course) => {
                              const href = `/courses/${encodeURIComponent(course.code)}`;
                              const isActiveCourse = pathname === href;
                              return (
                                <li key={course.code}>
                                  <Link
                                    href={href}
                                    onClick={onClose}
                                    className={`flex items-center gap-2 min-h-11 md:min-h-7 px-2 rounded-md text-xs font-mono truncate ${
                                      isActiveCourse
                                        ? 'bg-[var(--accent-subtle)] text-[var(--text-primary)] font-semibold'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-3)]'
                                    }`}
                                  >
                                    {course.code}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
