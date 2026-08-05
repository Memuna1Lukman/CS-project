export type ResourceType = 'SLIDES' | 'PAST_QUESTION' | 'LAB_MANUAL' | 'BOOK' | 'NOTES' | 'OTHER';
export type ResourceStatus = 'ACTIVE' | 'REMOVED';

export type Level = 100 | 200 | 300 | 400;
export type Semester = 1 | 2;

export interface Course {
  code: string;
  title: string;
  level: Level;
  semester: Semester;
  lecturer?: string;
  resourceCount: number;
}

export type Role = 'STUDENT' | 'REP' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// Mock signed-in user shape. Mirrors the eventual Auth.js session + Prisma
// User fields (design doc §6) but is populated entirely from MOCK_USERS.
export interface MockUser {
  email: string;
  name: string;
  role: Role;
  level: Level;
  indexNumber: string;
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
  fileName?: string;
  mimeType?: string;
  // Mock stand-in for the R2 object: the uploaded file's bytes as a base64
  // data URL so downloads work and survive refresh via localStorage.
  // TODO(backend): replace with storageKey + GET /api/resources/:id/download.
  fileDataUrl?: string;
  externalUrl?: string;
  status: ResourceStatus;
  downloadCount: number;
  uploadedBy: string;
  createdAt: string;
}

// What a provider mutation reports back to the UI. Mirrors the eventual API
// response shape: server-side checks can fail even when the UI gate passed.
export type MutationResult = { ok: true } | { ok: false; error: string };
