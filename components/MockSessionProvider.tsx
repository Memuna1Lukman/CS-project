'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { SessionProvider, signIn as authSignIn, signOut as authSignOut, useSession as useAuthSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import type { Level, MockUser } from '@/types/resource';

interface SessionContextValue {
  session: MockUser | null;
  signIn: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateSession: (patch: Partial<MockUser>) => Promise<{ ok: boolean; error?: string }>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function SessionBridge({ children }: { children: React.ReactNode }) {
  const { data, status, update } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<MockUser | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/me', { cache: 'no-store' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((me) => {
        if (!me) return;
        setProfile({
          email: me.email,
          name: me.name ?? me.email.split('@')[0],
          role: me.role,
          level: me.level ?? undefined,
          indexNumber: me.indexNumber ?? '',
          status: me.status,
          programme: me.programme,
          cohortYear: me.cohortYear,
          scopes: me.scopes?.map((scope: { level: Level }) => scope.level) ?? [],
        });
      })
      .catch(() => setProfile(null));
  }, [status, data?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/sign-in') router.replace('/sign-in');
  }, [pathname, router, status]);

  const value = useMemo<SessionContextValue>(() => ({
    session: status === 'authenticated' ? profile : null,
    signIn: async (email) => {
      try {
        const result = await authSignIn('email', { email: email.trim().toLowerCase(), redirect: false });
        return result?.error ? { ok: false, error: result.error } : { ok: true };
      } catch {
        // Auth.js may reject before it can return its normal result when the
        // server responds with a non-JSON 5xx response (for example, an
        // unavailable database or mail server).
        return { ok: false, error: 'Sign-in is temporarily unavailable. Please try again later.' };
      }
    },
    signOut: async () => { await authSignOut({ redirect: false }); router.replace('/sign-in'); },
    updateSession: async (patch) => {
      const body = Object.fromEntries(Object.entries(patch).filter(([key]) => !['role', 'status', 'scopes'].includes(key)));
      if (!Object.keys(body).length) return { ok: false, error: 'Role and status can only be changed by an administrator.' };
      const response = await fetch('/api/me', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) return { ok: false, error: payload.error ?? 'Profile update failed.' };
      setProfile((current) => current ? { ...current, ...patch } : current);
      await update();
      return { ok: true };
    },
  }), [profile, router, status, update]);

  if (status === 'loading' || (status === 'authenticated' && !profile)) return <div className="min-h-screen bg-[var(--bg)]" />;
  if (status === 'unauthenticated' && pathname !== '/sign-in') return <div className="min-h-screen bg-[var(--bg)]" />;
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function MockSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}><SessionBridge>{children}</SessionBridge></SessionProvider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used within MockSessionProvider');
  return value;
}

export function useRequireRole(allowed: MockUser['role'][]) {
  const { session } = useSession();
  const router = useRouter();
  const permitted = Boolean(session && allowed.includes(session.role));
  useEffect(() => { if (session && !permitted) router.replace('/'); }, [permitted, router, session]);
  return { session, permitted };
}
