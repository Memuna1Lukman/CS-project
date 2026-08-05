// Client-side upload validation, mirroring the server-side whitelist the real
// backend will enforce (design doc §10: whitelist mime types + cap size).
// TODO(backend): enforce the same rules server-side in POST /api/resources.

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'text/plain': 'Text',
  'image/png': 'Image',
  'image/jpeg': 'Image',
  'application/zip': 'ZIP',
  'application/x-zip-compressed': 'ZIP',
};

// Kept small because the mock store persists file bytes to localStorage
// (~5 MB quota). The real R2-backed limit can be far larger.
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES[file.type]) {
    return 'That file type is not allowed. Use PDF, Word, PowerPoint, Excel, text, image, or ZIP.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). The demo limit is ${formatBytes(MAX_FILE_BYTES)}.`;
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
