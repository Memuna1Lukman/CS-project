import { z } from 'zod';
import { audit, canWriteCourse, jsonError, parseId, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const editSchema = z.object({
  dayOfWeek: z.enum(days).optional(),
  startTime: z.string().regex(timePattern, 'Use 24h HH:MM').optional(),
  endTime: z.string().regex(timePattern, 'Use 24h HH:MM').optional(),
  room: z.string().trim().max(60).nullable().optional(),
  lecturer: z.string().trim().max(120).nullable().optional(),
});

async function editableSession(rawId: string, user: Awaited<ReturnType<typeof requireActiveUser>>) {
  const id = parseId(rawId);
  if (!id || !user) return null;
  const session = await prisma.classSession.findUnique({ where: { id } });
  if (!session || !await canWriteCourse(user.id, user.role, session.courseId)) return null;
  return session;
}

// Inline corrections on the review screen (day/time/room/lecturer) — used on
// both DRAFT rows (pre-publish review) and PUBLISHED rows (fixing a mistake
// after the fact), same scope check either way.
export async function PATCH(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id } = await params;
  const session = await editableSession(id, user);
  if (!session) return jsonError('Session not found or you do not have access', 404);

  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (Object.keys(parsed.data).length === 0) return jsonError('Provide at least one field to update');

  const nextStart = parsed.data.startTime ?? session.startTime;
  const nextEnd = parsed.data.endTime ?? session.endTime;
  if (nextEnd <= nextStart) return jsonError('End time must be after start time');

  const updated = await prisma.classSession.update({ where: { id: session.id }, data: parsed.data });
  await audit(user.id, 'CLASS_SESSION_UPDATED', 'ClassSession', updated.id, { courseId: session.courseId });

  return Response.json(updated);
}

// Hard delete, not soft — these rows carry no download/audit weight of their
// own once removed (unlike Resource/RecommendedVideo), so there's nothing
// worth keeping a tombstone for.
export async function DELETE(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id } = await params;
  const session = await editableSession(id, user);
  if (!session) return jsonError('Session not found or you do not have access', 404);

  await prisma.classSession.delete({ where: { id: session.id } });
  await audit(user.id, 'CLASS_SESSION_DELETED', 'ClassSession', session.id, { courseId: session.courseId });

  return Response.json({ ok: true });
}
