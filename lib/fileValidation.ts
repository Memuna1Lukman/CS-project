const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ACCEPTED_FILES: Record<string, { extensions: string[]; signature: 'pdf' | 'zip' }> = {
  'application/pdf': { extensions: ['.pdf'], signature: 'pdf' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { extensions: ['.docx'], signature: 'zip' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { extensions: ['.pptx'], signature: 'zip' },
};

function hasSignature(bytes: Uint8Array, signature: 'pdf' | 'zip') {
  if (signature === 'pdf') return bytes.length >= 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

export async function validateUploadedFile(file: File): Promise<string | null> {
  const accepted = ACCEPTED_FILES[file.type];
  if (!accepted) return 'Only PDF, DOCX, and PPTX files are accepted.';
  if (file.size === 0 || file.size > MAX_FILE_SIZE) return 'File must be between 1 byte and 15 MB.';
  const lowerName = file.name.toLowerCase();
  if (!accepted.extensions.some((extension) => lowerName.endsWith(extension))) return 'The file extension does not match its declared type.';
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  return hasSignature(bytes, accepted.signature) ? null : 'The file contents do not match its declared type.';
}
