import { z } from 'zod';
import { audit, jsonError, levels, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
const schema = z.object({
  indexNumber: z.string().trim().min(5).max(40).transform((value) => value.toUpperCase()).optional(),
  level: z.coerce.number().refine((value) => levels.includes(value as (typeof levels)[number]), 'Level must be 100, 200, 300, or 400').optional(),
  programme: z.string().trim().min(2).max(120).optional(),
  cohortYear: z.coerce.number().int().min(2000).max(2100).optional(),
}).refine((data) => Object.keys(data).length > 0, 'Provide at least one profile field');

export async function GET() {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  // Keep database identifiers and student IDs out of client-facing session data.
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, indexNumber: user.indexNumber, level: user.level, programme: user.programme, cohortYear: user.cohortYear, levelConfirmedAt: user.levelConfirmedAt, scopes: user.scopes.map(({ level }) => ({ level })) });
}

export async function PATCH(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (parsed.data.level && user.role !== 'STUDENT') return jsonError('Only student profiles have a personal level; reps use assigned scopes', 403);
  if (parsed.data.level && user.levelConfirmedAt) return jsonError('Your level has been confirmed. Ask an admin to change it.', 403);
  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data: parsed.data });
    await audit(user.id, 'PROFILE_UPDATED', 'User', user.id, { fields: Object.keys(parsed.data) });
    return Response.json({ name: updated.name, email: updated.email, role: updated.role, status: updated.status, level: updated.level, programme: updated.programme, cohortYear: updated.cohortYear, levelConfirmedAt: updated.levelConfirmedAt });
  } catch {
    return jsonError('That index number is already linked to another account', 409);
  }
}
