# Production setup checklist

Do not deploy until every item below is complete.

## Accounts and resources to create

1. **Neon** — create one production Postgres database and retain its pooled `DATABASE_URL`.
2. **Cloudflare R2** — create a private bucket named `cs-resource-hub` and an API token limited to that bucket with object read/write/delete permission.
3. **Resend** (or Brevo SMTP) — verify a sending domain, publish its SPF/DKIM records, and create SMTP credentials. Test delivery to several `@st.knust.edu.gh` inboxes before launch.
4. **Vercel** — create the production project and custom domain. Set `NEXTAUTH_URL` to its canonical HTTPS URL.
5. **Shared rate limit service** — create an Upstash Redis database or configure Vercel WAF rate limiting for `/api/auth/*`. The local limiter in this repository is development-only and does not protect across production instances.

## Credentials and settings

Copy `.env.example` to `.env` locally. Enter all values only in the password manager and Vercel environment settings; never commit `.env`.

Generate `NEXTAUTH_SECRET` with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Required data and access decisions

1. Confirm the accepted student-email domain(s) with KNUST.
2. Supply the two founder email addresses. Promote them to `SUPER_ADMIN` directly in the production database after their first sign-in.
3. Provide a verified course catalogue for the pilot Level 100; replace the illustrative seed data before use.
4. Student level is auto-computed from a validated 7-digit index number at onboarding (`lib/knustLevel.ts`) — confirm `ACADEMIC_YEAR_START_MONTH` matches KNUST's actual academic calendar before launch. This is still not a roster integration: the index number's *format* is validated and its entry year computed deterministically, but its authenticity is not verified against an external roster. A super-admin can override any computed level, and should manually review/assign accounts the computation flags as out of range (future entry year, or beyond the supported 100–400 levels).
5. Assign each course rep the `REP` role and one or more `RepScope` levels.

## Release sequence

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run lint
npm run build
```

Deploy only after these checks pass, magic-link delivery succeeds, and a student/restricted-rep/admin access test confirms all level boundaries.
