'use client';

import { useState } from 'react';
import Drawer from './Drawer';
import { useLibrary } from './MockLibraryProvider';
import { useSession } from './MockSessionProvider';
import { RESOURCE_TYPE_LABELS } from '@/lib/resourceType';
import type { Course, ResourceType } from '@/types/resource';

const RESOURCE_TYPES = Object.keys(RESOURCE_TYPE_LABELS) as ResourceType[];

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadResourceDrawer({
  course,
  open,
  onClose,
}: {
  course: Course;
  open: boolean;
  onClose: () => void;
}) {
  const { session } = useSession();
  const { addResource } = useLibrary();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('SLIDES');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = title.trim().length > 0 && academicYear.trim().length > 0 && (Boolean(file) || link.trim().length > 0);

  const reset = () => {
    setTitle('');
    setType('SLIDES');
    setAcademicYear('2025/2026');
    setFile(null);
    setLink('');
    setTouched(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || !session) return;

    // TODO(backend): POST /api/resources — multipart file upload to R2, or a
    // plain link resource; sets uploadedBy from the authenticated user (see
    // Appendix B). This just appends to in-memory mock state.
    addResource({
      title: title.trim(),
      courseCode: course.code,
      courseTitle: course.title,
      level: course.level,
      semester: course.semester,
      type,
      academicYear: academicYear.trim(),
      fileSize: file ? formatBytes(file.size) : undefined,
      externalUrl: link.trim() || undefined,
      uploadedBy: session.email,
    });

    handleClose();
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
            className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
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
            className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--focus)]"
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
            className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>

        <div>
          <label htmlFor="upload-file" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
            File
          </label>
          <input
            id="upload-file"
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              if (e.target.files?.[0]) setLink('');
            }}
            className="w-full text-sm text-[var(--text-primary)] file:mr-3 file:min-h-9 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--surface-2)] file:text-[var(--text-primary)] file:text-xs file:font-semibold"
          />
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
              if (e.target.value) setFile(null);
            }}
            placeholder="https://..."
            className="w-full h-11 px-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-subtle)] text-sm outline-none focus:border-[var(--focus)]"
          />
        </div>

        {touched && !isValid && (
          <p className="text-xs text-[var(--text-muted)]">
            Add a title, academic year, and either a file or a link.
          </p>
        )}

        <button
          type="submit"
          className="w-full min-h-11 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] text-sm font-semibold"
        >
          Upload
        </button>
      </form>
    </Drawer>
  );
}
