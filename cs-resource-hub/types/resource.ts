export type ResourceType = 'SLIDES' | 'PAST_QUESTION' | 'LAB_MANUAL' | 'BOOK' | 'NOTES' | 'OTHER';
export type ResourceStatus = 'ACTIVE' | 'REMOVED';

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