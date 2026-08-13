import { audit, canWriteCourse, jsonError, requireActiveUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ code: string }> };

// The confirm step of the review workflow — the only way a DRAFT session
// ever becomes visible to students. Never triggered automatically.
export async function POST(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);

  const { code } = await params;
  const course = await prisma.course.findUnique({ where: { code: decodeURIComponent(code).toUpperCase() }, select: { id: true } });
  if (!course) return jsonError('Course not found', 404);
  if (!await canWriteCourse(user.id, user.role, course.id)) return jsonError('You cannot publish this course\'s timetable', 403);

  const result = await prisma.classSession.updateMany({
    where: { courseId: course.id, status: 'DRAFT' },
    data: { status: 'PUBLISHED' },
  });
  if (result.count > 0) {
    await audit(user.id, 'TIMETABLE_PUBLISHED', 'Course', course.id, { count: result.count });
  }

  return Response.json({ published: result.count });
}
