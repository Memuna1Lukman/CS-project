'use client';

import { BookOpen, Download, ExternalLink, FileQuestion, FileStack, Files, FlaskConical, NotebookText, type LucideIcon } from 'lucide-react';
import { Resource } from '@/types/resource';
import { RESOURCE_TYPE_BADGE_CLASSES, RESOURCE_TYPE_LABELS } from '@/lib/resourceType';
import { useLibrary } from './MockLibraryProvider';

const RESOURCE_TYPE_ICONS: Record<Resource['type'], LucideIcon> = {
  SLIDES: FileStack,
  PAST_QUESTION: FileQuestion,
  LAB_MANUAL: FlaskConical,
  BOOK: BookOpen,
  NOTES: NotebookText,
  OTHER: Files,
};

function triggerDownload(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export default function ResourceRow({ resource }: { resource: Resource }) {
  const { incrementDownloadCount } = useLibrary();
  const isExternal = Boolean(resource.externalUrl);
  const TypeIcon = RESOURCE_TYPE_ICONS[resource.type];

  // TODO(backend): GET /api/resources/:id/download — verify session, check
  // status = ACTIVE, increment downloadCount, redirect to a short-lived
  // signed R2 URL. Here the mock store holds the file bytes (or, for seeded
  // demo resources with no real bytes, a generated placeholder file).
  const handleAction = () => {
    incrementDownloadCount(resource.id);

    if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (resource.fileDataUrl) {
      triggerDownload(resource.fileDataUrl, resource.fileName ?? `${resource.title}.bin`);
      return;
    }

    // Seeded demo resource: no stored bytes, so download a placeholder.
    const placeholder = new Blob(
      [
        `${resource.title}\n${resource.courseCode} — ${resource.courseTitle}\n` +
          `${RESOURCE_TYPE_LABELS[resource.type]} · ${resource.academicYear}\n\n` +
          `This is seeded demo data; the real file lives in R2 once the backend exists.\n`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(placeholder);
    triggerDownload(url, `${resource.title}.txt`);
    URL.revokeObjectURL(url);
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
