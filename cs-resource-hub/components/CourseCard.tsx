import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ApiCourse } from '@/types/resource';

export default function CourseCard({ course }: { course: ApiCourse }) {
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.code)}`}
      className="group relative block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-[0_2px_6px_var(--shadow)] hover:shadow-[0_8px_20px_var(--shadow)] transition-shadow"
    >
      <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-[var(--text-subtle)] opacity-0 group-hover:opacity-100 transition-opacity" />

      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-snug pr-5">
        {course.title}
      </h3>

      <span className="mt-1.5 inline-block font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-subtle)]">
        {course.code}
      </span>

      {course.lecturer && (
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{course.lecturer}</p>
      )}

      <span className="mt-3 inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)]">
        {course.resourceCount} resources
      </span>
    </Link>
  );
}
