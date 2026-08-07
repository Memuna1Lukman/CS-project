'use client';

import { BookOpen, Download, ExternalLink, FileQuestion, FileStack, Files, FlaskConical, NotebookText, type LucideIcon } from 'lucide-react';
import { Resource } from '@/types/resource';
import { RESOURCE_TYPE_BADGE_CLASSES, RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

const RESOURCE_TYPE_ICONS: Record<Resource['type'], LucideIcon> = {
  SLIDES: FileStack,
  PAST_QUESTION: FileQuestion,
  LAB_MANUAL: FlaskConical,
  BOOK: BookOpen,
  NOTES: NotebookText,
  OTHER: Files,
  ASSIGNMENT: Files,
  SOLUTION: Files,
  OUTLINE: Files,
  TIMETABLE: Files,
  LINK: ExternalLink,
};

export default function ResourceRow({ resource }: { resource: Resource }) {
  const isExternal = Boolean(resource.externalUrl);
  const TypeIcon = RESOURCE_TYPE_ICONS[resource.type];

  const handleAction = () => {
    window.open(resource.externalUrl ?? `/api/resources/${resource.id}/download`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-[var(--surface)] rounded-2xl px-3.5 py-3 shadow-[0_1px_3px_var(--shadow)]">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:hidden ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}
        aria-label={RESOURCE_TYPE_LABELS[resource.type]}
      >
        <TypeIcon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span
        className={`hidden sm:inline-flex items-center justify-center gap-1.5 shrink-0 w-[118px] text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}
      >
        <TypeIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {RESOURCE_TYPE_LABELS[resource.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {resource.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
          <span className="sm:hidden">{RESOURCE_TYPE_LABELS[resource.type]} · </span>
          {resource.academicYear}
          {!isExternal && resource.fileSize ? ` · ${resource.fileSize}` : ''}
          {isExternal ? ' · External link' : ''}
        </p>
      </div>

      {!isExternal && resource.fileSize && (
        <span className="hidden sm:inline shrink-0 text-xs text-[var(--text-muted)] tabular-nums">
          {resource.fileSize}
        </span>
      )}

      <button
        type="button"
        onClick={handleAction}
        className="shrink-0 flex items-center gap-1.5 px-4 min-h-11 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] shadow-[0_1px_2px_var(--shadow)]"
      >
        {isExternal ? (
          <>
            Open <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </>
        ) : (
          <>
            Download <Download className="w-3.5 h-3.5" aria-hidden="true" />
          </>
        )}
      </button>
    </div>
  );
}
