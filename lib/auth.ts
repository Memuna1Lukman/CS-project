import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';
import { sendVerificationRequest } from '@/lib/authEmail';

export const STUDENT_EMAIL_DOMAIN = '@st.knust.edu.gh';

// TEMPORARY(dev-only): gmail.com is allowed alongside the KNUST domain so
// email delivery can be tested without a KNUST mailbox. Remove '@gmail.com'
// before any real deployment — the design doc requires KNUST-only sign-in.
const ALLOWED_EMAIL_DOMAINS = [STUDENT_EMAIL_DOMAIN, '@gmail.com'];

export function normalizeStudentEmail(identifier: string) {
  const email = identifier.trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at <= 0 || email.indexOf('@') !== at || !ALLOWED_EMAIL_DOMAINS.some((domain) => email.endsWith(domain))) {
    throw new Error('Use your KNUST student email address.');
  }
  return email;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? 465),
        auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60,
      normalizeIdentifier: normalizeStudentEmail,
      sendVerificationRequest,
    }),
  ],
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 },
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      try {
        return Boolean(user.email && normalizeStudentEmail(user.email));
      } catch {
        return false;
      }
    },
  },
  pages: { signIn: '/sign-in' },
};
