import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { Course } from '@/types/resource';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.code)}`}
      className="group relative block overflow-hidden rounded-2xl border border-transparent bg-[var(--surface)] p-5 shadow-[0_1px_3px_var(--shadow)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--border)] hover:shadow-[0_12px_28px_var(--shadow)]"
    >
      <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-[var(--text-subtle)] transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--text-primary)]" />

      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-subtle)] text-[var(--text-primary)] shadow-sm">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="inline-block rounded-full bg-[var(--surface)] px-2 py-1 font-mono text-[10px] font-semibold text-[var(--text-muted)] shadow-[0_1px_2px_var(--shadow)]">
          {course.code}
        </span>
      </div>

      <h3 className="mt-4 pr-5 text-lg font-bold leading-snug text-[var(--text-primary)]">
        {course.title}
      </h3>

      {course.lecturer && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{course.lecturer}</p>
      )}

      <span className="mt-4 inline-block rounded-full bg-[var(--surface)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--text-primary)] shadow-[0_1px_2px_var(--shadow)]">
        {course.resourceCount} resources
      </span>
    </Link>
  );
}
