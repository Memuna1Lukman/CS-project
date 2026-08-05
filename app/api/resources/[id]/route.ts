import { z } from 'zod';
import { canWriteCourse, jsonError, parseId, requireActiveUser, resourceTypes, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const editSchema = z.object({ title: z.string().trim().min(2).max(180).optional(), type: z.enum(resourceTypes).optional(), academicYear: z.string().regex(/^\d{4}\/\d{4}$/).nullable().optional(), externalUrl: z.string().url().max(2048).nullable().optional() });

async function editableResource(rawId: string, user: Awaited<ReturnType<typeof requireActiveUser>>) {
  const id = parseId(rawId);
  if (!id || !user) return null;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource || !await canWriteCourse(user.id, user.role, resource.courseId)) return null;
  return resource;
}

export async function PATCH(request: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id } = await params;
  const resource = await editableResource(id, user);
  if (!resource) return jsonError('Resource not found or you do not have access', 404);
  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return validationError(parsed.error);
  if (Object.keys(parsed.data).length === 0) return jsonError('Provide at least one field to update');
  if (resource.storageKey && 'externalUrl' in parsed.data && parsed.data.externalUrl) return jsonError('A file resource cannot be changed into an external link');
  return Response.json(await prisma.resource.update({ where: { id: resource.id }, data: parsed.data }));
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id } = await params;
  const resource = await editableResource(id, user);
  if (!resource) return jsonError('Resource not found or you do not have access', 404);
  return Response.json(await prisma.resource.update({ where: { id: resource.id }, data: { status: 'REMOVED' } }));
}
