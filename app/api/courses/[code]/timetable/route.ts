import { z } from 'zod';
import { audit, canReadLevel, canWriteCourse, jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ code: string }> };

const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const querySchema = z.object({ status: z.enum(['draft']).optional() });

const manualSessionSchema = z.object({
  dayOfWeek: z.enum(days),
  startTime: z.string().regex(timePattern, 'Use 24h HH:MM'),
  endTime: z.string().regex(timePattern, 'Use 24h HH:MM'),
  room: z.string().trim().max(60).optional(),
  lecturer: z.string().trim().max(120).optional(),
});

// PUBLISHED sessions follow the same read-scope rule as resources/videos
// (student/rep own level, super-admin all). The DRAFT review queue is only
// ever returned to a rep/admin who can write to this course.
export async function GET(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return validationError(query.error);

  const { code } = await params;
  const course = await prisma.course.findUnique({ where: { code: decodeURIComponent(code).toUpperCase() }, select: { id: true, level: true } });
  if (!course) return jsonError('Course not found', 404);
  if (!canReadLevel(user, course.level)) return jsonError('Course not found', 404);

  if (query.data.status === 'draft') {
    if (!await canWriteCourse(user.id, user.role, course.id)) return jsonError('You cannot review this course\'s timetable', 403);
    return Response.json(await prisma.classSession.findMany({
      where: { courseId: course.id, status: 'DRAFT' },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }));
  }

  return Response.json(await prisma.classSession.findMany({
    where: { courseId: course.id, status: 'PUBLISHED' },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  }));
}

// Manual "add row" for anything AI missed — lands as DRAFT just like an
// extracted row, so it goes through the same review/publish confirmation.
export async function POST(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);

  const { code } = await params;
  const course = await prisma.course.findUnique({ where: { code: decodeURIComponent(code).toUpperCase() }, select: { id: true } });
  if (!course) return jsonError('Course not found', 404);
  if (!await canWriteCourse(user.id, user.role, course.id)) return jsonError('You cannot edit this course\'s timetable', 403);

  const parsed = manualSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (parsed.data.endTime <= parsed.data.startTime) return jsonError('End time must be after start time');

  const session = await prisma.classSession.create({
    data: { ...parsed.data, courseId: course.id, status: 'DRAFT', createdById: user.id },
  });
  await audit(user.id, 'CLASS_SESSION_ADDED', 'ClassSession', session.id, { courseId: course.id, kind: 'manual' });

  return Response.json(session, { status: 201 });
}
