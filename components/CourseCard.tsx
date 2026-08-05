import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Course } from '@/types/resource';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.code)}`}
      className="group relative block bg-[var(--surface)] rounded-2xl p-5 shadow-[0_1px_3px_var(--shadow)] hover:shadow-[0_8px_24px_var(--shadow)] transition-shadow"
    >
      <ArrowUpRight className="absolute top-5 right-5 w-4 h-4 text-[var(--text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <span className="inline-block font-mono text-[10px] font-medium px-2 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
        {course.code}
      </span>

      <h3 className="mt-2.5 text-lg font-bold text-[var(--text-primary)] leading-snug pr-5">
        {course.title}
      </h3>

      {course.lecturer && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{course.lecturer}</p>
      )}

      <span className="mt-4 inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-primary)] tabular-nums">
        {course.resourceCount} resources
      </span>
    </Link>
  );
}
