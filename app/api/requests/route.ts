import { z } from 'zod';
import { audit, jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
const requestInput = z.object({ courseCode: z.string().trim().min(3).max(30).optional(), note: z.string().trim().min(3).max(1000) });

export async function POST(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const parsed = requestInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  const materialRequest = await prisma.materialRequest.create({ data: { ...parsed.data, courseCode: parsed.data.courseCode?.toUpperCase() } });
  await audit(user.id, 'MATERIAL_REQUEST_CREATED', 'MaterialRequest', materialRequest.id);
  return Response.json(materialRequest, { status: 201 });
}

export async function GET() {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);
  return Response.json(await prisma.materialRequest.findMany({ orderBy: [{ status: 'asc' }, { createdAt: 'desc' }] }));
}
