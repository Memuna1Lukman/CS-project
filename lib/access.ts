import { Level, MockUser } from '@/types/resource';

export const ALL_LEVELS: Level[] = [100, 200, 300, 400];

// Client-side hint for which levels a session may browse — purely a UI
// affordance (which level tabs to show). Real enforcement happens
// server-side in lib/api.ts (readableLevels) on every request.
export function readableLevels(session: MockUser | null): Level[] {
  if (!session) return [];
  if (session.role === 'SUPER_ADMIN') return ALL_LEVELS;
  if (session.role === 'REP') return session.scopes ?? [];
  return session.level ? [session.level] : [];
}

export function canReadLevel(session: MockUser | null, level: number): boolean {
  return readableLevels(session).includes(level as Level);
}
