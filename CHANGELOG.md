# CITC change log

Everything changed on the site, the database, and the services around it —
including manual changes that don't show up in git. Newest first.
Claude Code: add an entry at the end of every phase or manual change.

---

## 2026-11-10 — Security hardening (branch `security/hardening`)

From a security review of the site, database, and hosting.

### Database (applied to Supabase)
- **Migration 0014** (`0014_tighten_gallery_and_functions.sql`): gallery
  tables and the `gallery` storage folder now require `is_admin()` to
  write (were open to any signed-in user); the folder accepts only JPEG /
  PNG / WebP up to 10 MB; `search_path` pinned on `is_admin`,
  `get_opportunity_signup_count`, `lookup_my_signups`, `touch_updated_at`.
  Verified: a non-admin signed-in user changes 0 gallery rows; admin and
  public reads unchanged. Supabase advisors: search-path warnings cleared.

### Code (GitHub)
- `npm audit fix`: react-router-dom 7.18.5, vite 8.3.7 (and dev tools).
  Packages the site ships: 0 known vulnerabilities. Remaining: 4 moderate
  in eslint's `minimatch` (lint tool only, needs a breaking upgrade).
- CLAUDE.md: standing rule to run `npm audit` and the Supabase security
  advisors with every update, and the permission rules to keep.

### Manual (Cristian, dashboards)
- GitHub → Settings → Pages → **Enforce HTTPS** (http:// was not
  redirecting).
- Supabase → Authentication → **Leaked password protection** on.
- Kept: second admin email `cristianmoscoso7@gmail.com` (Cristian's backup;
  no account yet; safe while public signups stay disabled).

## 2026-11-10 — Photos on inner pages (branch `design/inner-pages`)

### Code (GitHub)
- Who we are, Partners and Find a need headers now show a collage of three
  overlapping, slowly drifting Saturdays photos (`PhotoCollage`).
- Who we are gets a wide photo band between Mission and Origin (the former
  homepage hero photo of the boy with a rake).
- Sections on Who we are and Partners fade in as they scroll into view
  (shared `src/hooks/useReveal.js`, also used by the homepage).
- Three more gallery photos bundled in `src/assets/saturdays/`; which photo
  goes on which page is set in `src/data/pagePhotos.js`.

## 2026-11-10 — Fix: Partners page "How we serve together" list

### Code (GitHub)
- The redesign's hero tags used the class `.need`, which the Partners page
  already used for each "How we serve together" item, so those items were
  absolutely positioned and stacked on top of each other on the live site.
  Hero tags are now `.scene-tag`.
- Partners page shows one partner per row (the two-up layout squeezed
  each card's two columns).

## 2026-11-10 — Visual redesign (branch `redesign/calm-refresh`)

### Code (GitHub)
- **Visual redesign, no behaviour changes.** New look across all public
  pages: warm paper / ink / one gold accent, Fraunces + Figtree (the
  monospace label font is retired), rounded cards, pill buttons, floating
  pill nav, light footer. The dark top info bar and the scrolling word
  ticker are removed.
- **Homepage hero** is an animated illustration of Titusville at sunrise
  (`src/components/HeroScene.jsx`): Indian River, the Max Brewer Bridge,
  the beach, 1960s ranch homes, mid-century churches, and a shuttle on the
  pad across the river. Upcoming needs appear as small tags rising from
  buildings one at a time (display only). Motion stops for visitors who
  ask for reduced motion.
- **Homepage photos**: six Saturdays gallery photos bundled in
  `src/assets/saturdays/` (`src/data/homePhotos.js`) for a new "Real
  Saturdays" strip and behind the "From an event to a culture" panel, so
  edits to the gallery can't leave holes on the homepage. The previous
  hero photo (`hero-1600/900.webp`) is no longer shown.
- Merged with everything on `main` through Nov 9 (routing, accessibility
  pass, shared OppCard, admin split): all of main's markup, links, heading
  levels and logic are kept; only styles and layout changed. Main's colour
  tokens `--accent-text`, `--accent-display`, `--ok-text` are kept.

## 2026-11-09

### Database
- **Food Pantry Donation Sorting** (Nov 16) marked full. First done by
  lowering spots 4 → 2; switched the same day to the placeholder method:
  spots back to 4, plus 2 placeholder signups for volunteers who signed up
  outside the site. Shows 4 of 4.
- Created 10 reusable placeholder volunteers, "Filled elsewhere 1"–"10"
  (`filled-elsewhere-N@placeholder.invalid`, church "Placeholder").

## 2026-11-05 (evening)

### Database
- Added partner **Royal Oak Ministries** (ministry, Active, "Partner since
  2026", visible), from royaloakministries.org: single mothers & families,
  705 Harrison Street, Titusville; contact Brienne Robertson,
  RoyalOakMinistries@gmail.com.
  No logo yet.

## 2026-11-05 (evening) — Phase 4 and lookup_my_signups

### Code (GitHub)
- **PR #3 — Close `lookup_my_signups`** (merged). Adds
  `supabase/migrations/0012_close_lookup_my_signups.sql`; the spec's Phase 6
  storage migration is renumbered to `0013_inbox_uploads.sql`.
- **PR #4 — Audit Phase 4: admin opportunities** (merged, **not yet live** —
  see Deploy below). Admin panel split into `src/pages/admin/` and loaded
  only at `#admin`; admins stay signed in across refreshes. Opportunities
  list with Upcoming / Ongoing / Past / Drafts, real signup counts, and Edit,
  Duplicate, Roster, Copy link, Unpublish. Two-column editor with a live
  preview of the public card and popup; date picker, start time, duration
  presets, Ongoing, Online/location, what-to-bring and tag chips, partner
  defaults, Repeat (weekly / every 2 weeks / monthly). Roster with copy
  emails, CSV, move between confirmed and waitlist, copy text message.
  Public popup: Add to calendar (Google + .ics) is back.
- Checked before merging: build and lint clean; admin and public flows in a
  browser at 375px and 1280px against test data; the public pages against
  the live database (read-only, no signups); the combined code with PR #5.

### Database (Supabase connector)
- Applied `0012_close_lookup_my_signups` with `apply_migration`. Verified:
  `anon` and `authenticated` can no longer run `lookup_my_signups`;
  `submit_signup` and `get_signup_counts` still work for the public.
- Read back the three NBC needs added earlier: each has a start time and no
  text overrides, so they show the automatic date and calendar times.

### Deploy (GitHub Pages)
- The deploy for PR #4 (`886d4a9`) built fine but timed out on GitHub's side,
  and GitHub Pages still holds it as "in progress". Every later deploy
  (including PR #5, `ae7efbb`) is rejected with "due to in progress
  deployment". The live site is still on the PR #3 build. Retried 3 times;
  the proxy in Claude's session blocks the Pages API needed to cancel it.

### Settings & services
- New personal cloud environment **citc** for this repository, allowing
  `thechurchinthecity.org` and the Supabase API host, so sessions can
  smoke-test the live site.

### Still to do
- [ ] Unstick the GitHub Pages deploy, then smoke-test Phase 4 live
- [ ] Phase 5 — admin partners
- [ ] Phase 6 — inbox and public forms

---

## 2026-11-05

### Code (GitHub)
- **PR #5 — Accessibility fixes from ai-design-check** (merged). Ran the
  open-source ai-design-check scanner (enmerasoftware, MIT) on the live site
  and the repo, then fixed: low-contrast text (muted text now 0.68 ink;
  gold text uses a darker gold step `--citc-gold-650` for small text and
  `--citc-gold-600` for headline accent words; darker sage for small
  "full" labels; brighter muted text on dark grounds), minimum text size
  raised to 12 px, keyboard focus rings restored on inputs, cards and
  dialogs, form fields at 16 px so iPhones don't zoom, heading order
  (cards h3, footer and filter headings h2, partner names h2). Added
  `ai-design-check.json` (proper nouns). Live scan: 0 contrast, size or
  heading-order findings; code check: 0 errors. Deployed after
  re-running a Pages deploy that GitHub had stuck behind PR #4's.
- **PR #7 — Volunteer list heading** (merged). "Open this week & next"
  is now an h2 (the live scan caught h1 → h3 when the filter sidebar is
  hidden).

### Code (GitHub)
- **PR #1 — Audit Phase 1** (merged). Nav cleanup (removed duplicate
  "Volunteer Now"; "Find a need" is the single entry point; sentence-case
  labels), fixed literal `don’t`, hid empty modal sections, signup form
  validation, waitlist copy, dead buttons → mailto or hidden, hid zero-count
  filters, gallery alt text, hero image 5.1 MB → WebP (314 KB / 153 KB),
  hero spacing, modal accessibility, fixed pre-existing lint error.
- **PR #2 — Audit Phases 2–3** (merged). Real URLs for every page
  (`/who`, `/partners`, `/volunteer`, `/volunteer/:id`, `/gallery`, `/blog`),
  per-page share previews, past needs auto-hide, real signup counts, signups
  through `submit_signup` (server decides confirmed/waitlist), on-device
  form memory replaces email auto-fill, home page partners/stats from the
  database, waitlist email subject + Google Calendar link in confirmations,
  fixed home "open hands" layout and blank blog tab titles.

### Database (Supabase SQL editor)
- Ran `0010_audit.sql` — new opportunity fields (start_time, location,
  is_virtual, is_ongoing), partner fields (logo_url, website_url,
  default_location, is_visible), `inbox` table, `get_signup_counts()`,
  `submit_signup()`.
- Ran `0011_close_volunteers.sql` — volunteers table closed to the public.
  Verified with curl: returns `[]`.
- Set **Volunteer Training** `is_ongoing = true` (it was hidden as a past need).
- Added 3 North Brevard Charities needs by SQL:
  Boy Scout Food Drive (Sat Nov 14, 8 AM, The Grove Church, 10 spots),
  Titusville Turkey Giveaway (Sat Nov 14, 8 AM–5 PM, Isaac Campbell Park,
  17 spots), Food Pantry Donation Sorting (Mon Nov 16, 10 AM, United for
  Brevard Food Pantry, 4 spots). *(Confirm the SQL returned 3 rows.)*

### Settings & services (manual)
- Supabase → Authentication: **"Allow new users to sign up" turned OFF.**
  Only admin account: cristian.m@trinityfla.org.
- Supabase → Edge Functions: `send-signup-emails` redeployed from the
  dashboard with the PR #2 code.
- `supabase/schema.sql` committed (summary of tables, constraints,
  policies, functions).
- `CLAUDE.md` and `SPEC-audit-fixes.md` added to the repo.
- **Resend:** domain `thechurchinthecity.org` was **Failed** — confirmation
  emails were not sending (likely since launch). Added DNS records in
  Namecheap → Advanced DNS:
  - TXT `resend._domainkey` (DKIM)
  - TXT `send` → `v=spf1 include:amazonses.com ~all`
  - TXT `_dmarc` → `v=DMARC1; p=none;`
  - Mail Settings → Custom MX; MX `send` → `feedback-smtp.us-east-1.amazonses.com`, priority 10
  - GitHub Pages A/CNAME records left unchanged.
  Clicked Restart in Resend. Domain verified; confirmation email tested and
  received the same day.

### Still to do
- [x] Resend verified + confirmation email tested
- [x] Phase 4 — admin opportunities (also close `lookup_my_signups`) — see the evening entry

---

## Before 2026-11-05 — the original build (May–Aug 2026)

Reconstructed from the git history and earlier project notes. Database steps
from this period (migrations 0001–0006, Supabase setup, Resend setup) weren't
logged at the time; `supabase/schema.sql` shows the resulting state.

### August 2026
- **Aug 13** — Optional photo on opportunities, shown only when a need is
  opened (migration `0009_opportunity_image.sql`). Added build specs
  (`SPEC-prelaunch.md`, `SPEC-opportunity-image.md`).
- **Aug 12** — Mobile navigation menu; responsive fixes; site no longer
  crashes if Supabase keys are missing (falls back to built-in content).

### July 2026
- **Jul 31** — Pre-launch changes: volunteer needs shown as cards, partner
  churches section (partner `kind`: ministry / church, migration
  `0008_partner_kind.sql`), "New partner" form in the admin panel.

### June 2026
- **Jun 11** — Visual pass: removed mockup/placeholder content, fixed
  partner cards, improved volunteer layout.
- **Jun 8** — Home page partner cards updated to the real partners (North
  Brevard Charities, Better Together, Hope for North Brevard). Blog: real
  post featured, placeholder posts removed, cover image and layout fixes.
- **Jun 5** — First blog post published: "Let justice roll down."

### May 2026
- **May 28** — Blog rebuilt as a static markdown pipeline (markdown files in
  `src/content/blog`, cover images, share previews prerendered at build).
  Default share image added. Note: a Supabase-backed blog migration was
  drafted but never run.
- **May 27** — Per-page share/SEO tags (react-helmet-async); blog routing
  with React Router and the GitHub Pages deep-link fallback (`404.html`).
- **May 26** — Gallery: managed categories (migration
  `0007_gallery_categories.sql`) and batch photo upload with drag-and-drop
  and compression.
- **May 22–23** — Live volunteer signups: signup form, confirmation emails
  through the `send-signup-emails` edge function (Resend), live spot counts.
  Fixed: signup insert failing under RLS (client-generated id, no read-back);
  edge function 401 with new-format Supabase keys (explicit `apikey` /
  `Authorization` headers). Admin account created (cristian.m@trinityfla.org).
  Who We Are copy written.
- **May 21** — Site launched from the Claude Design handoff: React + Vite,
  GitHub Pages deploy, Supabase connected (Stage 2 env vars), custom domain
  `thechurchinthecity.org` (Namecheap DNS → GitHub Pages), admin panel at
  `/#admin`, flame logo, home / who / partners / volunteer / gallery pages.
