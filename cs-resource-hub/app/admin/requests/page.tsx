import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to GET /api/requests, PATCH /api/requests/:id
export default function AdminRequestsPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Material requests"
        note="Inbox of MaterialRequest entries — coming in Stage 6."
      />
    </PageShell>
  );
}
