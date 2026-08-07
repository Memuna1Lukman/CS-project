# Decisions

- Auth = magic-link to @st.knust.edu.gh (Zimbra, no OAuth)
- Files in R2, metadata in Neon Postgres
- Reps = scoped uploaders per level; students read-only; super-admins manage
- Reads are LEVEL-SCOPED (design doc §3, superseding the earlier "open reads"
  decision): a Student or Rep reads only their own level's courses/resources;
  a Super-Admin reads all levels. Writes stay level-scoped for reps as before.
  Enforced once, at the MockLibraryProvider layer, not per-page — mirrors the
  eventual server-side filter.
- Navigation = Level → Semester → Course → Resources (a library, NOT a board/dashboard)
- Colours come ONLY from theme tokens; never hardcode
- Accent = the INK PILL: near-black #1B1C1E with white text in light mode,
  inverting to near-white #F4F4F6 with dark text in dark mode. It is the only
  "primary" — active nav, selected filters, primary buttons. (Replaces the
  earlier periwinkle accent, which is retired.)
- Secondary colour = a candy-tint set used ONLY on small resource-type badges
  (strong colour as text on its own soft tint): slides violet #7C3AED, notes
  blue #2563EB, past questions rose #E11D48, lab manuals green #16A34A,
  books amber #D97706, other neutral #52555B. Never on large surfaces.
- UI direction = light, airy, FLOATING-CARD look: near-white canvas #F4F5F7,
  white cards with large radii (rounded-2xl/3xl) and whisper-soft shadows,
  everything interactive is a rounded-full pill, top bar melts into the canvas
  with its controls as floating white pills, sidebar is an inset floating white
  panel. Light default + dark mode via [data-theme]; font Inter + Geist Mono
- Mock phase = providers stand in for the whole backend: state persists to
  localStorage, and role/scope rules are enforced INSIDE provider reads AND
  mutations (mirroring the future server checks), so pages never bypass them
  and swapping to real Appendix B endpoints touches only the providers
- SUPERSEDES the above / design doc v1.1 §4: Student level is NOW
  AUTO-COMPUTED server-side from a validated 7-digit KNUST index number
  (entry-year + academic-calendar formula, lib/knustLevel.ts), applied
  automatically at onboarding for STUDENT-role accounts only. Capped to this
  app's 100-400 range — anything outside that is left unset for admin review,
  never auto-applied. Reps/admins are never auto-leveled; rep elevation and
  level-scope assignment remain exclusively a super-admin action via
  /admin/users, and a super-admin can always override a computed level.
- Admins can provision a student account directly (email + index number,
  level auto-computed) as a sign-in-failure fallback.
- Reps land on /rep (a dedicated dashboard) as their home instead of the
  generic course-browse page. Admins get a persistent sidebar across all
  /admin/* pages plus more StatCard-style record counts (students, reps) —
  still no charts/trend analytics, that rule stays locked (see UI-SPEC.md).