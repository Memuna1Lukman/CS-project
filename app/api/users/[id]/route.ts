import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { jsonError, levels, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const schema = z.object({
  role: z.enum(['STUDENT', 'REP', 'SUPER_ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  levels: z.array(z.union([z.literal(100), z.literal(200), z.literal(300), z.literal(400)])).max(4).optional(),
  level: z.coerce.number().refine((value) => levels.includes(value as (typeof levels)[number]), 'Level must be 100, 200, 300, or 400').nullable().optional(),
  programme: z.string().trim().min(2).max(120).nullable().optional(),
  cohortYear: z.coerce.number().int().min(2000).max(2100).nullable().optional(),
  confirmLevel: z.boolean().optional(),
});

export async function GET(_: Request, { params }: Context) {
  const actor = await requireActiveUser();
  if (!actor) return jsonError('Authentication required', 401);
  if (actor.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, indexNumber: true, level: true, programme: true, cohortYear: true, levelConfirmedAt: true, createdAt: true, scopes: true },
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
    const { levels: repLevels, confirmLevel, ...userData } = parsed.data;
    return Response.json(await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const data = confirmLevel === undefined ? userData : { ...userData, levelConfirmedAt: confirmLevel ? new Date() : null };
      const user = await tx.user.update({ where: { id }, data });
      if (repLevels || (userData.role && userData.role !== 'REP')) {
        await tx.repScope.deleteMany({ where: { userId: id } });
        if (user.role === 'REP' && repLevels) await tx.repScope.createMany({ data: repLevels.map((level) => ({ userId: id, level })) });
      }
      await tx.auditLog.create({ data: { actorId: actor.id, action: 'USER_UPDATED', entity: 'User', entityId: id, metadata: { fields: Object.keys(parsed.data) } } });
      return tx.user.findUnique({ where: { id }, include: { scopes: true } });
    }));
  } catch {
    return jsonError('User not found', 404);
  }
}
