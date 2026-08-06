import { z } from 'zod';
import { canReadLevel, jsonError, requireActiveUser, resourceTypes, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ code: string }> };
const querySchema = z.object({ type: z.enum(resourceTypes).optional(), year: z.string().regex(/^\d{4}\/\d{4}$/).optional() });

export async function GET(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return validationError(query.error);
  const { code } = await params;
  const course = await prisma.course.findUnique({ where: { code: decodeURIComponent(code).toUpperCase() }, select: { id: true, level: true } });
  if (!course) return jsonError('Course not found', 404);
  if (!canReadLevel(user, course.level)) return jsonError('Course not found', 404);
  return Response.json(await prisma.resource.findMany({
    where: { courseId: course.id, status: 'ACTIVE', ...(query.data.type ? { type: query.data.type } : {}), ...(query.data.year ? { academicYear: query.data.year } : {}) },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  }));
}
