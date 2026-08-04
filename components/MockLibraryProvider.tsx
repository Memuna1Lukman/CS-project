'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { MOCK_COURSES, MOCK_REQUESTS, MOCK_RESOURCES, MOCK_USERS } from '@/lib/mockData';
import type {
  Course,
  MaterialRequest,
  MockUser,
  RequestStatus,
  Resource,
} from '@/types/resource';

type CourseInput = Omit<Course, 'resourceCount'>;
type ResourceInput = Omit<Resource, 'id' | 'status' | 'downloadCount' | 'createdAt'>;

interface LibraryContextValue {
  courses: Course[];
  resources: Resource[];
  users: MockUser[];
  requests: MaterialRequest[];
  addCourse: (input: CourseInput) => void;
  updateCourse: (code: string, patch: Partial<Omit<Course, 'code' | 'resourceCount'>>) => void;
  addResource: (input: ResourceInput) => void;
  removeResource: (id: string) => void;
  updateUser: (email: string, patch: Partial<Pick<MockUser, 'role' | 'level' | 'status'>>) => void;
  addRequest: (input: { courseCode?: string; note: string }) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

function nextResourceId() {
  return `res-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Everything here is in-memory only and resets on reload — deliberately, per
// the mock rep/admin flows this backs. No localStorage, no backend.
// TODO(backend): replace with Prisma-backed queries/mutations (design doc §6,
// Appendix B) once real auth + a database exist.
export function MockLibraryProvider({ children }: { children: React.ReactNode }) {
  const [courseDefs, setCourseDefs] = useState<CourseInput[]>(
    MOCK_COURSES.map((c) => ({
      code: c.code,
      title: c.title,
      level: c.level,
      semester: c.semester,
      lecturer: c.lecturer,
    }))
  );
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [requests, setRequests] = useState<MaterialRequest[]>(MOCK_REQUESTS);

  const courses = useMemo<Course[]>(
    () =>
      courseDefs.map((c) => ({
        ...c,
        resourceCount: resources.filter((r) => r.courseCode === c.code && r.status === 'ACTIVE')
          .length,
      })),
    [courseDefs, resources]
  );

  const addCourse = (input: CourseInput) => {
    setCourseDefs((prev) => [...prev, input]);
  };

  const updateCourse: LibraryContextValue['updateCourse'] = (code, patch) => {
    setCourseDefs((prev) => prev.map((c) => (c.code === code ? { ...c, ...patch } : c)));
  };

  const addResource = (input: ResourceInput) => {
    const resource: Resource = {
      ...input,
      id: nextResourceId(),
      status: 'ACTIVE',
      downloadCount: 0,
      createdAt: String(new Date().getFullYear()),
    };
    setResources((prev) => [resource, ...prev]);
  };

  const removeResource = (id: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'REMOVED' } : r)));
  };

  const updateUser: LibraryContextValue['updateUser'] = (email, patch) => {
    setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, ...patch } : u)));
  };

  const addRequest = (input: { courseCode?: string; note: string }) => {
    const request: MaterialRequest = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      courseCode: input.courseCode,
      note: input.note,
      status: 'OPEN',
    };
    setRequests((prev) => [request, ...prev]);
  };

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const value: LibraryContextValue = {
    courses,
    resources,
    users,
    requests,
    addCourse,
    updateCourse,
    addResource,
    removeResource,
    updateUser,
    addRequest,
    updateRequestStatus,
  };

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a MockLibraryProvider');
  }
  return ctx;
}
