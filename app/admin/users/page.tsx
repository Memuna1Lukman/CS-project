'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/PageShell';
import { useLibrary } from '@/components/MockLibraryProvider';
import { useRequireRole } from '@/components/MockSessionProvider';
import { useToast } from '@/components/ToastProvider';
import type { Level, MockUser, Role } from '@/types/resource';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Users } from 'lucide-react';

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
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const visibleUsers = useMemo(() => users.filter((user) => (roleFilter === 'ALL' || user.role === roleFilter) && `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase())), [users, query, roleFilter]);

  if (!permitted) return null;

  const handleUpdate = async (
    user: MockUser,
    patch: Partial<Pick<MockUser, 'role' | 'level' | 'status'>>,
    message: string
  ) => {
    const result = await updateUser(user.email, patch);
    if (result.ok) toast(message);
    else toast(result.error, 'error');
  };

  return (
    <PageShell>
      <PageHeader eyebrow="Administration" title="Manage users and reps" description="Grant rep roles, assign a level scope, or deactivate an account. Deactivating never removes uploads." />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people…" aria-label="Search users" className="h-11 flex-1 rounded-full bg-[var(--surface)] px-4 text-sm text-[var(--text-primary)] shadow-[0_1px_2px_var(--shadow)] outline-none focus:ring-2 focus:ring-[var(--focus)]" />
        <div className="flex gap-2 overflow-x-auto">{(['ALL', ...ROLES] as const).map((role) => <button key={role} type="button" onClick={() => setRoleFilter(role)} className={`min-h-11 shrink-0 rounded-full px-3 text-xs font-semibold ${roleFilter === role ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'bg-[var(--surface)] text-[var(--text-muted)] shadow-[0_1px_2px_var(--shadow)]'}`}>{role === 'ALL' ? 'All roles' : ROLE_LABELS[role]}</button>)}</div>
      </div>

      {visibleUsers.length === 0 ? <div className="mt-6"><EmptyState icon={Users} title="No users found" description="Try clearing the search or switching to another role filter." action={<button type="button" onClick={() => { setQuery(''); setRoleFilter('ALL'); }} className="inline-flex min-h-11 items-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-fg)]">Clear filters</button>} /></div> : <div className="mt-5 space-y-2.5">
        {visibleUsers.map((user) => {
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
      </div>}
    </PageShell>
  );
}
