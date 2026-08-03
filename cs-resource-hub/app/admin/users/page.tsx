import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to PATCH /api/users/:id — grant rep role + assign level scopes / deactivate
export default function AdminUsersPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Manage users / reps"
        note="Grant rep role, assign levels, deactivate — coming in Stage 6."
      />
    </PageShell>
  );
}
