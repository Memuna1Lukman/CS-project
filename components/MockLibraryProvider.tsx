'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Course, MaterialRequest, MockUser, MutationResult, RequestStatus, Resource, ResourceType } from '@/types/resource';
import { useSession } from './MockSessionProvider';

type CourseInput = Omit<Course, 'id' | 'resourceCount'>;
type ResourceInput = { title: string; courseId: number; type: ResourceType; academicYear: string; file?: File; externalUrl?: string };
type UserPatch = Partial<Pick<MockUser, 'role' | 'level' | 'status'>> & { scopes?: number[] };

type ApiCourse = Omit<Course, 'id' | 'level' | 'semester'> & { id: number; level: number; semester: number };
type ApiResource = {
  id: number;
  title: string;
  type: ResourceType;
  academicYear: string | null;
  fileSize: number | null;
  mimeType: string | null;
  storageKey: string | null;
  externalUrl: string | null;
  status: Resource['status'];
  downloadCount: number;
  createdAt: string;
  course: { code: string; title: string; level: number; semester: number };
  uploadedBy: { email: string } | null;
  uploadedById: string;
};
type ApiUser = { id: string; email: string; name: string | null; role: MockUser['role']; level: number | null; indexNumber: string | null; status: MockUser['status']; scopes: { level: number }[] };
type ApiMaterialRequest = Omit<MaterialRequest, 'id'> & { id: number };

interface LibraryContextValue {
  isLoading: boolean;
  courses: Course[];
  resources: Resource[];
  users: MockUser[];
  requests: MaterialRequest[];
  addCourse: (input: CourseInput) => Promise<MutationResult>;
  updateCourse: (code: string, patch: Partial<Omit<Course, 'code' | 'resourceCount'>>) => Promise<MutationResult>;
  addResource: (input: ResourceInput) => Promise<MutationResult>;
  removeResource: (id: string) => Promise<MutationResult>;
  incrementDownloadCount: (id: string) => void;
  updateUser: (email: string, patch: UserPatch) => Promise<MutationResult>;
  addRequest: (input: { courseCode?: string; note: string }) => Promise<MutationResult>;
  updateRequestStatus: (id: string, status: RequestStatus) => Promise<MutationResult>;
  resetToDefaults: () => void;
  refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error ?? 'Request failed');
  return payload;
}

function mapResource(raw: ApiResource): Resource {
  const course = raw.course ?? {};
  return {
    id: String(raw.id), title: raw.title, courseCode: course.code ?? '', courseTitle: course.title ?? '',
    level: course.level, semester: course.semester, type: raw.type, academicYear: raw.academicYear ?? '',
    fileSize: raw.fileSize ? `${(raw.fileSize / 1024 / 1024).toFixed(1)} MB` : undefined,
    mimeType: raw.mimeType ?? undefined, storageKey: raw.storageKey ?? undefined, externalUrl: raw.externalUrl ?? undefined,
    status: raw.status, downloadCount: raw.downloadCount ?? 0, uploadedBy: raw.uploadedBy?.email ?? raw.uploadedById ?? '',
    createdAt: raw.createdAt,
  };
}

export function MockLibraryProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const courseRows = await requestJson<ApiCourse[]>('/api/courses');
      const mappedCourses: Course[] = courseRows.map((course) => ({
        id: course.id, code: course.code, title: course.title, level: course.level as Course['level'],
        semester: course.semester as Course['semester'], lecturer: course.lecturer ?? undefined,
        resourceCount: course.resourceCount ?? 0,
      }));
      const resourceRows: ApiResource[] = session.role === 'SUPER_ADMIN'
        ? await requestJson<ApiResource[]>('/api/resources')
        : (await Promise.all(mappedCourses.map((course) => requestJson<ApiResource[]>(`/api/courses/${encodeURIComponent(course.code)}/resources`).catch(() => [])))).flat();
      setCourses(mappedCourses); setResources(resourceRows.map(mapResource));
      if (session.role === 'SUPER_ADMIN') {
        const [userRows, requestRows] = await Promise.all([requestJson<ApiUser[]>('/api/users'), requestJson<ApiMaterialRequest[]>('/api/requests')]);
        setUsers(userRows.map((user) => ({ id: user.id, email: user.email, name: user.name ?? user.email.split('@')[0], role: user.role, level: user.level as MockUser['level'], indexNumber: user.indexNumber ?? '', status: user.status, scopes: user.scopes.map((scope) => scope.level as NonNullable<MockUser['level']>) })));
        setRequests(requestRows.map((request) => ({ ...request, id: String(request.id) })));
      } else { setUsers([]); setRequests([]); }
    } catch (error) { console.error(error); setCourses([]); setResources([]); }
    finally { setIsLoading(false); }
  }, [session]);

  useEffect(() => {
    if (session) queueMicrotask(() => void refresh());
  }, [refresh, session]);

  const mutate = async (fn: () => Promise<unknown>): Promise<MutationResult> => {
    try { await fn(); await refresh(); return { ok: true }; }
    catch (error) { return { ok: false, error: error instanceof Error ? error.message : 'Request failed' }; }
  };

  const addCourse = (input: CourseInput) => mutate(() => requestJson('/api/courses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }));
  const updateCourse = (code: string, patch: Partial<Omit<Course, 'code' | 'resourceCount'>>) => {
    const course = courses.find((item) => item.code === code);
    return course?.id ? mutate(() => requestJson(`/api/courses/${course.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) })) : Promise.resolve({ ok: false, error: 'Course not found.' } as MutationResult);
  };
  const addResource = (input: ResourceInput) => {
    const form = new FormData(); Object.entries(input).forEach(([key, value]) => { if (value !== undefined) form.append(key, value instanceof File ? value : String(value)); });
    return mutate(() => requestJson('/api/resources', { method: 'POST', body: form }));
  };
  const removeResource = (id: string) => mutate(() => requestJson(`/api/resources/${id}`, { method: 'DELETE' }));
  const incrementDownloadCount = () => { /* counted transactionally by the download route */ };
  const updateUser = (email: string, patch: UserPatch) => {
    const user = users.find((item) => item.email === email);
    if (!user?.id) return Promise.resolve({ ok: false, error: 'User not found.' } as MutationResult);
    const intendedRole = patch.role ?? user.role;
    const repLevel = patch.level ?? user.level;
    const { scopes, ...body } = patch;
    const payload: typeof body & { levels?: number[] } = body;
    if (intendedRole === 'REP' && repLevel) {
      payload.levels = scopes ?? [repLevel];
      delete payload.level;
    }
    return mutate(() => requestJson(`/api/users/${encodeURIComponent(user.id!)}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }));
  };
  const addRequest = (input: { courseCode?: string; note: string }) => mutate(() => requestJson('/api/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }));
  const updateRequestStatus = (id: string, status: RequestStatus) => mutate(() => requestJson(`/api/requests/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) }));

  const value: LibraryContextValue = { isLoading: session ? isLoading : false, courses: session ? courses : [], resources: session ? resources : [], users: session ? users : [], requests: session ? requests : [], addCourse, updateCourse, addResource, removeResource, incrementDownloadCount, updateUser, addRequest, updateRequestStatus, resetToDefaults: () => {}, refresh };
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() { const context = useContext(LibraryContext); if (!context) throw new Error('useLibrary must be used within MockLibraryProvider'); return context; }
