# UI Specification

**Read this before any frontend work.** It defines how the UI is built so the code stays consistent across sessions and contributors. Rules are imperative — follow them literally. Behaviour and data model live in `CS-Resource-Hub-Design-v1.1.md`; this file governs look, feel, and frontend conventions.

The visual language: a **polished, information-rich admin-app look** — a light top bar, a light left sidebar with grouped/expandable nav, and a light canvas holding dense, rounded white cards (mixed sizes, multi-column grids) and compact list rows. Confident typography, soft shadows, one soft accent. **Full light theme by default, with a dark mode** driven entirely by tokens.

---

## Non-negotiables (read first)

1. **Never hardcode a colour.** No hex, `rgb()`, or named colours in components or class strings. Use semantic tokens only (see Tokens). If a colour you need has no token, add it to **both** themes in the theme file and ask the human for values — do **not** invent one.
2. **Semantic tokens only, so themes swap cleanly.** Token names describe role (`--surface`, `--text-primary`), never appearance (`--white`). Light and dark are two value sets of the same tokens; components never know which theme is active.
3. **This is a library, not a dashboard.** Borrow the reference's *shell, card, and list styling* — never its analytics content. No balances, KPIs, charts, gauges, or transaction feeds. The model is **Level → Semester → Course → Resources**. Cards hold courses and resources; list rows hold resources.
4. **Dense and rich, not airy.** Multi-column card grids, mixed card sizes, compact list rows, confident titles/numbers, efficient spacing. More useful content per screen (without clutter).
5. **One soft accent, sparingly.** The accent (periwinkle) appears only on small pills, primary buttons, active nav, and simple progress/among-cues — as a **background under dark ink**, never as pastel text or a full-surface wash.
6. **Mobile-first and accessible.** Design for a narrow screen first; meet the accessibility checklist every time.
7. **Stay in scope.** Build only the assigned task. Do not scaffold auth, backend, or other pages unless told to.

---

## Stack & structure
- Next.js **App Router** + **TypeScript** (strict) + **Tailwind CSS**.
- Server Components by default; add `"use client"` only when interactivity requires it.
- Structure: pages/layouts in `app/`, reusable UI in `components/`, helpers in `lib/`, shared types in `types/`.
- One component per file, PascalCase. Keep components small and presentational; lift data fetching to the page/server layer.
- No new dependencies without flagging why.

## Theming & tokens
All colours, radii, shadows, and spacing come from tokens defined in **one** place (the theme layer, e.g. `globals.css`). Components reference tokens via Tailwind theme classes or `var(--token)`. **Token names are fixed; values are the human's to set.**

**Theme switching:** light is the default under `:root`; dark values live under `[data-theme="dark"]` (toggle sets the attribute on `<html>`). Persist the choice, and respect `prefers-color-scheme` on first visit. Because every colour is a semantic token, no component changes when the theme flips.

Semantic tokens (define a light and a dark value for each):
- Surfaces: `--bg` (canvas) · `--surface` (cards) · `--surface-2` (sidebar / subtle panels) · `--surface-3` (hover/nested)
- Top bar: `--topbar-bg` · `--topbar-fg` (light bar in light theme)
- Text: `--text-primary` · `--text-muted` · `--text-subtle`
- Lines & depth: `--border` · `--focus` · `--shadow`
- Accent: `--accent` (periwinkle `#AEC5FF` in light) · `--accent-fg` (dark ink `#1E2A44` on the accent) · `--accent-subtle` (faint accent tint for active nav backgrounds)
- Radius/spacing via tokens/Tailwind scale — no ad-hoc pixels.

> Accent is periwinkle. In dark mode, keep the accent readable — the accent may shift slightly and `--accent-fg` may need adjusting for contrast; set both value sets, don't invent inline.

## Layout (from the reference)
- **Top bar:** full-width, **light** (`--topbar-bg`), with a search field, right-side icons, and an account chip. A theme (light/dark) toggle lives here.
- **Sidebar:** light (`--surface-2`), generously spaced, **grouped nav with icons and expandable sub-items** (e.g. a Level expands to its Semesters/Courses). Active item is pill-highlighted with `--accent-subtle`. Include a collapse control; on mobile it becomes an off-canvas drawer with a scrim.
- **Content area:** `--bg` canvas holding a **dense, multi-column grid** of cards of mixed sizes, plus compact list sections.

## Aesthetic rules
- **Dense & structured.** Favour multi-column card grids and compact rows; use space efficiently. Not roomy/airy — rich but ordered.
- **Cards.** White (`--surface`), rounded (~14–18px), soft `--shadow`, subtle `--border`. Mixed sizes are encouraged (a wider "feature" card beside smaller ones).
- **List rows.** Compact, aligned rows (leading icon/badge, name + meta, trailing value/action) — used for resource lists and tables. Separated by light `--border` or subtle striping.
- **Confident type.** Strong, sizable titles and key figures (e.g. a resource count); small muted labels for context.
- **Accent discipline.** Periwinkle only on pills, primary buttons, active nav, and simple progress indicators — always as a background under `--accent-fg`.
- **Depth via soft shadow + fill,** not heavy borders.

## Typography
- Neutral sans for UI/body; clear hierarchy from size + weight; muted greys for meta.
- Tabular numbers for sizes, counts, dates.
- Course codes (e.g. `CSM 158`) render in a small **monospace** chip on a neutral fill — the app's signature detail. Keep unless told otherwise.

## Component conventions
Build as reusable components; each handles its states, both themes, and keyboard access.
- **TopBar** — light bar: search, icons, account, **theme toggle**. Role-specific controls render conditionally.
- **Sidebar** — light, grouped, expandable nav (Levels → Semesters/Courses); active item on `--accent-subtle`; collapse control; mobile drawer.
- **StatCard** *(library-appropriate only)* — a small rich card for real library facts (e.g. "resources this level", "recently added", "most-downloaded course"). **Never** financial/KPI/chart content.
- **CourseCard** — dense white card: mono code chip, bold title, muted lecturer, an accent "N resources" pill, optional quiet "↗".
- **ResourceRow** — compact row: leading type badge, title, muted academic year, **file size** (tabular), trailing Download button (accent) or "open" for links.
- **Pill / Badge** — small, rounded; accent (`--accent` + `--accent-fg`) for accented states, neutral otherwise.
- **Button** — primary = `--accent` bg + `--accent-fg`; secondary = `--surface` with `--border`.
- **Drawer / Modal** — upload & dialogs; focus-trapped, `Esc` closes, `aria`-labelled.
- **EmptyState** — centred card, one line of `--text-muted`.

## Navigation & routes
- Flow: Level → Semester → Course → Resources, plus global search. Never a board or metrics dashboard.
- Routes follow the page inventory: `/login`, onboarding, `/` (browse), `/courses/[code]`, `/search`, `/profile`, rep uploads, `/admin/*`.
- Reps and admins get **extra controls on shared pages** (rendered by role), not duplicate pages.

## Accessibility checklist (every task)
- Semantic HTML (`nav`, `main`, `button`, `ul/li`); never a `div` for interactive elements.
- Visible keyboard focus using `--focus`; full keyboard operability; expandable nav items toggle with keyboard and expose `aria-expanded`.
- Sufficient text contrast in **both** themes; dark `--accent-fg` on the accent (accent is too light for white text).
- All images have `alt`; meaningful icons have accessible labels.
- Comfortable tap targets on mobile (~44px).
- Drawers/modals: focus trap, `Esc` to close, restore focus on close.
- The theme toggle is a labelled control; state exposed to assistive tech.

## Responsive
- Mobile-first: sidebar collapses to a drawer; card grids reflow to one column; no horizontal scroll.
- Enhance to sidebar + dense multi-column grids at larger breakpoints. Test the narrow view first.

## Data & state
- During UI-only phases, use mock data from `lib/` — never invent a backend or call APIs not in the spec. Mark future data/actions with `// TODO(backend)` naming the Appendix B endpoint.
- Always render **loading, empty, and error** states, not just the happy path.
- Show file size next to every download (students are on limited mobile data).

## Anti-patterns — never do these
- ❌ Hardcoded colours anywhere. ❌ Appearance-named tokens (`--white`, `--navy`). ❌ Analytics/dashboard content (balances, KPIs, charts, gauges, transaction feeds). ❌ An airy/sparse layout — this is dense/rich. ❌ Accent as text or full background. ❌ A layout that breaks in dark mode. ❌ Committing `.env`. ❌ Building beyond the assigned task.

## Definition of done (self-check before finishing)
- [ ] No hardcoded colours; only semantic tokens; both light and dark values set for any new token.
- [ ] Works in **both** light and dark mode.
- [ ] Dense, rich card/list look — light top bar, light sidebar with expandable nav.
- [ ] Accent (periwinkle) only on pills/buttons/active-nav as a background with dark ink.
- [ ] Library content, not a dashboard/board.
- [ ] Mobile-first; accessibility checklist met.
- [ ] Loading/empty/error states handled.
- [ ] Only the assigned task was built; `npm run build` passes.
