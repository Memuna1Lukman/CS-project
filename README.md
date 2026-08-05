# CS Resource Hub backend

The database schema and API specified in `CS-Resource-Hub-Design-v1.1.md` are implemented with Prisma, Auth.js, Zod, and Cloudflare R2.

## Local setup

1. Copy `.env.example` to `.env` and replace every placeholder. Use a Neon Postgres connection string for `DATABASE_URL`.
2. Run `npm run db:generate`, then `npm run db:deploy` to apply the included initial migration.
3. Run `npm run db:seed` to create the Computer Science department and the 16 current course-catalog entries.
4. Start the app with `npm run dev`.

The API requires a valid magic-link session. Auth.js only accepts addresses ending in `@st.knust.edu.gh`; configure `EMAIL_SERVER_*` with a Resend/Brevo SMTP account. File uploads additionally require the `R2_*` settings. Files are capped at 15 MB and only the whitelisted document formats in `app/api/resources/route.ts` are accepted.

## Endpoint summary

- `GET/POST /api/courses`, `GET /api/courses/:code`, `PATCH /api/courses/:id-or-code`
- `GET /api/courses/:code/resources`, `POST /api/resources`, `PATCH/DELETE /api/resources/:id`
- `GET /api/resources/:id/download`, `POST/GET /api/requests`, `PATCH /api/requests/:id`
- `GET/PATCH /api/me`, `GET/PATCH /api/users/:id`, `GET /api/users`, `GET /api/resources?mine=true`, `GET /api/search?q=`, and Auth.js at `/api/auth/*`

Every endpoint validates input. Reads require an active signed-in student; writes enforce the rep-level scope or super-admin role on the server.
