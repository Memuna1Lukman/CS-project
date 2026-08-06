import { canReadLevel, jsonError, parseId, requireActiveUser, validationError, courseInput } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

type Context = { params: Promise<{ code: string }> };

export async function GET(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { code } = await params;
  const course = await prisma.course.findUnique({
    where: { code: decodeURIComponent(code).toUpperCase() },
    include: { _count: { select: { resources: { where: { status: 'ACTIVE' } } } }, department: true },
  });
  if (!course) return jsonError('Course not found', 404);
  if (!canReadLevel(user, course.level)) return jsonError('Course not found', 404);
  const { _count, ...result } = course;
  return Response.json({ ...result, resourceCount: _count.resources });
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { code } = await params;
  const parsed = courseInput.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (Object.keys(parsed.data).length === 0) return jsonError('Provide at least one field to update');
  try {
    const where = parseId(code) ? { id: parseId(code)! } : { code: decodeURIComponent(code).toUpperCase() };
    return Response.json(await prisma.course.update({ where, data: parsed.data }));
  } catch {
    return jsonError('Course not found or course code already exists', 404);
  }
}
