import { Download, ExternalLink } from 'lucide-react';
import { ApiResource } from '@/types/resource';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

function formatFileSize(bytes: number | null) {
  if (bytes === null) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourceRow({ resource }: { resource: ApiResource }) {
  const isExternal = Boolean(resource.externalUrl);
  const fileSize = formatFileSize(resource.fileSize);

  const handleAction = () => {
    window.location.assign(`/api/resources/${resource.id}/download`);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2.5 shadow-[0_1px_2px_var(--shadow)]">
      <span className="hidden sm:inline-block shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]">
        {RESOURCE_TYPE_LABELS[resource.type]}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {resource.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
          <span className="sm:hidden">{RESOURCE_TYPE_LABELS[resource.type]} · </span>
          {resource.academicYear ?? 'Year not listed'}
          {!isExternal && fileSize ? ` · ${fileSize}` : ''}
        </p>
      </div>

      {!isExternal && fileSize && (
        <span className="hidden sm:inline shrink-0 text-xs text-[var(--text-muted)] tabular-nums">
          {fileSize}
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
