import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to POST /api/courses, PATCH /api/courses/:id (super-admin only)
export default function AdminCoursesPage() {
  return (
    <PageShell>
      <StagePlaceholder title="Manage courses" note="Add/edit courses — coming in Stage 6." />
    </PageShell>
  );
}
