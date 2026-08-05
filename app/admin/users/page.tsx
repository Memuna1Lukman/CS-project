'use client';

import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import { useToast } from '@/components/ToastProvider';
import type { Level, MockUser, Role } from '@/types/resource';

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
  const toast = useToast();

  if (!permitted) return null;

  const handleUpdate = (
    user: MockUser,
    patch: Partial<Pick<MockUser, 'role' | 'level' | 'status'>>,
    message: string
  ) => {
    const result = updateUser(user.email, patch);
    if (result.ok) toast(message);
    else toast(result.error, 'error');
  };

  return (
    <PageShell>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">Manage users / reps</h1>
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
              className={`bg-[var(--surface)] rounded-2xl p-5 shadow-[0_1px_3px_var(--shadow)] ${
                inactive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                  {inactive && (
                    <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-subtle)]">
                      Inactive
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      user,
                      { status: inactive ? 'ACTIVE' : 'INACTIVE' },
                      inactive ? `Reactivated ${user.name}.` : `Deactivated ${user.name}.`
                    )
                  }
                  className="shrink-0 min-h-9 px-3 rounded-full text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
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
                    onChange={(e) =>
                      handleUpdate(
                        user,
                        { role: e.target.value as Role },
                        `${user.name} is now ${ROLE_LABELS[e.target.value as Role]}.`
                      )
                    }
                    className="h-9 px-2 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus)] disabled:opacity-60"
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
                    onChange={(e) =>
                      handleUpdate(
                        user,
                        { level: Number(e.target.value) as Level },
                        `${user.name} moved to Level ${e.target.value}.`
                      )
                    }
                    className="h-9 px-2 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] text-xs outline-none focus:border-[var(--focus)] disabled:opacity-60"
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
