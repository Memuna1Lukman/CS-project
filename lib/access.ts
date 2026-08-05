import { Level, MockUser } from '@/types/resource';

export const ALL_LEVELS: Level[] = [100, 200, 300, 400];

// A user's read scope, per design doc §3: Student/Rep read only their own
// level; Super-Admin reads all levels. Writes are governed separately inside
// MockLibraryProvider's mutations.
// TODO(backend): server enforces the same read scope on every GET.
export function readableLevels(session: MockUser | null): Level[] {
  if (!session) return [];
  if (session.role === 'SUPER_ADMIN') return ALL_LEVELS;
  return [session.level];
}

export function canReadLevel(session: MockUser | null, level: number): boolean {
  return readableLevels(session).includes(level as Level);
}
