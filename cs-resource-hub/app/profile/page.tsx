import Link from 'next/link';
import PageShell from '@/components/PageShell';
import StagePlaceholder from '@/components/StagePlaceholder';

const QUICK_LINKS = [
  { href: '/sign-in', label: 'Sign in', note: 'Auth screens (Stage 4)' },
  { href: '/onboarding', label: 'Onboarding', note: 'First-login index number (Stage 3)' },
  { href: '/my-uploads', label: 'My uploads', note: 'Rep view (Stage 5)' },
  { href: '/admin', label: 'Admin', note: 'Super-admin view (Stage 6)' },
];

// TODO(backend): populate from the Auth.js session (email, role, index number)
export default function ProfilePage() {
  return (
    <PageShell>
      <StagePlaceholder
        title="Profile"
        note="Email, level, index number, role, and sign out — coming in Stage 3."
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
          Other screens (temporary scaffold links)
        </p>
        <ul className="space-y-2">
          {QUICK_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center justify-between min-h-11 px-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--canvas-bg)]"
              >
                {link.label}
                <span className="text-xs font-normal text-[var(--text-muted)]">{link.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </StagePlaceholder>
    </PageShell>
  );
}
