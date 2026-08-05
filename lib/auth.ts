import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '@/lib/prisma';

export const STUDENT_EMAIL_DOMAIN = '@st.knust.edu.gh';

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
    }),
  ],
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 90, updateAge: 60 * 60 * 24 },
  callbacks: {
    async signIn({ user }: { user: { email?: string | null } }) {
      return Boolean(user.email?.toLowerCase().endsWith(STUDENT_EMAIL_DOMAIN));
    },
  },
  pages: { signIn: '/sign-in' },
};
