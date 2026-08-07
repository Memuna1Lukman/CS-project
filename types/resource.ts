export type ResourceType = 'SLIDES' | 'NOTES' | 'PAST_QUESTION' | 'ASSIGNMENT' | 'SOLUTION' | 'LAB_MANUAL' | 'BOOK' | 'OUTLINE' | 'TIMETABLE' | 'LINK' | 'OTHER';
export type ResourceStatus = 'ACTIVE' | 'REMOVED';

export type Level = 100 | 200 | 300 | 400;
export type Semester = 1 | 2;

export interface Course {
  id: number;
  code: string;
  title: string;
  level: Level;
  semester: Semester;
  lecturer?: string;
  resourceCount: number;
}

export type Role = 'STUDENT' | 'REP' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// Client-safe representation of the authenticated database user.
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  // null means no level has been assigned yet — an admin-only entitlement
  // (design doc §4), never fabricated client-side.
  level: Level | null;
  indexNumber: string;
  programme?: string;
  cohortYear?: number;
  // A rep's full set of assigned level scopes (RepScope rows); `level` above
  // still carries their primary/first scope for existing single-level UI.
  scopes?: Level[];
  status: UserStatus;
}

export type RequestStatus = 'OPEN' | 'FULFILLED' | 'DISMISSED';

export interface MaterialRequest {
  id: string;
  courseCode?: string;
  note: string;
  status: RequestStatus;
}

export interface Resource {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  level: number; // 100, 200, 300, 400
  semester: number; // 1 or 2
  type: ResourceType;
  academicYear: string;
  fileSize?: string;
  storageKey?: string;
  fileName?: string;
  mimeType?: string;
  externalUrl?: string;
  status: ResourceStatus;
  downloadCount: number;
  uploadedBy: string;
  createdAt: string;
}

// What a provider mutation reports back to the UI. Mirrors the eventual API
// response shape: server-side checks can fail even when the UI gate passed.
export type MutationResult = { ok: true } | { ok: false; error: string };
