'use client';

import { useState } from 'react';
import Drawer from './Drawer';
import { useLibrary } from './LibraryProvider';
import { useToast } from './ToastProvider';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';
import { formatBytes, MAX_FILE_BYTES, validateFile } from '@/lib/upload';
import type { Course, ResourceType } from '@/types/resource';

const RESOURCE_TYPES = Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[];

export default function UploadResourceDrawer({
  course,
  open,
  onClose,
}: {
  course: Course;
  open: boolean;
  onClose: () => void;
}) {
  const { addResource } = useLibrary();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('SLIDES');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [touched, setTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isValid =
    title.trim().length > 0 &&
    academicYear.trim().length > 0 &&
    !fileError &&
    (Boolean(file) || link.trim().length > 0);

  const reset = () => {
    setTitle('');
    setType('SLIDES');
    setAcademicYear('2025/2026');
    setFile(null);
    setFileError(null);
    setLink('');
    setTouched(false);
    setUploading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }
    const error = validateFile(selected);
    setFileError(error);
    setFile(error ? null : selected);
    if (!error) setLink('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || uploading) return;

    setUploading(true);
    try {
      const result = await addResource({
        title: title.trim(),
        courseId: course.id,
        type,
        academicYear: academicYear.trim(),
        file: file ?? undefined,
        externalUrl: link.trim() || undefined,
      });

      if (!result.ok) {
        toast(result.error, 'error');
        setUploading(false);
        return;
      }

      toast(`Uploaded "${title.trim()}" to ${course.code}.`);
      handleClose();
    } catch {
      toast('Upload could not be completed. Try again.', 'error');
      setUploading(false);
    }
  };

  return (
    <Drawer open={open} onClose={handleClose} title={`Upload to ${course.code}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="upload-title" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Title
          </label>
          <input
            id="upload-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture Slides – Week 3"
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
          {touched && !title.trim() && (
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">Title is required.</p>
          )}
        </div>

        <div>
          <label htmlFor="upload-type" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Type
          </label>
          <select
            id="upload-type"
            value={type}
            onChange={(e) => setType(e.target.value as ResourceType)}
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] text-sm outline-none focus:border-[var(--focus)]"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {RESOURCE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="upload-year" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            Academic year
          </label>
          <input
            id="upload-year"
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="e.g. 2025/2026"
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>

        <div>
          <label htmlFor="upload-file" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            File
          </label>
          <input
            id="upload-file"
            type="file"
            accept=".pdf,.docx,.pptx"
            onChange={handleFileChange}
            aria-describedby="upload-file-hint"
            className="w-full text-sm text-[var(--text-primary)] file:mr-3 file:min-h-9 file:px-3 file:rounded-full file:border-0 file:bg-[var(--surface-2)] file:text-[var(--text-primary)] file:text-xs file:font-semibold"
          />
          <p id="upload-file-hint" className="mt-1.5 text-xs text-[var(--text-subtle)]">
            PDF, DOCX, or PPTX — up to {formatBytes(MAX_FILE_BYTES)}.
          </p>
          {fileError && (
            <p className="mt-1.5 text-xs text-[var(--text-primary)]" role="alert">
              {fileError}
            </p>
          )}
          {file && !fileError && (
            <p className="mt-1.5 text-xs text-[var(--text-muted)] truncate">
              {file.name} · {formatBytes(file.size)}
            </p>
          )}
        </div>

        <div className="relative text-center">
          <span className="relative z-10 px-2 bg-[var(--surface)] text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
            or paste a link
          </span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-[var(--border)]" aria-hidden="true" />
        </div>

        <div>
          <label htmlFor="upload-link" className="sr-only">
            External link
          </label>
          <input
            id="upload-link"
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              if (e.target.value) {
                setFile(null);
                setFileError(null);
              }
            }}
            placeholder="https://..."
            className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-transparent text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>

        {touched && !isValid && !fileError && (
          <p className="text-xs text-[var(--text-muted)]">
            Add a title, academic year, and either a file or a link.
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full min-h-11 px-4 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </form>
    </Drawer>
  );
}
