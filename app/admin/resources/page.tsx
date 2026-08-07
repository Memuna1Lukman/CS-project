'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import { useToast } from '@/components/ToastProvider';
import { RESOURCE_TYPE_BADGE_CLASSES, RESOURCE_TYPE_LABELS } from '@/lib/resourceType';
import FilterPills from '@/components/FilterPills';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

// TODO(backend): wire to GET /api/resources (all, super-admin only) and
// DELETE /api/resources/:id (soft-delete, scope-checked — see Appendix B).
// Unlike /my-uploads (rep, scoped to uploadedBy), this lists and moderates
// every resource regardless of who uploaded it.
export default function AdminResourcesPage() {
  const { permitted } = useRequireRole(['SUPER_ADMIN']);
  const { resources, removeResource } = useLibrary();
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  if (!permitted) return null;

  const handleRemove = async (id: string, title: string) => {
    const result = await removeResource(id);
    if (result.ok) toast(`Removed "${title}".`);
    else toast(result.error, 'error');
  };

  const sorted = [...resources].sort((a, b) =>
    a.courseCode === b.courseCode
      ? a.title.localeCompare(b.title)
      : a.courseCode.localeCompare(b.courseCode)
  );
  const filtered = sorted.filter((resource) => !statusFilter || resource.status === statusFilter);

  return (
    <PageShell>
      <PageHeader eyebrow="Administration" title="Moderate resources" description="Every uploaded resource across all courses, regardless of who uploaded it." />

      <div className="mt-5"><FilterPills label="Status" options={['ACTIVE', 'REMOVED']} active={statusFilter} onChange={setStatusFilter} /></div>

      {filtered.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Trash2} title="No resources to moderate" description="Resources will appear here as soon as they are uploaded." /></div>
      ) : (
        <div className="mt-5 space-y-2">
          {filtered.map((resource) => {
            const removed = resource.status === 'REMOVED';
            return (
              <div
                key={resource.id}
                className={`flex items-center gap-2 sm:gap-3 bg-[var(--surface)] rounded-2xl px-3.5 py-3 shadow-[0_1px_3px_var(--shadow)] ${
                  removed ? 'opacity-60' : ''
                }`}
              >
                <span className={`hidden sm:inline-flex justify-center shrink-0 w-[108px] text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}>
                  {RESOURCE_TYPE_LABELS[resource.type]}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-subtle)]">
                      {resource.courseCode}
                    </span>
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {resource.title}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                    <span className="sm:hidden">{RESOURCE_TYPE_LABELS[resource.type]} · </span>
                    Uploaded by {resource.uploadedBy}
                  </p>
                </div>

                <span
                  className={`hidden sm:inline shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    removed
                      ? 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  {removed ? 'Removed' : 'Active'}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemove(resource.id, resource.title)}
                  disabled={removed}
                  aria-label={`Remove ${resource.title}`}
                  className="shrink-0 flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-3)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
