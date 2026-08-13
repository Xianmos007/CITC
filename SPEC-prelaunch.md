# SPEC: Pre-launch changes (volunteer cards, church partners, admin New Partner)

Three changes. Work in the order below — each ships independently, so a problem
in #2 or #3 never blocks #1.

**Read before starting:** `src/pages/volunteer/`, `src/pages/PartnersPage.jsx`,
the Who We Are page, the admin panel's existing "New Opportunity" flow, the
Supabase client setup, and `src/styles/site.css`. Match existing patterns —
do not introduce new dependencies, new styling systems, or new state libraries.

**Brand rules (non-negotiable, from BRAND.md):**
- Sentence case for all headings and buttons. Never Title Case.
- Square edges. 2px border-radius maximum. No pill buttons, no rounded cards.
- One gold accent per section. Gold is `--citc-gold` #B8923E. Do not put gold
  on every card.
- No emoji. No new colors outside the existing CSS variables.
- Mono caps (`--mono`) for eyebrows/labels only, with wide tracking.
- Motion gentle or off; honor `prefers-reduced-motion`.

---

## Change 1 — Volunteer Now: rows to cards

**Current state:** Opportunities render as horizontal rows. A previous pass
added a low-count layout (≤4 items) and `date_label` rendering — preserve that
work; do not revert it.

**Goal:** Replace the row treatment with cards at all counts. One card
component used everywhere, so low-count and high-count states differ only in
grid columns, not in markup.

**Card contents (in this order):**
- `FEATURED` badge, only if the opportunity is featured (`is_featured`)
- Date + time + duration, mono meta style (e.g. `SAT JUN 14 · 11:00AM · 1 HOUR`)
- Title (serif, `.h3` scale)
- Partner name (mono caps, muted)
- Short description if one exists — clamp to 3 lines
- Capacity: the existing progress bar plus `N signed up / of M`
- `Sign up →` action

**Layout:**
- Desktop (≥1024px): 2 columns
- Tablet (640–1023px): 2 columns
- Mobile (<640px): 1 column, full width
- Equal-height cards within a row. Card body flexes so the capacity bar and
  sign-up action always sit flush at the bottom regardless of description
  length. This is the main thing that makes a card grid look finished.

**Styling:** 1px `--rule` border, `--bg-1` or `--bg-3` ground, `--space-4`
interior padding, 2px radius max. Hover: border darkens to `--citc-ink`,
`translateY(-2px)`, per existing card hover conventions in site.css. No shadow
beyond `--shadow-2` on hover.

**Preserve:** filter/search behavior, sort control, the sidebar-hidden-when-
low-count logic, and the empty state.

---

## Change 2 — Who We Are: partner churches section

### Decision rule — resolve this yourself, do not wait for input

Inspect the `partners` table schema in Supabase.

- **If a `kind` column exists** (it likely does): use it. Churches are rows
  where `kind = 'church'`; ministries are everything else. Update the existing
  Ministry Partners page to filter `kind != 'church'` (or `kind = 'ministry'`,
  whichever matches the existing data — check actual values before choosing)
  so churches don't leak onto that page.
- **If no `kind` column exists:** write a migration `00NN_partner_kind.sql`
  adding `kind text not null default 'ministry'`, backfill existing rows to
  `'ministry'`, and leave the file for Cristian to run. Do not attempt to run
  it. Make the frontend degrade gracefully if the column isn't there yet
  (treat missing `kind` as `'ministry'`).

State clearly in your summary which branch you took.

### The section

Place it after the existing Who We Are content, before the footer.

- Eyebrow: `— PARTNER CHURCHES` (mono caps)
- Heading, sentence case, one gold italic word — e.g. *"The churches who keep
  showing up."* Match the voice of the existing section headings on that page.
- One-sentence subhead in the established style.
- Grid of church cards:
  - Desktop: 3 columns · Tablet: 2 · Mobile: 1
  - Card shows: church name (serif `.h3`), location or neighborhood if
    available, and a short description if present. Keep cards compact and
    uniform in height — these are lighter than ministry partner cards.
  - If a logo/image field exists on the table, render it; if not, do not
    invent a placeholder box. Type-only cards are correct for this brand.
- **Empty state:** if zero churches exist, render the heading and subhead plus
  the CTA, and a single quiet line — "We're just getting started. Your church
  could be the first." Do not render an empty grid or skeleton cards.

### CTA

Below the grid: `Is your church interested? Join now`

- Style as the existing primary button (ink ground, gold on hover), matching
  the "Become a partner" button on the Ministry Partners page.
- **Destination:** reuse whatever the existing "Become a partner" CTA does. If
  that is a mailto, mirror it with a church-specific subject:
  `mailto:cristian.m@trinityfla.org?subject=Our church is interested in Church in the City`
  with a short prefilled body (church name, pastor, best contact, anything
  else). URL-encode properly. Do not build a form or a backend.

---

## Change 3 — Admin: New Partner

Add a "New partner" button and create flow under the admin panel's Partners
section, mirroring the existing "New Opportunity" flow as closely as possible —
same modal/panel pattern, same form field components, same save/error/toast
handling, same RLS-authenticated insert path.

**Fields:** every column an admin should set on `partners`. Inspect the table
and include what's there — at minimum name, kind, description, status,
`since_text`. Anything the Ministry Partners page or the new churches section
renders must be settable here.

- `kind` is a required selector: **Ministry** or **Church**. This is what
  routes the entry to the right page, so label it clearly — something like
  "Where should this appear?" with the two options.
- Validate required fields client-side before insert. Show inline errors in
  the existing style.
- After a successful save, the list refreshes and the new entry appears
  without a manual reload.
- Editing and deleting existing partners is **out of scope** unless that
  already exists for opportunities and comes nearly free by reusing the same
  components. Do not build it from scratch.

---

## Verification

1. `npm run build` passes. `npm run lint` shows no new errors — the
   pre-existing `vite.config.js` `process is not defined` error is known and
   expected; ignore it.
2. `npm run dev`, then check by hand:
   - Volunteer Now: cards at desktop, tablet, and mobile widths. Equal heights.
     Sign-up action aligned at card bottom across varying description lengths.
     Filters, search, sort, and the empty state all still work.
   - Who We Are: new section renders. With zero churches, the empty state and
     CTA show correctly — verify this case explicitly, since it is the state it
     will launch in. CTA opens the prefilled email.
   - Ministry Partners: still shows only ministries, unchanged otherwise.
   - Admin: "New partner" creates both a Ministry and a Church row; each
     appears on the correct page after save.
3. Check every changed page at 375px, 768px, and 1440px. No horizontal
   overflow at any width.

## Finishing up

- Commit with a clear message.
- **Do not push.** Cristian reviews locally and pushes himself — the site is
  live and a launch is imminent.
- Summarize: files changed, which schema branch you took for `kind`, anything
  you had to guess at, and anything you deliberately left undone.
