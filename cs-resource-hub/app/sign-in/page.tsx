import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to Auth.js Email provider at /api/auth/* (see Appendix B)
export default function SignInPage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Sign in"
        note='KNUST email field, "@st.knust.edu.gh only" helper, magic-link send — coming in Stage 4.'
      />
    </PageShell>
  );
}
