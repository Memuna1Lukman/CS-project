import { z } from 'zod';
import { audit, jsonError, parseId, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(['OPEN', 'FULFILLED', 'DISMISSED']) });

export async function PATCH(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return jsonError('Invalid request id');
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  try {
    const materialRequest = await prisma.materialRequest.update({ where: { id }, data: parsed.data });
    await audit(user.id, 'MATERIAL_REQUEST_UPDATED', 'MaterialRequest', id, { status: parsed.data.status });
    return Response.json(materialRequest);
  } catch {
    return jsonError('Material request not found', 404);
  }
}
