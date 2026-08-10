import { canReadLevel, jsonError, parseId, requireActiveUser, safeExternalUrl } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { signedDownloadUrl } from '@/lib/storage';

export const runtime = 'nodejs';
type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return jsonError('Invalid resource id');
  const resource = await prisma.resource.findUnique({ where: { id }, include: { course: { select: { level: true } } } });
  if (!resource || resource.status !== 'ACTIVE') return jsonError('Resource not found', 404);
  if (!canReadLevel(user, resource.course.level)) return jsonError('Resource not found', 404);
  if (resource.externalUrl) {
    if (!safeExternalUrl(resource.externalUrl)) return jsonError('This link is no longer available', 410);
    await prisma.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch((error) => {
      console.error('Resource open count update failed', error);
    });
    return Response.redirect(resource.externalUrl, 302);
  }
  if (!resource.storageKey) return jsonError('Resource has no downloadable file', 409);
  try {
    const extension = resource.storageKey.match(/\.([a-z0-9]+)$/i)?.[1];
    const downloadName = extension && !resource.title.toLowerCase().endsWith(`.${extension.toLowerCase()}`)
      ? `${resource.title}.${extension}`
      : resource.title;
    const url = await signedDownloadUrl(resource.storageKey, downloadName, resource.mimeType ?? undefined);
    await prisma.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch((error) => {
      console.error('Resource download count update failed', error);
    });
    return Response.redirect(url, 302);
  } catch (error) {
    console.error('Signed URL creation failed', error);
    return jsonError('Download is temporarily unavailable', 503);
  }
}
