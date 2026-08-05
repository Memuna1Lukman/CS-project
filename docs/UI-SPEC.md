# UI Specification (v2 — light "floating card" reference)

**Read this before any frontend work.** It replaces the previous spec entirely.
The visual language is derived from a single reference screenshot: a **light,
airy, friendly productivity-app look** — a near-white canvas, floating white
cards with large radii and whisper-soft shadows, a dark **ink pill** for every
active/primary control, and a small family of soft candy-tinted status colours
used sparingly on pills and badges. Behaviour and data model live in
`CS-Resource-Hub-Design-v1.1.md`; this file governs look, feel, and frontend
conventions only.

**This is still a course-materials library, not a dashboard.** Take the
reference's palette, card style, pills, and polish — never its content. No
charts, donuts, KPIs, invoices, meetings, or financial anything. The model
stays **Level → Semester → Course → Resources**.

---

## Non-negotiables

1. **Never hardcode a colour.** No hex, `rgb()`, or named colours in
   components or class strings. Semantic tokens only. A missing colour gets a
   new token in **both** themes in `globals.css` — never an inline value.
2. **Token names describe role, not appearance** (`--surface`,
   `--text-muted`, `--type-slides`), so themes swap cleanly. Components never
   know which theme is active.
3. **One primary accent: the ink pill.** `--accent` is near-black ink in
   light mode (white text via `--accent-fg`) and inverts to near-white in dark
   mode (dark text). It marks the active nav item, segmented-control selection,
   and every primary button. Nothing else is "primary".
4. **Candy tints are for metadata only.** The soft colour set
   (`--type-*` pairs) appears on small resource-type badges and pills — a
   strong colour for text/icon on its `-soft` tint background. Never as page
   or card washes, never on large surfaces, never as body text colour.
5. **Airy, floating, friendly.** White cards float on the near-white canvas
   with big radii (`rounded-2xl`/`rounded-3xl`), generous padding, and very
   soft shadows. Depth comes from shadow + fill, not borders (borders are
   whisper-light and optional).
6. **Mobile-first and accessible.** Design at ~375 px first; meet the
   accessibility checklist every time.
7. **Stay in scope.** Build only the assigned task.

---

## Stack & structure
- Next.js App Router + TypeScript (strict) + Tailwind CSS. Server Components
  by default; `"use client"` only when interactivity requires it.
- Pages in `app/`, reusable UI in `components/`, helpers in `lib/`, shared
  types in `types/`. One component per file, PascalCase.
- No new dependencies without flagging why.

## Tokens (defined once in `globals.css`, light + dark values for each)

Surfaces & lines:
- `--bg` — the near-white canvas everything floats on.
- `--surface` — white cards, bars, drawers.
- `--surface-2` — input fills, neutral chips, subtle wells inside cards.
- `--surface-3` — hover fills.
- `--border` — whisper-light hairlines.
- `--shadow` — the soft card shadow colour. `--scrim` — drawer/modal overlay.
- `--focus` — visible keyboard-focus ring.

Text:
- `--text-primary` (near-black ink) · `--text-muted` (grey) · `--text-subtle`
  (light grey labels).

Ink accent:
- `--accent` (ink) + `--accent-fg` (text on ink). Light: near-black / white.
  Dark: near-white / near-black. Used for: primary buttons, active nav pill,
  active filter/segment pill.
- `--accent-subtle` — a quiet neutral tint for secondary active fills.

Resource-type colours (strong + `-soft` tint pairs; role-named):
- `--type-slides` / `--type-slides-soft` (violet)
- `--type-notes` / `--type-notes-soft` (blue)
- `--type-past-question` / `--type-past-question-soft` (rose)
- `--type-lab-manual` / `--type-lab-manual-soft` (green)
- `--type-book` / `--type-book-soft` (amber)
- `--type-other` / `--type-other-soft` (neutral)

Topbar aliases: `--topbar-bg` (equals the canvas — the bar melts into it) and
`--topbar-fg`.

## Layout
- **Top bar:** sits ON the canvas (`--topbar-bg` = `--bg`, no heavy border).
  Its controls float as individual white rounded-full pills: the search field
  (white pill with icon), circular white icon buttons, and a white account
  chip. Theme toggle lives here.
- **Sidebar:** a floating white rounded-2xl panel inset from the canvas edge
  (margin, soft shadow) — not an edge-to-edge rail. Grouped, expandable nav
  (Levels → Semesters → Courses). The active level is a full **ink pill**;
  course sub-items are small rounded-full rows. Collapsible on desktop;
  off-canvas drawer with scrim on mobile.
- **Content:** cards and list sections on `--bg`, comfortable gaps
  (`gap-4`+), airy but organised. Mixed card sizes welcome.

## Aesthetic rules
- **Cards:** `--surface`, `rounded-2xl` (small) to `rounded-3xl` (feature),
  soft shadow (`0 1px 2px` up to `0 8px 24px` of `--shadow`), generous
  padding (`p-4`–`p-6`). Border optional and whisper-light.
- **Pills everywhere:** buttons, filters, badges, and toggles are
  rounded-full. Primary = ink pill. Secondary = white pill with hairline
  border. Selected filter = ink pill; unselected = white pill.
- **Type badges:** small rounded-full pill, `-soft` tint background with the
  strong type colour as text. This is the app's colour moment.
- **Typography:** large, confident, friendly headings (`text-2xl`+ bold);
  small muted labels (`text-xs`, sentence case or soft uppercase); tabular
  numbers for sizes/counts/dates. Course codes render in a small monospace
  chip on `--surface-2` — the signature detail, keep it.
- **No analytics content.** Ever.

## Component conventions
- **TopBar** — canvas-coloured bar; white pill search, circular icon buttons,
  account chip, theme toggle; role controls render conditionally.
- **Sidebar** — floating white panel; ink-pill active level; expandable
  semesters/courses; collapse control; mobile drawer.
- **CourseCard** — white rounded-2xl card: mono code chip, bold title, muted
  lecturer, an "N resources" neutral pill, quiet hover arrow.
- **ResourceRow** — white rounded-2xl compact row: coloured type badge
  (soft tint pill), title, muted year, tabular file size, trailing ink
  Download/Open pill.
- **StatCard** — small white card with a big number and a tiny label
  (library facts only).
- **FilterPills** — rounded-full; active = ink pill.
- **Button** — primary: ink pill (rounded-full). Secondary: white pill with
  `--border`. Disabled: 50% opacity.
- **Drawer / Modal** — `--surface`, `rounded-3xl` (top corners on the mobile
  sheet), focus-trapped, `Esc` closes, `aria`-labelled.
- **Toast** — floating white pill, soft shadow.
- **EmptyState** — centred, dashed hairline, one line of `--text-muted`.

## Theming
Light is default under `:root`; dark values under `[data-theme="dark"]`
(attribute set on `<html>` before hydration by the theme script; choice
persisted; `prefers-color-scheme` respected on first visit). Dark mode keeps
the same personality: deep charcoal canvas, slightly lighter cards, the ink
pill inverts to near-white, candy tints brighten slightly with translucent
soft variants.

## Accessibility checklist (every task)
- Semantic HTML; never a `div` for interactive elements.
- Visible keyboard focus via `--focus`; full keyboard operability;
  `aria-expanded` on expandable nav; labelled icon buttons.
- Text contrast holds in both themes — strong type colours on their soft
  tints must stay readable; ink pill text is always `--accent-fg`.
- ~44 px tap targets on mobile; drawers/modals trap focus, `Esc` closes,
  focus restored on close.

## Responsive
- Mobile-first: sidebar becomes a drawer, grids reflow to one column, no
  horizontal scroll. Enhance to floating sidebar + multi-column grids at
  `md`+.

## Data & state
- Mock data via the providers only; loading, empty, and error states always
  rendered; every mutation gives feedback (toast or inline).
- File size shown next to every download.

## Anti-patterns — never
❌ Hardcoded colours. ❌ Appearance-named tokens. ❌ Charts/KPIs/dashboard
content. ❌ Candy tints on large surfaces or as text on white. ❌ Heavy
borders for depth. ❌ Square corners on interactive pills. ❌ Breaking dark
mode. ❌ Building beyond the assigned task.

## Definition of done
- [ ] Tokens only; both theme value sets present for any new token.
- [ ] Works in light AND dark.
- [ ] Airy floating-card look; ink pill for active/primary; candy tints only
      on type badges/pills.
- [ ] Library content, not a dashboard.
- [ ] Mobile-first; accessibility checklist met.
- [ ] Loading/empty/error states handled.
- [ ] `npm run build` passes.
