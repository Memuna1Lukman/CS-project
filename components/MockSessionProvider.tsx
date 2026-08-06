'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MockUser, Role } from '@/types/resource';

const STORAGE_KEY = 'mockSession';

interface SessionContextValue {
  session: MockUser | null;
  signIn: (user: MockUser) => void;
  signOut: () => void;
  updateSession: (patch: Partial<MockUser>) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): MockUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

// Client-only mock of a real session: no server, no cookies, just localStorage.
// TODO(backend): replace entirely with Auth.js sessions + Prisma User lookups
// (see design doc §4, §6). This provider and the redirect below are stopgaps
// so role/level gating can be demoed before real auth exists.
export function MockSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readStoredSession());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!session && pathname !== '/sign-in') {
      router.replace('/sign-in');
    }
  }, [ready, session, pathname, router]);

  const signIn = (user: MockUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setSession(user);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    router.replace('/sign-in');
  };

  const updateSession = (patch: Partial<MockUser>) => {
    setSession((prev) => {
      if (!prev) return prev;
      // Role changes represent an administrative action in the real app.
      // Keep the demo from allowing a normal account to self-promote.
      if (patch.role !== undefined && prev.role !== 'SUPER_ADMIN') {
        const safePatch = { ...patch };
        delete safePatch.role;
        const next = { ...prev, ...safePatch };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      }
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value: SessionContextValue = { session, signIn, signOut, updateSession };

  // Avoid a flash of protected content before localStorage has been read, and
  // while the redirect-to-sign-in effect above is in flight.
  const blocked = !ready || (!session && pathname !== '/sign-in');
  if (blocked) {
    return <div className="min-h-screen bg-[var(--bg)]" />;
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a MockSessionProvider');
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
