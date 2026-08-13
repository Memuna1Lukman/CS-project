import { audit, canWriteCourse, jsonError, requireActiveUser } from '@/lib/api';
import { validateTimetableFile } from '@/lib/fileValidation';
import { GeminiApiError, extractTimetableFromFile } from '@/lib/gemini';
import { currentAcademicYearLabel } from '@/lib/knustLevel';
import { prisma } from '@/lib/prisma';
import { allowRequest } from '@/lib/rateLimit';
import { uploadResourceFile } from '@/lib/storage';

export const runtime = 'nodejs';
type Context = { params: Promise<{ code: string }> };

// One extraction run per course every 5 minutes — mirrors the video-suggest
// cooldown (design doc §5): a client-side disable plus this server-side
// backstop against accidentally burning the Gemini quota.
const EXTRACT_COOLDOWN_MS = 5 * 60 * 1000;

export async function POST(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);

  const { code } = await params;
  const course = await prisma.course.findUnique({
    where: { code: decodeURIComponent(code).toUpperCase() },
    select: { id: true, code: true, title: true },
  });
  if (!course) return jsonError('Course not found', 404);
  if (!await canWriteCourse(user.id, user.role, course.id)) return jsonError('You cannot upload a timetable for this course', 403);

  if (!allowRequest(`timetable-extract:course:${course.id}`, 1, EXTRACT_COOLDOWN_MS)) {
    return jsonError('A timetable was just uploaded for this course — try again in a few minutes.', 429);
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File)) return jsonError('Expected a file upload');

  const fileError = await validateTimetableFile(file);
  if (fileError) return jsonError(fileError);

  // The uploaded file is kept as a normal TIMETABLE resource regardless of
  // whether AI extraction below succeeds — it's the reference copy students
  // (and the rep, on a re-upload) can always fall back to.
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  const storageKey = `resources/${course.id}/${crypto.randomUUID()}-${safeName}`;
  let resource: Awaited<ReturnType<typeof prisma.resource.create>>;
  try {
    await uploadResourceFile(storageKey, file);
    resource = await prisma.resource.create({
      data: {
        title: `Timetable — ${file.name}`,
        type: 'TIMETABLE',
        academicYear: currentAcademicYearLabel(),
        storageKey,
        fileSize: file.size,
        mimeType: file.type,
        courseId: course.id,
        uploadedById: user.id,
      },
    });
  } catch (error) {
    console.error('Timetable file upload failed', error);
    return jsonError('Upload could not be completed', 503);
  }
  await audit(user.id, 'RESOURCE_UPLOADED', 'Resource', resource.id, { courseId: course.id, type: 'TIMETABLE', kind: 'file' });

  let sessions;
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    sessions = await extractTimetableFromFile(bytes, file.type, course.code, course.title);
  } catch (error) {
    const message =
      error instanceof GeminiApiError ? error.message : "Couldn't read this timetable — try a clearer photo or enter manually.";
    console.error('Timetable extraction failed', error);
    // The file is already saved (see above) — extraction failure only means
    // no DRAFT rows were created, never a broken upload or a crashed page.
    return jsonError(message, 502);
  }

  if (sessions.length === 0) {
    return Response.json({
      created: 0,
      resourceId: resource.id,
      message: "We couldn't confidently read this timetable — please add sessions manually, or try a clearer upload.",
    });
  }

  const created = await prisma.$transaction(
    sessions.map((s) =>
      prisma.classSession.create({
        data: {
          courseId: course.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          room: s.room || undefined,
          lecturer: s.lecturer || undefined,
          status: 'DRAFT',
          sourceResourceId: resource.id,
          createdById: user.id,
        },
      })
    )
  );
  await audit(user.id, 'TIMETABLE_EXTRACTED', 'Course', course.id, { resourceId: resource.id, count: created.length });

  return Response.json({ created: created.length, resourceId: resource.id, sessions: created });
}
