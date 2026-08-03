import Link from 'next/link';
import { Course } from '@/types/resource';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${encodeURIComponent(course.code)}`}
      className="block bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >
      <span className="inline-block font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[var(--canvas-bg)] text-[var(--text-muted)]">
        {course.code}
      </span>

      <h3 className="mt-3 text-lg font-bold text-[var(--text-primary)] leading-snug">
        {course.title}
      </h3>

      {course.lecturer && (
        <p className="mt-1 text-sm text-[var(--text-muted)]">{course.lecturer}</p>
      )}

      <span className="mt-4 inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--canvas-bg)] text-[var(--text-muted)]">
        {course.resourceCount} resources
      </span>
    </Link>
  );
}
