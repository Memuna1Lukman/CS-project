import { z } from 'zod';
import { jsonError, levels, readableLevels, requireActiveUser, validationError, courseInput, audit } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const querySchema = z.object({
  level: z.coerce.number().refine((value) => levels.includes(value as (typeof levels)[number])).optional(),
  semester: z.coerce.number().int().min(1).max(2).optional(),
  q: z.string().trim().max(120).optional(),
});

export async function GET(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return validationError(parsed.error);
  const { level, semester, q } = parsed.data;
  const allowedLevels = readableLevels(user);
  if (level && !allowedLevels.includes(level as (typeof levels)[number])) return Response.json([]);

  const courses = await prisma.course.findMany({
    where: {
      ...(level ? { level } : { level: { in: allowedLevels } }),
      ...(semester ? { semester } : {}),
      ...(q ? { OR: [{ code: { contains: q, mode: 'insensitive' } }, { title: { contains: q, mode: 'insensitive' } }] } : {}),
    },
    include: { _count: { select: { resources: { where: { status: 'ACTIVE' } } } } },
    orderBy: [{ level: 'asc' }, { semester: 'asc' }, { code: 'asc' }],
  });
  return Response.json(courses.map(({ _count, ...course }: { _count: { resources: number } }) => ({ ...course, resourceCount: _count.resources })));
}

export async function POST(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const parsed = courseInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const department = parsed.data.departmentId
      ? null
      : await prisma.department.findFirst({ select: { id: true }, orderBy: { id: 'asc' } });
    if (!parsed.data.departmentId && !department) return jsonError('Create the Computer Science department before adding courses', 409);
    const course = await prisma.course.create({ data: { ...parsed.data, departmentId: parsed.data.departmentId ?? department!.id } });
    await audit(user.id, 'COURSE_CREATED', 'Course', course.id, { code: course.code });
    return Response.json(course, { status: 201 });
  } catch {
    return jsonError('Course code already exists or department is invalid', 409);
  }
}
