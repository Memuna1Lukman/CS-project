import { jsonError, requireActiveUser } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const user = await requireActiveUser();
  if (!user) return jsonError('Authentication required', 401);
  if (user.role !== 'SUPER_ADMIN') return jsonError('Super-admin access required', 403);

  return Response.json(await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, indexNumber: true, level: true, programme: true, cohortYear: true, levelConfirmedAt: true, createdAt: true, scopes: true },
    orderBy: { createdAt: 'desc' },
  }));
}
