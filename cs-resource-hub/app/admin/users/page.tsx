'use client';

import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import type { Level, Role } from '@/types/resource';

const LEVELS: Level[] = [100, 200, 300, 400];
const ROLES: Role[] = ['STUDENT', 'REP', 'SUPER_ADMIN'];
const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Student',
  REP: 'Course Rep',
  SUPER_ADMIN: 'Super Admin',
};

// TODO(backend): wire to PATCH /api/users/:id — grant rep role + assign level scopes / deactivate
export default function AdminUsersPage() {
  const { permitted } = useRequireRole(['SUPER_ADMIN']);
  const { users, updateUser } = useLibrary();

  if (!permitted) return null;

  return (
    <PageShell>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Manage users / reps</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Grant rep role, assign a level scope, or deactivate an account. Deactivating never
        removes their uploads.
      </p>

      <div className="mt-5 space-y-2.5">
        {users.map((user) => {
          const inactive = user.status === 'INACTIVE';
          return (
            <div
              key={user.email}
              className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-[0_1px_2px_var(--shadow)] ${
                inactive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  {inactive && (
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-subtle)]">
                      Inactive
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateUser(user.email, { status: inactive ? 'ACTIVE' : 'INACTIVE' })
                  }
                  className="shrink-0 min-h-9 px-3 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                >
                  {inactive ? 'Reactivate' : 'Deactivate'}
                </button>
              </div>

              <div className="mt-3 flex gap-2 flex-wrap border-t border-[var(--border)] pt-3">
                <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  Role
                  <select
                    value={user.role}
                    disabled={inactive}
                    onChange={(e) => updateUser(user.email, { role: e.target.value as Role })}
                    className="h-9 px-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus)] disabled:opacity-60"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  Level
                  <select
                    value={user.level}
                    disabled={inactive}
                    onChange={(e) => updateUser(user.email, { level: Number(e.target.value) as Level })}
                    className="h-9 px-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus)] disabled:opacity-60"
                  >
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
