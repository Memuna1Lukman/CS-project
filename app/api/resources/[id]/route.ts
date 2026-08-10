import { z } from 'zod';
import { audit, canWriteCourse, jsonError, parseId, requireActiveUser, resourceTypes, safeExternalUrl, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };
const editSchema = z.object({ title: z.string().trim().min(2).max(180).optional(), type: z.enum(resourceTypes).optional(), academicYear: z.string().regex(/^\d{4}\/\d{4}$/).optional(), externalUrl: z.string().url().max(2048).optional() });

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
  if (parsed.data.externalUrl && !safeExternalUrl(parsed.data.externalUrl)) return jsonError('Links must use HTTPS and point to an approved provider');
  if (resource.storageKey && 'externalUrl' in parsed.data && parsed.data.externalUrl) return jsonError('A file resource cannot be changed into an external link');
  const updated = await prisma.resource.update({ where: { id: resource.id }, data: parsed.data });
  try {
    await audit(user.id, 'RESOURCE_UPDATED', 'Resource', updated.id, parsed.data);
  } catch (error) {
    await prisma.resource.update({
      where: { id: resource.id },
      data: {
        title: resource.title,
        type: resource.type,
        academicYear: resource.academicYear,
        externalUrl: resource.externalUrl,
      },
    }).catch(() => undefined);
    console.error('Resource update audit failed', error);
    return jsonError('Resource update could not be completed', 503);
  }
  return Response.json(updated);
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id } = await params;
  const resource = await editableResource(id, user);
  if (!resource) return jsonError('Resource not found or you do not have access', 404);
  const updated = await prisma.resource.update({ where: { id: resource.id }, data: { status: 'REMOVED' } });
  try {
    await audit(user.id, 'RESOURCE_REMOVED', 'Resource', updated.id);
  } catch (error) {
    await prisma.resource.update({ where: { id: resource.id }, data: { status: resource.status } }).catch(() => undefined);
    console.error('Resource removal audit failed', error);
    return jsonError('Resource removal could not be completed', 503);
  }
  return Response.json(updated);
}
