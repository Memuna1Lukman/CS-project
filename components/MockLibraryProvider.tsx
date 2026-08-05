'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MOCK_COURSES, MOCK_REQUESTS, MOCK_RESOURCES, MOCK_USERS } from '@/lib/mockData';
import { readableLevels } from '@/lib/access';
import { useSession } from './MockSessionProvider';
import type {
  Course,
  MaterialRequest,
  MockUser,
  MutationResult,
  RequestStatus,
  Resource,
} from '@/types/resource';

const STORAGE_KEY = 'mockLibrary';

type CourseInput = Omit<Course, 'resourceCount'>;
type ResourceInput = Omit<Resource, 'id' | 'status' | 'downloadCount' | 'createdAt' | 'uploadedBy'>;

interface LibraryContextValue {
  courses: Course[];
  resources: Resource[];
  users: MockUser[];
  requests: MaterialRequest[];
  addCourse: (input: CourseInput) => MutationResult;
  updateCourse: (code: string, patch: Partial<Omit<Course, 'code' | 'resourceCount'>>) => MutationResult;
  addResource: (input: ResourceInput) => MutationResult;
  removeResource: (id: string) => MutationResult;
  incrementDownloadCount: (id: string) => void;
  updateUser: (email: string, patch: Partial<Pick<MockUser, 'role' | 'level' | 'status'>>) => MutationResult;
  addRequest: (input: { courseCode?: string; note: string }) => MutationResult;
  updateRequestStatus: (id: string, status: RequestStatus) => MutationResult;
  resetToDefaults: () => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

interface StoredState {
  courseDefs: CourseInput[];
  resources: Resource[];
  users: MockUser[];
  requests: MaterialRequest[];
}

function defaultState(): StoredState {
  return {
    courseDefs: MOCK_COURSES.map((c) => ({
      code: c.code,
      title: c.title,
      level: c.level,
      semester: c.semester,
      lecturer: c.lecturer,
    })),
    resources: MOCK_RESOURCES,
    users: MOCK_USERS,
    requests: MOCK_REQUESTS,
  };
}

function readStoredState(): StoredState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed.courseDefs || !parsed.resources || !parsed.users || !parsed.requests) return null;
    return parsed;
  } catch {
    return null;
  }
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// The mock stand-in for the whole backend: state lives in React, persists to
// localStorage, and every mutation runs the same role/scope checks the real
// API will (design doc §3, §10 — never trust the client UI alone). Pages only
// ever talk to this provider, so swapping to real endpoints is mechanical.
// TODO(backend): replace with Prisma-backed API routes (Appendix B).
export function MockLibraryProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [state, setState] = useState<StoredState>(defaultState);
  const [ready, setReady] = useState(false);
  const skipNextPersist = useRef(false);

  useEffect(() => {
    const stored = readStoredState();
    if (stored) {
      skipNextPersist.current = true;
      setState(stored);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage quota exceeded (large file uploads) — state stays
      // in-memory for this session but won't survive a refresh.
      console.warn('Failed to persist mock library state', e);
    }
  }, [ready, state]);

  // Single point of read-scope enforcement (design doc §3): every consumer of
  // `courses`/`resources` from this context automatically only ever sees
  // levels the current session may read — student/rep own level, super-admin
  // all. Mirrors the eventual server-side filter (design doc §10, Appendix B).
  const scope = useMemo(() => new Set(readableLevels(session)), [session]);

  const resources = useMemo<Resource[]>(
    () => state.resources.filter((r) => scope.has(r.level as Course['level'])),
    [state.resources, scope]
  );

  const courses = useMemo<Course[]>(
    () =>
      state.courseDefs
        .filter((c) => scope.has(c.level))
        .map((c) => ({
          ...c,
          resourceCount: resources.filter((r) => r.courseCode === c.code && r.status === 'ACTIVE')
            .length,
        })),
    [state.courseDefs, resources, scope]
  );

  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  // TODO(backend): POST /api/courses (super-admin only).
  const addCourse = (input: CourseInput): MutationResult => {
    if (!isSuperAdmin) return { ok: false, error: 'Only super-admins can add courses.' };
    if (state.courseDefs.some((c) => c.code.toLowerCase() === input.code.toLowerCase())) {
      return { ok: false, error: `A course with code ${input.code} already exists.` };
    }
    setState((prev) => ({ ...prev, courseDefs: [...prev.courseDefs, input] }));
    return { ok: true };
  };

  // TODO(backend): PATCH /api/courses/:id (super-admin only).
  const updateCourse: LibraryContextValue['updateCourse'] = (code, patch) => {
    if (!isSuperAdmin) return { ok: false, error: 'Only super-admins can edit courses.' };
    setState((prev) => ({
      ...prev,
      courseDefs: prev.courseDefs.map((c) => (c.code === code ? { ...c, ...patch } : c)),
    }));
    return { ok: true };
  };

  // TODO(backend): POST /api/resources (multipart → R2, or external link).
  // Scope check per §3: SUPER_ADMIN anywhere, REP only within their level.
  const addResource = (input: ResourceInput): MutationResult => {
    if (!session) return { ok: false, error: 'You must be signed in to upload.' };
    const permitted =
      session.role === 'SUPER_ADMIN' ||
      (session.role === 'REP' && session.level === input.level);
    if (!permitted) {
      return {
        ok: false,
        error:
          session.role === 'REP'
            ? `You can only upload to Level ${session.level} courses.`
            : 'Students cannot upload resources.',
      };
    }
    const resource: Resource = {
      ...input,
      id: newId('res'),
      status: 'ACTIVE',
      downloadCount: 0,
      uploadedBy: session.email,
      createdAt: String(new Date().getFullYear()),
    };
    setState((prev) => ({ ...prev, resources: [resource, ...prev.resources] }));
    return { ok: true };
  };

  // TODO(backend): DELETE /api/resources/:id (soft-delete, scope-checked).
  // REP may remove only their own uploads; SUPER_ADMIN any.
  const removeResource = (id: string): MutationResult => {
    if (!session) return { ok: false, error: 'You must be signed in.' };
    const resource = state.resources.find((r) => r.id === id);
    if (!resource) return { ok: false, error: 'Resource not found.' };
    const permitted =
      session.role === 'SUPER_ADMIN' ||
      (session.role === 'REP' && resource.uploadedBy === session.email);
    if (!permitted) {
      return { ok: false, error: 'You can only remove resources you uploaded.' };
    }
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => (r.id === id ? { ...r, status: 'REMOVED' } : r)),
    }));
    return { ok: true };
  };

  // TODO(backend): handled inside GET /api/resources/:id/download.
  const incrementDownloadCount = (id: string) => {
    setState((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === id ? { ...r, downloadCount: r.downloadCount + 1 } : r
      ),
    }));
  };

  // TODO(backend): PATCH /api/users/:id (super-admin only).
  const updateUser: LibraryContextValue['updateUser'] = (email, patch) => {
    if (!isSuperAdmin) return { ok: false, error: 'Only super-admins can manage users.' };
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email === email ? { ...u, ...patch } : u)),
    }));
    return { ok: true };
  };

  // TODO(backend): POST /api/requests (any signed-in user).
  const addRequest = (input: { courseCode?: string; note: string }): MutationResult => {
    if (!session) return { ok: false, error: 'You must be signed in to request material.' };
    const request: MaterialRequest = {
      id: newId('req'),
      courseCode: input.courseCode,
      note: input.note,
      status: 'OPEN',
    };
    setState((prev) => ({ ...prev, requests: [request, ...prev.requests] }));
    return { ok: true };
  };

  // TODO(backend): PATCH /api/requests/:id (super-admin only).
  const updateRequestStatus = (id: string, status: RequestStatus): MutationResult => {
    if (!isSuperAdmin) return { ok: false, error: 'Only super-admins can resolve requests.' };
    setState((prev) => ({
      ...prev,
      requests: prev.requests.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    return { ok: true };
  };

  // Demo-only control (surfaced on /profile): restores lib/mockData.ts defaults.
  const resetToDefaults = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setState(defaultState());
  };

  const value: LibraryContextValue = {
    courses,
    resources,
    users: state.users,
    requests: state.requests,
    addCourse,
    updateCourse,
    addResource,
    removeResource,
    incrementDownloadCount,
    updateUser,
    addRequest,
    updateRequestStatus,
    resetToDefaults,
  };

  // Same guard as the theme script / session provider: don't render
  // stateful UI until localStorage has been read, to avoid a flash of
  // default data replaced by hydrated data.
  if (!ready) {
    return <div className="min-h-screen bg-[var(--bg)]" />;
  }

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a MockLibraryProvider');
  }
  return ctx;
}
