import { z } from 'zod';
import { canWriteCourse, jsonError, requireActiveUser, resourceMetadata, safeExternalUrl, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { deleteResourceFile, uploadResourceFile } from '@/lib/storage';
import { validateUploadedFile } from '@/lib/fileValidation';

export const runtime = 'nodejs';

const querySchema = z.object({
  mine: z.enum(['true']).optional(),
});

export async function GET(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const query = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success) return validationError(query.error);
  if (!query.data.mine && user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);

  return Response.json(await prisma.resource.findMany({
    where: query.data.mine ? { uploadedById: user.id } : {},
    include: { course: { select: { code: true, title: true, level: true, semester: true } } },
    orderBy: { createdAt: 'desc' },
  }));
}

export async function POST(request: Request) {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  const formData = await request.formData().catch(() => null);
  if (!formData) return jsonError('Expected multipart form data');
  const fileValue = formData.get('file');
  const file = fileValue instanceof File ? fileValue : null;
  const parsed = resourceMetadata.safeParse({
    title: formData.get('title'), courseId: formData.get('courseId'), type: formData.get('type'),
    academicYear: formData.get('academicYear'), externalUrl: formData.get('externalUrl') || undefined,
  });
  if (!parsed.success) return validationError(parsed.error);
  if (Boolean(file) === Boolean(parsed.data.externalUrl)) return jsonError('Provide exactly one of file or externalUrl');
  if (parsed.data.externalUrl && !safeExternalUrl(parsed.data.externalUrl)) return jsonError('Links must use HTTPS and point to an approved provider');
  if (!await canWriteCourse(user.id, user.role, parsed.data.courseId)) return jsonError('You cannot upload to this course', 403);

  if (!file) {
    return Response.json(await prisma.resource.create({ data: { ...parsed.data, uploadedById: user.id } }), { status: 201 });
  }
  const fileError = await validateUploadedFile(file);
  if (fileError) return jsonError(fileError);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageKey = `resources/${parsed.data.courseId}/${crypto.randomUUID()}-${safeName}`;
  try {
    await uploadResourceFile(storageKey, file);
    try {
      return Response.json(await prisma.resource.create({
        data: { ...parsed.data, externalUrl: undefined, storageKey, fileSize: file.size, mimeType: file.type, uploadedById: user.id },
      }), { status: 201 });
    } catch (error) {
      await deleteResourceFile(storageKey).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error('Resource upload failed', error);
    return jsonError('Upload could not be completed', 503);
  }
}
