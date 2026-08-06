import { z } from 'zod';
import { jsonError, readableLevels, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
const querySchema = z.object({ q: z.string().trim().min(2).max(120) });

export async function GET(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return validationError(query.error);
  const q = query.data.q;
  const allowedLevels = readableLevels(user);
  const [courses, resources] = await Promise.all([
    prisma.course.findMany({
      where: { level: { in: allowedLevels }, OR: [{ code: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }] },
      include: { _count: { select: { resources: { where: { status: 'ACTIVE' } } } } },
      orderBy: { code: 'asc' }, take: 30,
    }),
    prisma.resource.findMany({
      where: { status: 'ACTIVE', course: { level: { in: allowedLevels } }, OR: [{ title: { contains: q, mode: 'insensitive' } }, { academicYear: { contains: q, mode: 'insensitive' } }, { course: { code: { contains: q, mode: 'insensitive' } } }, { course: { title: { contains: q, mode: 'insensitive' } } }] },
      include: { course: { select: { code: true, title: true, level: true, semester: true } } },
      orderBy: { createdAt: 'desc' }, take: 50,
    }),
  ]);
  return Response.json({ courses: courses.map(({ _count, ...course }: { _count: { resources: number } }) => ({ ...course, resourceCount: _count.resources })), resources });
}
