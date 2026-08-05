export type ResourceType = 'SLIDES' | 'NOTES' | 'PAST_QUESTION' | 'ASSIGNMENT' | 'SOLUTION' | 'LAB_MANUAL' | 'BOOK' | 'OUTLINE' | 'TIMETABLE' | 'LINK' | 'OTHER';
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
  externalUrl?: string;
  status: ResourceStatus;
  downloadCount: number;
  uploadedBy: string;
  createdAt: string;
}

export interface ApiCourse {
  id: number;
  code: string;
  title: string;
  level: Level;
  semester: Semester;
  lecturer: string | null;
  resourceCount: number;
}

export interface ApiResource {
  id: number;
  title: string;
  type: ResourceType;
  academicYear: string | null;
  fileSize: number | null;
  externalUrl: string | null;
  status: ResourceStatus;
  downloadCount: number;
  createdAt: string;
  course?: Pick<ApiCourse, 'code' | 'title' | 'level' | 'semester'>;
}
