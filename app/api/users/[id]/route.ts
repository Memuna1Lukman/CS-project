import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { computeKnustLevel } from '@/lib/knustLevel';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const level = z.union([z.literal(100), z.literal(200), z.literal(300), z.literal(400)]);
const schema = z.object({ role: z.enum(['STUDENT', 'REP', 'SUPER_ADMIN']).optional(), status: z.enum(['ACTIVE', 'INACTIVE']).optional(), level: level.nullable().optional(), levels: z.array(level).min(1).max(4).optional(), recalculateLevel: z.boolean().optional() });

export async function GET(_: Request, { params }: Context) {
  const actor = await requireActiveUser();
  if (!actor) return jsonError('Authentication required', 401);
  if (actor.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, indexNumber: true, level: true, createdAt: true, scopes: true },
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

  if (parsed.data.recalculateLevel) {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true, indexNumber: true } });
    if (!target) return jsonError('User not found', 404);
    if (target.role !== 'STUDENT') return jsonError('Level can only be recalculated for students');
    if (!target.indexNumber) return jsonError('This user has no index number on file');
    const result = computeKnustLevel(target.indexNumber);
    if (result.status !== 'SUCCESS') {
      return jsonError(
        result.status === 'FUTURE_ENTRY'
          ? 'Index number implies a future entry year — cannot compute a level yet.'
          : result.status === 'BEYOND_SUPPORTED'
            ? `Computed level (${result.level}) is outside the supported range — set it manually.`
            : 'Index number is not in a computable format.'
      );
    }
    parsed.data.level = result.level;
  }

  if (parsed.data.levels && parsed.data.role && parsed.data.role !== 'REP') return jsonError('Level scopes may only be assigned to a rep');
  if (parsed.data.level !== undefined && parsed.data.role && parsed.data.role !== 'STUDENT') return jsonError('A student level may only be assigned to a student');
  try {
    // recalculateLevel isn't a User column — it was already folded into
    // `level` above, so strip it here and don't pass it to Prisma.
    const { levels, recalculateLevel, ...userData } = parsed.data;
    void recalculateLevel;
    return Response.json(await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
