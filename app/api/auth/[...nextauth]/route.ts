import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { allowRequest } from '@/lib/rateLimit';

const handler = NextAuth(authOptions);

export { handler as GET };

export async function POST(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  let email = '';
  try {
    email = String((await request.clone().formData()).get('email') || '').trim().toLowerCase();
  } catch {
    // Auth.js also receives POST callbacks without form data.
  }
  const tooManyRequests = !allowRequest(`auth:ip:${ip}`, 10, 15 * 60 * 1000)
    || (email.length > 0 && !allowRequest(`auth:email:${email}`, 3, 15 * 60 * 1000));
  if (tooManyRequests) return Response.json({ error: 'Please wait before requesting another sign-in email.' }, { status: 429 });
  return handler(request, context);
}
