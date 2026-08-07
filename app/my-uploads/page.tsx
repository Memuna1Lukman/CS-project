'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/LibraryProvider';
import { useRequireRole } from '@/components/SessionProvider';
import { useToast } from '@/components/ToastProvider';
import { RESOURCE_TYPE_BADGE_CLASSES, RESOURCE_TYPE_LABELS } from '@/lib/resourceType';

// TODO(backend): GET /api/courses/:code/resources filtered by uploadedById,
// DELETE /api/resources/:id for soft-delete (rep/admin, scope-checked — see
// Appendix B). This reads/writes the in-memory LibraryProvider instead.
export default function MyUploadsPage() {
  const { session, permitted } = useRequireRole(['REP', 'SUPER_ADMIN']);
  const { resources, removeResource } = useLibrary();
  const toast = useToast();

  if (!permitted) return null;

  const handleRemove = async (id: string, title: string) => {
    const result = await removeResource(id);
    if (result.ok) toast(`Removed "${title}".`);
    else toast(result.error, 'error');
  };

  const myUploads = resources.filter(
    (r) => r.status === 'ACTIVE' && session && r.uploadedBy === session.id
  );

  const byCourse = new Map<string, typeof myUploads>();
  for (const resource of myUploads) {
    const list = byCourse.get(resource.courseCode) ?? [];
    list.push(resource);
    byCourse.set(resource.courseCode, list);
  }

  return (
    <PageShell>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">My uploads</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Resources you&apos;ve uploaded this session, grouped by course.
      </p>

      {myUploads.length === 0 ? (
        <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          You haven&apos;t uploaded anything yet. Open a course in your level and use
          &quot;Upload material&quot;.
          <div className="mt-3">
            <Link href="/" className="text-sm font-medium text-[var(--text-primary)] underline">
              Back to library
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Array.from(byCourse.entries()).map(([courseCode, uploads]) => (
            <section key={courseCode}>
              <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
                <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-subtle)]">
                  {courseCode}
                </span>
                {uploads[0].courseTitle}
              </h2>
              <div className="space-y-2">
                {uploads.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-2 sm:gap-3 bg-[var(--surface)] rounded-2xl px-3.5 py-3 shadow-[0_1px_3px_var(--shadow)]"
                  >
                    <span className={`hidden sm:inline-flex justify-center shrink-0 w-[108px] text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${RESOURCE_TYPE_BADGE_CLASSES[resource.type]}`}>
                      {RESOURCE_TYPE_LABELS[resource.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {resource.title}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        {resource.academicYear}
                        {resource.fileSize ? ` · ${resource.fileSize}` : ''}
                        {resource.externalUrl ? ' · Link' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(resource.id, resource.title)}
                      aria-label={`Remove ${resource.title}`}
                      className="shrink-0 flex items-center gap-1.5 min-h-11 px-3 rounded-full text-xs font-semibold text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface-3)]"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  );
}
