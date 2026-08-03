import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

// TODO(backend): wire to GET /api/courses + GET /api/courses/:code/resources
// (structured search over course code/title, resource title/type/year — see Appendix B)
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <PageShell>
      <StagePlaceholder
        title="Search"
        note={
          q
            ? `Search results for "${q}" — coming in Stage 3.`
            : 'Search across courses and resources — coming in Stage 3.'
        }
      />
    </PageShell>
  );
}
