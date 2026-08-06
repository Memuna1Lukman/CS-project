import { z } from 'zod';
import { jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
const schema = z.object({ indexNumber: z.string().trim().min(5).max(40).transform((value) => value.toUpperCase()) });

export async function GET() {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  return Response.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, indexNumber: user.indexNumber, level: user.level, scopes: user.scopes });
}

export async function PATCH(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    return Response.json(await prisma.user.update({ where: { id: user.id }, data: parsed.data }));
  } catch {
    return jsonError('That index number is already linked to another account', 409);
  }
}
