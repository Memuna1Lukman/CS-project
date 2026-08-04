import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to PATCH /api/me (see Appendix B)
export default function OnboardingPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Welcome"
        note="First-login index number capture — coming in Stage 3."
      />
    </PageShell>
  );
}
