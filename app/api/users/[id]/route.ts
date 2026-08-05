import { z } from 'zod';
import { jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ role: z.enum(['STUDENT', 'REP', 'SUPER_ADMIN']).optional(), status: z.enum(['ACTIVE', 'INACTIVE']).optional(), levels: z.array(z.union([z.literal(100), z.literal(200), z.literal(300), z.literal(400)])).max(4).optional() });

export async function GET(_: Request, { params }: Context) {
  const actor = await requireActiveUser();
  if (!actor) return jsonError('Authentication required', 401);
  if (actor.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, indexNumber: true, createdAt: true, scopes: true },
  });
  return user ? Response.json(user) : jsonError('User not found', 404);
}

export async function PATCH(request: Request, { params }: Context) {
  const actor = await requireActiveUser();
  if (!actor) return jsonError('Authentication required', 401);
  if (actor.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { id } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (Object.keys(parsed.data).length === 0) return jsonError('Provide at least one field to update');
  if (parsed.data.levels && parsed.data.role && parsed.data.role !== 'REP') return jsonError('Level scopes may only be assigned to a rep');
  try {
    const { levels, ...userData } = parsed.data;
    return Response.json(await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.update({ where: { id }, data: userData });
      if (levels || (userData.role && userData.role !== 'REP')) {
        await tx.repScope.deleteMany({ where: { userId: id } });
        if (user.role === 'REP' && levels) await tx.repScope.createMany({ data: levels.map((level) => ({ userId: id, level })) });
      }
      return tx.user.findUnique({ where: { id }, include: { scopes: true } });
    }));
  } catch {
    return jsonError('User not found', 404);
  }
}
