# CS Resource Hub

A centralized, searchable library of academic materials for the KNUST Computer Science Department — replacing scattered WhatsApp file-sharing with one organized, searchable home for slides, notes, past questions, and assignments.

## What this is

Course reps already collect and share materials in per-class WhatsApp groups. That content is hard to search, expires, and is invisible to new students. This platform gives students a permanent, searchable library — organized as **Level → Semester → Course → Resources** — with course reps uploading within their assigned level and department admins managing structure and moderation.

Full product design and rationale: [`docs/CS-Resource-Hub-Design-v1.1.md`](docs/CS-Resource-Hub-Design-v1.1.md).

## Current status

**Frontend — complete.** Every screen and flow is built and functional: KNUST-email sign-in (mocked), first-login onboarding, browse by Level/Semester/Course, course detail with filters, global search, profile, rep upload + "My uploads," and the full admin suite (courses, users/reps, material requests, resource moderation). Light and dark theme, mobile-responsive, built against `docs/UI-SPEC.md`'s design tokens.

**Backend — merged, integration in progress.** Prisma schema, Auth.js configuration, API routes (courses, resources, users, requests, search, auth), and R2 storage helpers exist under `app/api/`, `lib/`, and `prisma/`, and the project builds cleanly with both halves together. **Not yet complete:**
- Frontend pages are still wired to in-memory mock providers (`MockSessionProvider`, `MockLibraryProvider`) rather than the real API routes in most places.
- A real Neon Postgres database needs to be provisioned and migrated (`prisma/migrations/` is ready to run).
- Local `.env` values (database, Auth.js secret, R2 credentials, email provider) are required and are **not** committed — see Getting Started.

**Still required before production:** production email delivery testing (KNUST/Zimbra deliverability), a distributed rate-limit store, malware scanning, and the Version 2 features listed in the design doc (§13).

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Database / ORM:** PostgreSQL (Neon) via Prisma
- **Auth:** Auth.js — email magic-link, restricted to `@st.knust.edu.gh`
- **File storage:** Cloudflare R2 (S3-compatible)
- **Icons:** lucide-react

Full stack rationale and free-tier budget: design doc §7, §11.

## Getting started

```bash
git clone https://github.com/Memuna1Lukman/CS-project.git
cd CS-project
npm install
npx prisma generate
```

Create a `.env` file at the project root (values from the team's shared vault — never commit this file):

```
DATABASE_URL=
NEXTAUTH_SECRET=
EMAIL_SERVER=
EMAIL_FROM=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

Apply the database schema, then run the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                  Pages (App Router) and API routes (app/api/*)
components/           Reusable UI components
lib/                  Providers, API client, auth/prisma/storage helpers
prisma/               Schema, migrations, seed script
docs/                 Design doc, UI spec, and other project documentation
DECISIONS.md          Locked project decisions (auth model, access rules, palette)
CLAUDE.md / AGENTS.md Instructions read by AI coding agents on this project
```

## Design system

Look and feel — tokens, theming, component conventions, accessibility rules — is defined in [`docs/UI-SPEC.md`](docs/UI-SPEC.md). All colors are CSS custom properties; no component hardcodes a value.

## Roadmap

See design doc §13–§15 for the phased MVP plan and success criteria. Current phase: finishing frontend↔backend integration and database provisioning ahead of a single-level pilot.

## Contributing

Two-person team; see the team's collaboration guide for branching, PR, and review conventions (small, single-purpose branches; PRs into `main`; no direct pushes to `main` once both contributors are active).

## License

Not yet specified.
