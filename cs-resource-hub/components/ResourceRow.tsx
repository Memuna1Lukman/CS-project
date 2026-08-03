import { Download, ExternalLink } from 'lucide-react';
import { Resource } from '@/types/resource';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

export default function ResourceRow({ resource }: { resource: Resource }) {
  const isExternal = Boolean(resource.externalUrl);

  // TODO(backend): GET /api/resources/:id/download — verify session, check
  // status = ACTIVE, increment downloadCount, redirect to signed R2 URL.
  // External-link resources just open resource.externalUrl directly.
  const handleAction = () => {};

  return (
    <div className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl px-4 py-3 shadow-sm">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg bg-[var(--canvas-bg)] text-[var(--text-muted)]">
        {RESOURCE_TYPE_LABELS[resource.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {resource.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{resource.academicYear}</p>
      </div>

      {!isExternal && resource.fileSize && (
        <span className="shrink-0 text-xs text-[var(--text-muted)] tabular-nums">
          {resource.fileSize}
        </span>
      )}

      <button
        type="button"
        onClick={handleAction}
        className="shrink-0 flex items-center gap-1.5 px-3.5 min-h-11 rounded-lg text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)]"
      >
        {isExternal ? (
          <>
            Open <ExternalLink className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            Download <Download className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
