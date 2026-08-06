import Link from 'next/link';
import {
  BookOpen,
  FileQuestion,
  FileStack,
  Files,
  FlaskConical,
  NotebookText,
  type LucideIcon,
} from 'lucide-react';
import type { Resource, ResourceType } from '@/types/resource';
import { RESOURCE_TYPE_BADGE_CLASSES, RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  SLIDES: FileStack,
  PAST_QUESTION: FileQuestion,
  LAB_MANUAL: FlaskConical,
  BOOK: BookOpen,
  NOTES: NotebookText,
  OTHER: Files,
};

export default function RecentMaterialCard({ resource }: { resource: Resource }) {
  const Icon = RESOURCE_TYPE_ICONS[resource.type];

  return (
    <Link
      href={`/courses/${encodeURIComponent(resource.courseCode)}`}
      className="group flex min-h-36 flex-col rounded-2xl bg-[var(--surface)] p-4 shadow-[0_1px_3px_var(--shadow)] transition-shadow hover:shadow-[0_8px_24px_var(--shadow)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}
          aria-label={RESOURCE_TYPE_LABELS[resource.type]}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}>
          {RESOURCE_TYPE_LABELS[resource.type]}
        </span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-bold leading-5 text-[var(--text-primary)]">
        {resource.title}
      </p>
      <p className="mt-auto pt-3 text-xs text-[var(--text-muted)]">
        <span className="font-mono">{resource.courseCode}</span> · {resource.fileSize ?? 'External link'}
      </p>
    </Link>
  );
}
