# UI Specification

**Read this before any frontend work.** It defines how the UI is built so the code stays consistent across sessions and contributors. Rules are imperative — follow them literally. Behaviour and data model live in `CS-Resource-Hub-Design-v1.1.md`; this file governs look, feel, and frontend conventions.

The visual language follows the reference: a **calm, airy, light SaaS look** — a dark top bar, a light sidebar, and a light-grey canvas holding rounded white cards with soft shadows, big titles, and a single soft-pastel accent.

---

## Non-negotiables (read first)

1. **Never hardcode a colour.** No hex, `rgb()`, or named colours in components or class strings. Use design tokens only (see Tokens). If a colour you need has no token, add the token in the theme file and ask the human for its value — do **not** invent one.
2. **This is a library, not a dashboard.** Borrow the reference's *shell and card style*, never its analytics content. No KPI tiles, revenue numbers, charts, or graphs. The model is **Level → Semester → Course → Resources**.
3. **Airy and card-based.** Rounded white cards, generous padding, soft shadows, roomy spacing, large titles. Do **not** build a dense/hairline layout.
4. **One soft accent, sparingly.** The pastel accent appears only on small pills and primary buttons, as a **background with dark text** — never as pastel text, thin lines, or a full-surface wash.
5. **Mobile-first and accessible.** Design for a narrow screen first; meet the accessibility checklist every time.
6. **Stay in scope.** Build only the assigned task. Do not scaffold auth, backend, or other pages unless told to.

---

## Stack & structure
- Next.js **App Router** + **TypeScript** (strict) + **Tailwind CSS**.
- Server Components by default; add `"use client"` only when interactivity requires it.
- Structure: pages/layouts in `app/`, reusable UI in `components/`, helpers in `lib/`, shared types in `types/`.
- One component per file, PascalCase. Keep components small and presentational; lift data fetching to the page/server layer.
- No new dependencies without flagging why.

## Design tokens
All colours, radii, shadows, and spacing come from tokens defined in **one** place (the theme layer, e.g. `globals.css`). Components reference tokens via Tailwind theme classes or `var(--token)`. Never inline raw values. Token **names are fixed; values are the human's to set** — leave undefined ones as-is and flag them.

- Surfaces: `--bg` (light-grey canvas) · `--surface` (white cards) · `--surface-2` (subtle panels/sidebar) · `--topbar-bg` (dark top bar) · `--topbar-text` (light text on the bar)
- Text: `--text` (primary) · `--text-muted` (secondary/meta)
- Accent: `--accent` (the soft pastel) · `--accent-ink` (dark text placed on the accent)
- Lines & depth: `--border` (subtle) · `--focus` (focus ring) · `--shadow` (soft card shadow)
- Radius/spacing via tokens/Tailwind scale — don't hardcode ad-hoc pixels.

> The accent is a soft pastel of your choosing (e.g. lavender / periwinkle / peach / blush from the accent preview, or your own). Set `--accent` once; the whole UI follows it.

## Layout (from the reference)
- **Top bar:** full-width, `--topbar-bg` (dark), `--topbar-text`. Holds the brand, a search field, and account/primary nav. Slim and calm.
- **Sidebar:** light (`--surface`/`--surface-2`), grouped navigation with small icons and muted labels; the active item is softly highlighted (subtle fill or a faint accent tint). This is where **Level → Semester → Course** navigation lives. Collapses to a drawer on mobile.
- **Content area:** `--bg` canvas holding white cards. Generous outer padding; airy gaps between cards.

## Aesthetic rules
- **Airy, not dense.** Comfortable padding inside cards; breathing room between them.
- **Soft depth, not hairlines.** Separation comes from white cards on a light canvas plus a soft `--shadow`, not 1px dividers. Borders are subtle where used.
- **Big, confident titles.** Strong weight and size on headings and card titles; muted `--text-muted` for meta.
- **Rounded and friendly.** Cards ~16–20px radius; pills fully rounded; buttons ~10–12px.
- **Accent discipline.** Pastel only on small pills (counts, status, type) and primary buttons, always as a background under dark `--accent-ink`.
- Optional detail from the reference: a small "↗" affordance on cards is fine; keep it quiet.

## Typography
- Neutral sans for UI/body. Clear hierarchy from **size + weight**, with muted greys for meta.
- Tabular numbers for sizes, counts, dates.
- Course codes (e.g. `CSM 158`) render in a small **monospace** chip on a neutral grey fill — the app's signature detail. Keep unless told otherwise.

## Component conventions
Build these as reusable components; each handles its states and is keyboard-accessible.
- **TopBar** — dark bar: brand, search, account. Role-specific controls render conditionally, not as separate bars.
- **Sidebar** — light grouped nav (Levels, then Semesters/Courses); active item highlighted; collapsible on mobile.
- **CourseCard** — airy white card: mono code chip, large course title, muted lecturer, a pastel "N resources" pill, optional quiet "↗".
- **ResourceRow / ResourceCard** — title, small type pill, muted academic year, **file size shown** (tabular), and a pastel "Download" button. Links show an "open" affordance instead.
- **Pill** — small, fully rounded; pastel (`--accent` + `--accent-ink`) for accented states, neutral grey otherwise.
- **Button** — primary = `--accent` background + `--accent-ink` text; secondary = white with subtle `--border`.
- **Drawer / Modal** — upload and dialogs; focus-trapped, `Esc` closes, `aria`-labelled.
- **EmptyState** — centred white card, one line of `--text-muted`.

## Navigation & routes
- Flow: Level → Semester → Course → Resources, plus global search. Never a board or a metrics dashboard.
- Routes follow the page inventory: `/login`, onboarding, `/` (browse), `/courses/[code]`, `/search`, `/profile`, rep uploads, `/admin/*`.
- Reps and admins get **extra controls on shared pages** (rendered by role), not duplicate pages.

## Accessibility checklist (every task)
- Semantic HTML (`nav`, `main`, `button`, `ul/li`); never a `div` for interactive elements.
- Visible keyboard focus using `--focus`; full keyboard operability.
- Sufficient text contrast against `--bg`/`--surface`; dark `--accent-ink` on the pastel (pastel is too light for white text).
- All images have `alt`; meaningful icons have accessible labels.
- Comfortable tap targets on mobile (min ~44px).
- Drawers/modals: focus trap, `Esc` to close, restore focus on close.

## Responsive
- Mobile-first: sidebar collapses to a drawer; content is single-column; no horizontal scroll.
- Enhance to sidebar + multi-column card grids at larger breakpoints. Test the narrow view first.

## Data & state
- During UI-only phases, use mock data from `lib/` — never invent a backend or call APIs not in the spec.
- Always render **loading, empty, and error** states, not just the happy path.
- Show file size next to every download (students are on limited mobile data).

## Anti-patterns — never do these
- ❌ Hardcoded colours anywhere. ❌ Analytics/dashboard content (KPIs, charts, revenue). ❌ A dense/hairline layout. ❌ Pastel text or full pastel backgrounds. ❌ Overusing the accent. ❌ Committing `.env` or secrets. ❌ Building beyond the assigned task.

## Definition of done (self-check before finishing)
- [ ] No hardcoded colours; only tokens used.
- [ ] Airy, card-based, soft-shadow look — dark top bar, light sidebar.
- [ ] Accent used only on pills/buttons as a background with dark text.
- [ ] Library navigation, not a board or dashboard.
- [ ] Mobile-first; accessibility checklist met.
- [ ] Loading/empty/error states handled.
- [ ] Only the assigned task was built; `npm run build` passes.
