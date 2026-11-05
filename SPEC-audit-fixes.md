# SPEC: Audit fixes + easier partner/opportunity management

Six phases. Ship them in order; each phase is its own PR and must build and
deploy cleanly before the next starts. Phase 2 (database) is a single
migration that Cristian runs by hand — later phases depend on it.

**Read before starting:** `src/App.jsx`, `src/components/Chrome.jsx`,
`src/lib/*.js`, `src/hooks/useContent.js`, `src/pages/**`, `src/pages/AdminPage.jsx`,
`src/styles/*.css`, `scripts/prerender-blog.mjs`, `supabase/functions/send-signup-emails/index.ts`,
`supabase/schema.sql` (Cristian adds this before Phase 2 — see Phase 0), and
`SPEC-prelaunch.md` for the brand rules, which still apply:

- Sentence case for all headings, buttons, and nav labels. Never Title Case.
- Square edges, 2px radius max. One gold accent per section. No emoji. No new colors.
- Mono caps only for eyebrows/labels. Honor `prefers-reduced-motion`.
- No new dependencies except where this spec names one. No state libraries.

---

## Phase 0 — Cristian (manual, before Phase 2)

1. Supabase → Authentication → Sign In / Providers: confirm **"Allow new users to
   sign up" is OFF**. (Admin RLS is `to authenticated using (true)`; open signups
   would make anyone an admin.)
2. Export the current schema so the schema is in the repo:
   `supabase db dump --schema-only -f supabase/schema.sql` (or copy from the
   dashboard's SQL editor) and commit it. Migrations 0001–0006 are not in the repo.

---

## Phase 1 — Public fixes (no database changes)

### 1.1 Nav: remove the redundant volunteer link
`site.navLinks` has "Volunteer Now" and the nav also has a "Find a need" CTA
button — both go to the same page.
- Remove `volunteer` and `home` from `navLinks` (the logo already goes home).
- Nav labels become sentence case: `Who we are`, `Partners`, `Field notes`, `The Saturdays`.
- Keep the `Find a need →` CTA as the single volunteer entry point, desktop and mobile.
- Volunteer page eyebrow `04 · VOLUNTEER NOW` → `04 · FIND A NEED`.
- Active state: the CTA gets an active treatment when on the volunteer page
  (e.g. underline or inverted), since it's now the only nav item for that page.

### 1.2 Literal escape in signup form
`OppModal.jsx` privacy line renders `don’t` verbatim (JSX text doesn't
process escapes). Replace with `don’t`. Grep all `.jsx` for `\u20` inside JSX
text (not inside `{'...'}` strings) and fix every instance.

### 1.3 Empty modal sections
In `OppModal` idle state: hide "What to bring" when `bring` is empty; hide the
coordinator note block when `notes` is empty; hide empty spans in `.meta-row`.

### 1.4 Signup form submission
The submit button sits in `.modal-foot`, outside `<form>`, and calls
`handleSubmit` directly, bypassing `required`/`type=email` validation.
Give the form `id="signup-form"` and the button `form="signup-form"`, remove the
button's `onClick`. Validation errors then show inline natively.

### 1.5 Waitlist copy
Waitlist lede says "we'll text if a spot opens" but phone is optional. Change to
"we'll email you if a spot opens."

### 1.6 Dead buttons
Every one of these currently does nothing. Phase 6 replaces most with real
forms; for now make each one work:
| Button | Phase 1 behavior |
|---|---|
| Partners page "Become a partner", "Email the team" | `mailto:` (same address as `postNeedHref` in VolunteerPage) with a subject |
| Gallery "Submit a frame" | `mailto:` with subject "Photo for The Saturdays" |
| Blog "Subscribe" | hide the whole Saturday Letter band until Phase 6 |
| Modal "Add to calendar" | hide until Phase 4 |
| Footer: Sunday gatherings, Leadership, Pray for Titusville | remove |
| Footer: Become a partner, Contact | `mailto:` |
| Footer: Saturday letter | remove until Phase 6 |

Footer links: render as `<a href>` (real URL after Phase 3, `mailto:` where
noted) — never an `<a>` with only `onClick`.

### 1.7 Hide zero-count filters
Gallery categories and blog categories with 0 items: don't render the chip.
Blog count label: `1 piece` / `N pieces`.

### 1.8 Gallery
- `alt` = caption, falling back to `"<category label> · <date>"`; never the site name.
- Don't render the trailing `·` when `place` is empty.

### 1.9 Hero image
Replace `src/assets/church in the city home.JPG` (5.1 MB) with a 1600px-wide
WebP (~200 KB) plus a 900px variant via `srcset`. Delete the duplicate in
`src/assets/hero/`. Give the `<img>` real alt text describing the photo, and
`width`/`height` attributes to avoid layout shift. Add a `<link rel="preconnect">`
for fonts.googleapis.com and fonts.gstatic.com in `index.html`.

### 1.10 Desktop hero spacing
At 1280×720 the headline should be fully visible without scrolling. Reduce hero
top padding / vertical centering so the `h1` and CTAs sit above the fold.

### 1.11 Accessibility
- `OppModal` and the gallery lightbox: `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby` the title, move focus into the dialog on open, trap Tab
  inside, restore focus to the trigger on close.
- Opportunity cards/rows and partner cards are clickable `div`/`article`s:
  make the title a `<button>` (or wrap in one) so they're keyboard reachable.
- Footer link tap targets ≥ 40px tall on mobile.

---

## Phase 2 — Database migrations `0010_audit.sql` + `0011_close_volunteers.sql`

Split in two so nothing breaks mid-deploy:
- `0010_audit.sql` — sections 2.1–2.5. Additive only; run before the Phase 3 code ships.
- `0011_close_volunteers.sql` — section 2.6. Run after the Phase 3 code (signups via
  `submit_signup`) is live.

Claude writes them; Cristian runs them in the SQL editor. Reconcile with
`supabase/schema.sql`: use the **actual** existing policy names when dropping,
and skip `add column` for any column that already exists. Wrap in a transaction.

```sql
begin;

-- 2.1 Opportunities: structured time & place (labels become optional overrides)
alter table public.opportunities
  add column if not exists start_time  time,
  add column if not exists location    text,
  add column if not exists is_virtual  boolean not null default false,
  add column if not exists is_ongoing  boolean not null default false;

-- 2.2 Partners
alter table public.partners
  add column if not exists logo_url         text,
  add column if not exists website_url      text,
  add column if not exists default_location text,
  add column if not exists is_visible       boolean not null default true;

-- 2.3 Inbox: one table for every public form
create table if not exists public.inbox (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('need','partner','newsletter','photo','contact')),
  payload    jsonb not null default '{}'::jsonb,
  status     text not null default 'new' check (status in ('new','done','dismissed')),
  created_at timestamptz not null default now()
);
alter table public.inbox enable row level security;
create policy inbox_public_insert on public.inbox
  for insert to anon with check (status = 'new' and pg_column_size(payload) < 8000);
create policy inbox_admin_all on public.inbox
  for all to authenticated using (true) with check (true);

-- 2.4 All public signup counts in one call
create or replace function public.get_signup_counts()
returns table (opportunity_id uuid, confirmed int)
language sql stable security definer set search_path = public as $$
  select s.opportunity_id, count(*)::int
  from signups s join opportunities o on o.id = s.opportunity_id
  where o.is_published and s.status = 'confirmed'
  group by s.opportunity_id
$$;
grant execute on function public.get_signup_counts() to anon, authenticated;

-- 2.5 Signup through one server-side function. The server decides
--     confirmed vs waitlist, so the client can't misreport it.
create or replace function public.submit_signup(
  p_opportunity_id uuid, p_name text, p_email text, p_phone text, p_church text)
returns table (signup_id uuid, status text)
language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_total int; v_count int; v_status text; s_id uuid;
begin
  if coalesce(trim(p_name), '') = '' then raise exception 'Please enter your name.'; end if;
  if p_email is null or position('@' in p_email) = 0 then raise exception 'Please enter a valid email.'; end if;

  select total_spots into v_total from opportunities
   where id = p_opportunity_id and is_published;
  if not found then raise exception 'This opportunity is no longer available.'; end if;

  insert into volunteers (name, email, phone, church)
  values (trim(p_name), lower(trim(p_email)), nullif(trim(p_phone), ''), nullif(trim(p_church), ''))
  on conflict (email) do update set
    name = excluded.name,
    phone = coalesce(excluded.phone, volunteers.phone),
    church = coalesce(excluded.church, volunteers.church),
    last_seen_at = now()
  returning id into v_id;

  select count(*) into v_count from signups
   where opportunity_id = p_opportunity_id and signups.status = 'confirmed';
  v_status := case when v_count >= v_total then 'waitlist' else 'confirmed' end;

  insert into signups (opportunity_id, volunteer_id, status)
  values (p_opportunity_id, v_id, v_status)
  returning id into s_id;

  return query select s_id, v_status;
end $$;
grant execute on function public.submit_signup(uuid, text, text, text, text) to anon, authenticated;

-- 2.6 Close the volunteers table to the public.
--     Drop EVERY policy on public.volunteers that applies to anon/public
--     (select, insert, update), and the anon INSERT policy on public.signups.
--     Use the real names from schema.sql, e.g.:
-- drop policy if exists "<volunteers anon select>" on public.volunteers;
-- drop policy if exists "<volunteers anon insert>" on public.volunteers;
-- drop policy if exists "<volunteers anon update>" on public.volunteers;
-- drop policy if exists "<signups anon insert>"    on public.signups;
--     Keep the authenticated/admin policies.

commit;
```

Add a short **"How to verify"** block at the bottom of the migration file:
the curl below must return `[]` or a permission error after the migration.
```
curl 'https://xsdnopfsmrabhhqwlmyr.supabase.co/rest/v1/volunteers?select=email&limit=1' \
  -H "apikey: <publishable key>"
```

---

## Phase 3 — Real URLs + data correctness

### 3.1 Routes
Replace `page` state in `App.jsx` with routes:
`/` · `/who` · `/partners` · `/volunteer` · `/volunteer/:oppId` · `/gallery` · `/blog` · `/blog/:slug`.
- `/volunteer/:oppId` renders the volunteer page with the modal open. Opening
  a card navigates there; closing navigates back to `/volunteer`. This makes
  every need shareable by link.
- On the home page, opening an opportunity also navigates to `/volunteer/:oppId`.
- Unknown paths → a simple not-found section inside the public frame with a link home.
- Nav, footer and in-page CTAs use `<Link>`/`<NavLink>` (real `href`s). Delete `goPage`/`setPage` plumbing.
- Keep `#admin` exactly as it works today.
- Each page sets its own `<Helmet>` title/description/og tags (pattern already in `HomePage`).
- Extend `scripts/prerender-blog.mjs` (rename to `prerender.mjs`, update `package.json`)
  to also emit `who/`, `partners/`, `volunteer/`, `gallery/` `index.html` files with
  per-page `<title>` and OG tags, so shared links preview correctly.
- Scroll-to-top on route change only (not on modal open/close).

### 3.2 Public data layer (`content.js`, `useContent.js`)
- **Hide past needs:** public opportunities = `is_published` AND
  (`is_ongoing` OR `event_date is null` OR `event_date >= today in America/New_York`).
  Do the date filter in the query (`.or(...)`), computing today's local date client-side.
- **Sort:** dated needs ascending, then ongoing/undated.
- **Real counts:** call `get_signup_counts()` once alongside the other fetches and set
  `filled` per opportunity. Remove the `filled: 0` hardcode. `OppModal` keeps its
  per-opp refresh after signup.
- **Display labels:** add `formatWhen(opp)` in `src/lib/format.js`:
  - date: `date_label` if set (custom override, e.g. "Every Tuesday"), else
    `event_date` → `SAT · NOV 14`; `is_ongoing` with no label → `Ongoing`.
  - time: `time_label` if set, else `start_time` → `8:00 AM`.
  - place: `Online` if `is_virtual`, else `location` || partner `default_location` || `Titusville, FL`.
  Use it in BrowseTab, the home preview, and OppModal (modal currently hardcodes "Titusville, FL").
- **Partners:** filter `is_visible = true` publicly. Map `website_url`, `logo_url`.

### 3.3 Signups via RPC (`signups.js`, `OppModal.jsx`)
- `submitSignup` calls `supabase.rpc('submit_signup', …)`, gets `{signup_id, status}`,
  then triggers the email function with `signup_id` as today.
- Delete `findVolunteerByEmail` and `upsertVolunteer`. The returning-volunteer
  auto-fill is replaced by **this-device memory**: after a successful signup, save
  `{name, email, phone, church}` to `localStorage` key `citc:volunteer` (try/catch);
  prefill the form from it next time, with a small "Not you? Clear" link.
- Map Postgres `23505` → "You're already signed up for this one. Check your email."
  Map raised exceptions' message through to the error banner.
- Done-state copy uses the returned status (waitlist vs confirmed).

### 3.4 Email function
`send-signup-emails`: subject is "You're on the waitlist for …" when
`status = 'waitlist'`, otherwise the current subject. Include location/virtual
and a Google Calendar link (see 4.6) in the confirmation.

### 3.5 Home page
- "This week's open hands": next 3 dated needs within 14 days; if none, the next
  3 upcoming; if none, ongoing ones; else the existing empty state. Delete
  `homeOppPreviewIds`. Show the real filled count.
- Featured partners: first 3 visible `kind='ministry'` partners with status
  `Active`, by `display_order`, from the DB (delete the hardcoded cards in `home.js`).
- Hero stats from data: active ministry partners count; congregations = count of
  visible `kind='church'` partners. Hide a stat whose value is 0.
- Empty-state "Want a nudge…?" — link it to the newsletter form (Phase 6) or remove the question.

---

## Phase 4 — Admin: opportunities that take one minute to post

Split `AdminPage.jsx` (1,400 lines) into `src/pages/admin/` — one file per view
plus `components/` for shared editor pieces. No behavior change from the split itself.

Use one admin-only Supabase client in `src/lib/supabaseAdmin.js` with
`persistSession: true, autoRefreshToken: true, storageKey: 'citc-admin'`, and use
it everywhere in `admin.js`. (Today the shared public client has
`persistSession: false`, so admins are logged out on every refresh.)

### 4.1 Opportunities list
- Segmented filter: **Upcoming · Ongoing · Past · Drafts** (default Upcoming),
  using the same visibility rule as Phase 3.2.
- Columns: When (formatted) · Title · Partner · **Signups `n / total`** (from
  `get_signup_counts` or an admin count query) · Status.
- Row actions: **Edit · Duplicate · Roster · Copy link · Unpublish**.
- Past rows render muted; no "Unpublish" needed for past rows.

### 4.2 Editor layout (replace OppEditor)
Wider drawer (min(1100px, 100vw)), two columns on desktop: form left, **live
preview** right. Preview renders the real public card component and the modal
body using the current form values — extract the card from `BrowseTab` into
`src/components/OppCard.jsx` so both use one component. Stacked on mobile with
the preview collapsible.

Form, in this order, grouped under small mono headings:
1. **Who** — Partner (select; first field). Title.
2. **When** — Date (date picker) · Start time (time input) · Duration (select:
   1 hour, 2 hours, 3 hours, 4 hours, Half day, Full day, Custom… → text) ·
   "Ongoing / no fixed date" checkbox (hides date, shows optional "Custom date text"
   e.g. "Every Tuesday"). Custom date/time text otherwise lives under a
   "Customize how the date reads" disclosure.
3. **Where** — "Online" checkbox; else Location text (placeholder = partner's `default_location`).
4. **What** — Description · What to bring (chip input: Enter adds a chip, ×
   removes) · Coordinator note · Photo (existing dropzone).
5. **Settings** — Total spots · Kind of work (combobox: existing kinds from
   all opportunities + type a new one) · Tags (chip input with autocomplete
   from existing tags, so filters don't fragment on typos) · Featured · Published.

Validation inline: title, partner, and either a date or "Ongoing" required.
Save writes `event_date`, `start_time`, `duration_label`, `location`, `is_virtual`,
`is_ongoing`; write `date_label`/`time_label` only if the custom overrides are used
(else null).

### 4.3 Partner defaults
When a partner is chosen on a **new** opportunity, prefill empty fields from that
partner's most recent opportunity: location, what to bring, kind, coordinator
note, total spots. Show a dismissible hint "Filled in from <partner>'s last need."

### 4.4 Duplicate + repeat
- **Duplicate** opens the editor as a new opportunity with every field copied
  (including `is_published`) except `event_date`, which is cleared and focused.
- On create, a "Repeat" control: `Don't repeat | Weekly | Every 2 weeks | Monthly
  (same weekday)` × `for N more` (1–12). Creates N additional rows with shifted
  `event_date`. Confirm with a summary line: "Creates 4 needs: Nov 14, 21, 28, Dec 5."

### 4.5 Roster
"Roster" opens a drawer for one opportunity: confirmed list, then waitlist
(name, email, phone, church, signed-up date). Actions: **Copy all emails**
(comma-separated, to clipboard), **Download CSV**, and per-row **Move to confirmed** /
**Move to waitlist** (update `signups.status`).

### 4.6 Share helpers
- "Copy link" copies `https://thechurchinthecity.org/volunteer/<id>`.
- In the roster drawer and editor, a "Copy text message" button copies:
  `Serve with us — <title> with <partner>, <SAT · NOV 14> at <8:00 AM>. <spots left> spots left: <link>`
- Public modal "Add to calendar" (re-enable): a Google Calendar template link
  plus a downloadable `.ics` built client-side from `event_date` + `start_time` +
  duration (default 2h when unparseable). Hide the button for ongoing/undated needs.

---

## Phase 5 — Admin: partners

### 5.1 List
- Columns: Logo thumb · Name · Kind (ministry/church) · Status · **Upcoming needs count** · Visible.
- Reorder with ↑/↓ buttons (swap `display_order` with the neighbor; renumber
  0..n on save) instead of a raw "Display order" number field. Remove that field from the editor.
- Row actions: **Edit · Add need** (opens the opportunity editor with this
  partner preselected) **· Hide/Show** (toggles `is_visible`).

### 5.2 Editor
Grouped like the opportunity editor, with the same live-preview pattern using
the public partner card:
1. **Basics** — Name · Kind · Status · Logo (dropzone, reuse `uploadGalleryImage`) · Website.
2. **On the site** — Short description (`type`, placeholder "Food pantry · Titusville") ·
   Mission (textarea) · "Partner since" (year number input; save as
   `since_text = "Partner since <year>"`; if existing `since_text` doesn't match that
   pattern, show it in a "Custom text" field instead) · Volunteers label (optional).
3. **Logistics** — Default location (used by 4.3 and 3.2) · Contact name · Contact email · Auto-notify.
4. **Visible on site** toggle.
Required: name, kind, status. Drop the current requirement on partnership label and mission.

### 5.3 Public partner page
Show logo when present; show website as a link; show `type` under the name
(today the card shows "PARTNER" for every partner).

---

## Phase 6 — Inbox: partners do the typing, the admin approves

All public forms write to `inbox` (anon insert only). Every form has a honeypot
field (visually hidden `website` input; if filled, pretend success and don't
insert) and requires ≥ 3 seconds between render and submit. Insert with a
client-generated UUID and **no `.select()`** (same RLS pattern as signups today).
After insert, call a new edge function `notify-inbox` with `{ id }`; it reads the
row with the service role and emails `ADMIN_EMAIL` via Resend (reuse helpers from
`send-signup-emails`; same CORS and header handling).

### 6.1 Public forms
| Where | Replaces | `kind` | Fields |
|---|---|---|---|
| Volunteer page "Post a need" tab | `mailto:` | `need` | Ministry (select of visible partners + "Other" → text) · Your name · Email · Phone (opt) · What's the need · Date (or "Ongoing") · Start time · Volunteers needed · Details |
| Partners page "Become a partner" | button / mailto | `partner` | Ministry name · Website (opt) · Your name · Email · Phone (opt) · What you do (textarea) · How volunteers could help |
| Blog "Saturday letter" band (unhide) | dead button | `newsletter` | Email |
| Gallery "Submit a frame" | mailto | `photo` | Name · Email · Caption · Where/when · Photo upload (to the gallery bucket under `submissions/`; reuse compression from `galleryUpload.js`) |
| Footer "Contact" | mailto | `contact` | Name · Email · Message |

Use one shared `InboxForm` component configured by a field list. Success state
replaces the form with a short sentence-case confirmation.

Storage note for photo uploads: anon upload must be limited to the
`submissions/` prefix — add the storage policy in a second migration
`0013_inbox_uploads.sql` (anon `insert` on `storage.objects` where
`bucket_id = '<gallery bucket>' and name like 'submissions/%'`).

### 6.2 Admin "Inbox" tab (first tab, with a count badge of `new` items)
- List grouped by kind, newest first. Filter: New · Done · Dismissed.
- **need** → "Convert to opportunity": opens the Phase 4 editor prefilled from the
  payload, **unpublished**, partner matched by name (case-insensitive) or left
  blank with the submitted name shown above the field. On save, mark the inbox
  item `done`.
- **partner** → "Convert to partner": opens the Phase 5 editor prefilled, status
  `In conversation`, `is_visible = false`. On save, mark `done`.
- **photo** → "Add to gallery": opens the existing gallery editor with the image
  URL and caption prefilled. On save, mark `done`.
- **newsletter** → "Copy all new emails" + "Download CSV"; "Mark exported" sets them `done`.
- **contact** → shows message; "Reply" is a `mailto:` link; mark done/dismiss.

---

## Out of scope
Partner logins / self-serve editing, SMS, payments, i18n (a Spanish version is a
good later project — not now).

## Definition of done (every phase)
`npm run build` and `npm run lint` pass; no console errors on any route; checked at
375px and 1280px; brand rules above hold; each PR description lists anything
Cristian must run or configure.
