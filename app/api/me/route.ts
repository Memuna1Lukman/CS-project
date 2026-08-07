import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { jsonError, requireActiveUser, validationError } from '@/lib/api';
import { prisma } from '@/lib/prisma';
import { computeKnustLevel } from '@/lib/knustLevel';

export const runtime = 'nodejs';
const schema = z.object({ indexNumber: z.string().trim().regex(/^\d{7}$/, 'Index number must be exactly 7 digits') });

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

  const data: Prisma.UserUpdateInput = { indexNumber: parsed.data.indexNumber };
  let levelNotice: string | undefined;

  // Only auto-compute on true first-time onboarding (no index number on file
  // yet) — never overwrite a level an admin has since assigned or corrected.
  if (user.role === 'STUDENT' && user.indexNumber == null) {
    const result = computeKnustLevel(parsed.data.indexNumber);
    if (result.status === 'SUCCESS') {
      data.level = result.level;
    } else if (result.status === 'FUTURE_ENTRY') {
      levelNotice = 'We could not determine your level yet from this index number. An admin will assign it shortly.';
    } else if (result.status === 'BEYOND_SUPPORTED') {
      levelNotice = 'This index number falls outside the supported 100-400 levels. An admin will review your account.';
    } else {
      levelNotice = 'Could not read a level from that index number. An admin will assign it manually.';
    }
  }

  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return Response.json({ ...updated, levelNotice });
  } catch {
    return jsonError('That index number is already linked to another account', 409);
  }
}
