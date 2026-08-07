'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { SessionProvider as AuthSessionProvider, signOut as authSignOut, useSession as useAuthSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { MockUser, Role } from '@/types/resource';

interface SessionContextValue {
  session: MockUser | null;
  signOut: () => void;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function SessionState({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<MockUser | null>(null);
  const { status } = useAuthSession();
  const [ready, setReady] = useState(false);

  const refresh = async () => {
    // 'loading' means next-auth's own session check hasn't resolved yet —
    // treating it the same as 'unauthenticated' here would flip `ready` to
    // true with a null session for a moment on every fresh page load,
    // tripping the sign-in redirect below before status settles to
    // 'authenticated'. Wait it out instead of guessing.
    if (status === 'loading') return;
    if (status !== 'authenticated') { setSession(null); setReady(true); return; }
    const response = await fetch('/api/me', { cache: 'no-store' });
    if (!response.ok) { setSession(null); setReady(true); return; }
    const user = await response.json();
    const repScopes: number[] = user.role === 'REP' ? (user.scopes ?? []).map((scope: { level: number }) => scope.level) : [];
    const level = user.role === 'REP' ? repScopes[0] : user.level;
    // No fallback here: a null level is a real state (admin hasn't assigned
    // one yet, design doc §4) — fabricating "Level 100" would mislead a
    // student into thinking they have read access they don't actually have.
    setSession({
      id: user.id,
      email: user.email,
      name: user.name || user.email.split('@')[0],
      role: user.role,
      level: level ?? null,
      indexNumber: user.indexNumber || '',
      status: user.status,
      // Full set of a rep's assigned level scopes (design doc §3: reps may be
      // assigned more than one level) — `level` above still carries the
      // primary/first scope for existing single-level UI.
      scopes: user.role === 'REP' ? (repScopes as (100 | 200 | 300 | 400)[]) : undefined,
    });
    setReady(true);
  };

  useEffect(() => {
    const load = async () => {
      await refresh();
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh reads `status` directly, re-run only when it changes
  }, [status]);

  // First-login onboarding (design doc §13 MVP item 2): a session with no
  // indexNumber yet hasn't completed the one-time capture step, so route it
  // there before anything else — this was previously built but never wired
  // up, so new sign-ins landed straight on "/" with no index number ever
  // asked for.
  const needsOnboarding = Boolean(session && !session.indexNumber);

  // A signed-in user (onboarding already done) has no business seeing the
  // sign-in form again — e.g. a stale tab, browser back button, or a bookmark
  // pointed at /sign-in from before they signed in.
  const isSignedInOnSignIn = Boolean(session && !needsOnboarding && pathname === '/sign-in');

  // /rep is a rep's effective home — send them there instead of the generic
  // course-browse page. Checked after onboarding so a first-time rep still
  // completes that step first.
  const isRepOnHome = Boolean(session && session.role === 'REP' && !needsOnboarding && pathname === '/');

  useEffect(() => {
    if (!ready) return;
    if (!session && pathname !== '/sign-in') {
      router.replace('/sign-in');
      return;
    }
    if (session && needsOnboarding && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }
    if (isSignedInOnSignIn) {
      router.replace('/');
      return;
    }
    if (isRepOnHome) {
      router.replace('/rep');
    }
  }, [ready, session, needsOnboarding, isSignedInOnSignIn, isRepOnHome, pathname, router]);

  const signOut = () => {
    void authSignOut({ callbackUrl: '/sign-in' });
  };

  const value: SessionContextValue = { session, signOut, refresh };

  // Avoid a flash of protected content before localStorage has been read, and
  // while the redirect effects above are in flight.
  const blocked =
    !ready ||
    (!session && pathname !== '/sign-in') ||
    (session !== null && needsOnboarding && pathname !== '/onboarding') ||
    isSignedInOnSignIn ||
    isRepOnHome;
  if (blocked) {
    return <div className="min-h-screen bg-[var(--bg)]" />;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <AuthSessionProvider><SessionState>{children}</SessionState></AuthSessionProvider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}

// Client-side role gate for a route: redirects to "/" when the signed-in mock
// session's role isn't one of `allowed`. Real enforcement still has to happen
// server-side once Auth.js + Prisma land (design doc §3).
export function useRequireRole(allowed: Role[]) {
  const { session } = useSession();
  const router = useRouter();
  const permitted = Boolean(session && allowed.includes(session.role));

  useEffect(() => {
    if (session && !permitted) {
      router.replace('/');
    }
  }, [session, permitted, router]);

  return { session, permitted };
}
