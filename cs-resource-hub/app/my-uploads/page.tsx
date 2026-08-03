import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to POST /api/resources, PATCH /api/resources/:id,
// DELETE /api/resources/:id (rep/admin, scope-checked — see Appendix B)
export default function MyUploadsPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="My uploads"
        note="Upload drawer and your uploaded resources with soft-delete — coming in Stage 5. Visible to reps only once role-gating lands."
      />
    </PageShell>
  );
}
