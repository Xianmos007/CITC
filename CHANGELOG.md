# CITC change log

Everything changed on the site, the database, and the services around it —
including manual changes that don't show up in git. Newest first.
Claude Code: add an entry at the end of every phase or manual change.

---

## 2026-11-05 (later)

### Code (GitHub)
- **PR #3 — Close `lookup_my_signups`** (open). Migration
  `0012_close_lookup_my_signups.sql` revokes public access to the function
  that returned anyone's signups by email. The spec's Phase 6 storage
  migration is renumbered to `0013_inbox_uploads.sql`.
- **PR #4 — Audit Phase 4: admin opportunities** (open). Admin panel split
  into `src/pages/admin/` and loaded only at `#admin`; admins stay signed in
  across refreshes (own Supabase client). Opportunities list with Upcoming /
  Ongoing / Past / Drafts and real signup counts; actions Edit, Duplicate,
  Roster, Copy link, Unpublish. New two-column editor with a live preview of
  the public card and popup: date picker, start time, duration presets,
  Ongoing, Online/location, what-to-bring and tag chips, partner defaults
  from their last need, Repeat (weekly / every 2 weeks / monthly). Roster:
  confirmed + waitlist, copy emails, CSV, move between lists, copy a text
  message. Public popup: Add to calendar (Google + .ics) is back.

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
  Clicked Restart in Resend. **Pending:** confirm domain shows Verified, then
  delete the test signup and re-test the confirmation email.

### Still to do
- [ ] Resend verified + confirmation email tested
- [ ] Merge PR #3 and run `0012_close_lookup_my_signups.sql`
- [ ] Phase 4 — admin opportunities (PR #4 open)
- [ ] Phase 5 — admin partners
- [ ] Phase 6 — inbox and public forms

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
