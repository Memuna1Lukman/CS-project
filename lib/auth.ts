import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';

export const STUDENT_EMAIL_DOMAIN = '@st.knust.edu.gh';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // EMAIL_SERVER accepts a standard nodemailer connection URL, matching
      // the documented deployment environment. Support both the EMAIL_SERVER_*
      // names and the EMAIL_* names supplied by this project's .env template.
      server: process.env.EMAIL_SERVER ?? {
        host: process.env.EMAIL_SERVER_HOST ?? process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT ?? process.env.EMAIL_PORT ?? 465),
        auth: {
          user: process.env.EMAIL_SERVER_USER ?? process.env.EMAIL_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD ?? process.env.EMAIL_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60,
    }),
  ],
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 },
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      if (!user.email?.toLowerCase().endsWith(STUDENT_EMAIL_DOMAIN)) return false;
      const existing = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() }, select: { status: true } });
      return !existing || existing.status === 'ACTIVE';
    },
  },
  pages: { signIn: '/sign-in' },
};
