// Client-side upload validation. The mime/size whitelist is imported from
// lib/fileValidation.ts (the module POST /api/resources actually enforces)
// so the two never drift apart.
import { ACCEPTED_FILES, MAX_FILE_SIZE } from './fileValidation';

export const ALLOWED_MIME_TYPES: Record<string, string> = Object.fromEntries(
  Object.entries(ACCEPTED_FILES).map(([mime, { label }]) => [mime, label])
);

export const MAX_FILE_BYTES = MAX_FILE_SIZE;

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES[file.type]) {
    return 'That file type is not allowed. Use PDF, DOCX, or PPTX.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). The limit is ${formatBytes(MAX_FILE_BYTES)}.`;
  }
  return null;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
