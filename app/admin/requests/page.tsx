'use client';

import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import type { RequestStatus } from '@/types/resource';

const STATUS_LABELS: Record<RequestStatus, string> = {
  OPEN: 'Open',
  FULFILLED: 'Fulfilled',
  DISMISSED: 'Dismissed',
};

const STATUS_ACTIONS: RequestStatus[] = ['OPEN', 'FULFILLED', 'DISMISSED'];

// TODO(backend): wire to GET /api/requests, PATCH /api/requests/:id
export default function AdminRequestsPage() {
  const { permitted } = useRequireRole(['SUPER_ADMIN']);
  const { requests, updateRequestStatus } = useLibrary();

  if (!permitted) return null;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Material requests</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Students&apos; &quot;I can&apos;t find this&quot; requests — your coverage radar.
      </p>

      {requests.length === 0 ? (
        <div className="mt-6 text-center py-10 text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
          No requests yet.
        </div>
      ) : (
        <div className="mt-5 space-y-2.5">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_2px_var(--shadow)]"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  {request.courseCode && (
                    <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-subtle)]">
                      {request.courseCode}
                    </span>
                  )}
                  <p className="mt-1.5 text-sm text-[var(--text-primary)]">{request.note}</p>
                </div>

                <span
                  className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    request.status === 'OPEN'
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  {STATUS_LABELS[request.status]}
                </span>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap border-t border-[var(--border)] pt-3">
                {STATUS_ACTIONS.filter((status) => status !== request.status).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateRequestStatus(request.id, status)}
                    className="min-h-9 px-3 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                  >
                    Mark {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
