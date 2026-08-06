'use client';

import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import { useToast } from '@/components/ToastProvider';
import type { RequestStatus } from '@/types/resource';
import EmptyState from '@/components/EmptyState';
import PageHeader from '@/components/PageHeader';
import { Inbox } from 'lucide-react';

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
  const toast = useToast();

  if (!permitted) return null;

  const handleStatus = (id: string, status: RequestStatus) => {
    const result = updateRequestStatus(id, status);
    if (result.ok) toast(`Request marked ${STATUS_LABELS[status].toLowerCase()}.`);
    else toast(result.error, 'error');
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Administration" title="Material requests" description="Students’ “I can’t find this” requests — your coverage radar." />

      {requests.length === 0 ? (
        <div className="mt-6"><EmptyState icon={Inbox} title="No material requests" description="Requests will appear here when students need help finding something." /></div>
      ) : (
        <div className="mt-5 space-y-6">
          {STATUS_ACTIONS.map((status) => {
            const group = requests.filter((request) => request.status === status);
            if (!group.length) return null;
            return <section key={status}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">{STATUS_LABELS[status]} <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px] text-[var(--text-primary)]">{group.length}</span></h2>
              <div className="space-y-2.5">
          {group.map((request) => (
            <div
              key={request.id}
              className="bg-[var(--surface)] rounded-2xl p-5 shadow-[0_1px_3px_var(--shadow)]"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  {request.courseCode && (
                    <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-subtle)]">
                      {request.courseCode}
                    </span>
                  )}
                  <p className="mt-1.5 text-sm text-[var(--text-primary)]">{request.note}</p>
                </div>

                <span
                  className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    'bg-[var(--surface-2)] text-[var(--text-muted)]'
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
                    onClick={() => handleStatus(request.id, status)}
                    className="min-h-9 px-3 rounded-full text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                  >
                    Mark {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          ))}
              </div>
            </section>;
          })}
        </div>
      )}
    </PageShell>
  );
}
