# Church in the City (CITC) — thechurchinthecity.org

A network site for local churches in Titusville / North Brevard, FL. Ministries
post volunteer needs; people from partner churches sign up. Owner: Pastor
Cristian Moscoso (Trinity Church). He is not a full-time developer — explain
anything he must do himself in plain steps; don't narrate work already done.

## Stack
- React 19 + Vite 8, React Router 7, react-helmet-async (per-page OG tags)
- Supabase (project `xsdnopfsmrabhhqwlmyr`): Postgres + RLS, Storage (gallery
  images), Auth (admin only), Edge Function `send-signup-emails` (Resend)
- Hosted on GitHub Pages via `.github/workflows/deploy.yml` on every push to
  `main`. Custom domain is configured in the repo's Pages settings.
  `public/404.html` + the script in `index.html` handle SPA deep links.
- Env (baked at build): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  (publishable key). Local: `.env.local`.

## Commands
- `npm run dev` — local dev
- `npm run build` — Vite build + `scripts/prerender.mjs` (writes
  `dist/<page>/index.html` and `dist/blog/<slug>/index.html` with per-page
  title + OG tags from `src/data/pageMeta.js` and the blog data)
- `npm run lint`

## Layout
- `src/App.jsx` — routing + public frame. Admin renders at `/#admin`.
- `src/components/Chrome.jsx` — meta bar, nav, footer
- `src/pages/` — public pages; `volunteer/` has BrowseTab + OppModal
- `src/pages/admin/` — admin panel, lazy-loaded at `#admin`: `AdminPage.jsx`
  (auth gate + tabs), one file per view (`OpportunitiesView`, `OppEditor`,
  `RosterDrawer`, `PartnersView`, `GalleryView`, `SignupsView`), shared
  pieces in `components/` (`Drawer`, `ChipInput`, `PhotoDropzone`)
- `src/components/OppCard.jsx` — the public opportunity card, also used by the
  admin editor's live preview (as are `OppModalHead`/`OppDetailsBody`)
- `src/lib/` — `supabase.js` (public client, no session), `supabaseAdmin.js`
  (admin client, persisted session), `content.js` (public reads + row
  mappers), `format.js` (`formatWhen`), `share.js` (links, text message,
  calendar), `signups.js`, `admin.js` (admin CRUD), `galleryUpload.js`
- `src/hooks/useContent.js` — loads DB content once; falls back to
  `src/data/*.js` static content if the DB is unreachable
- `src/data/` — editable copy for each page (headings, nav, footer)
- `src/content/blog/*.md` + `src/data/blog.js` — blog is a **static markdown
  pipeline**, not Supabase. Migration "0008_blog.sql" was never run; ignore it.
- `supabase/migrations/` — only 0007+ are in the repo; earlier schema lives in
  `supabase/schema.sql` once Cristian exports it. Read it before writing SQL.

## How we work
Cristian wants Claude to carry work end to end, not hand him steps. Do the
work yourself; only stop for him where marked **ask first**.

- **Database:** use the Supabase connector (project `xsdnopfsmrabhhqwlmyr`).
  Still write each migration as a numbered, idempotent file in
  `supabase/migrations/` (`if not exists`, `drop policy if exists`,
  `begin; … commit;`), commit it, then apply it yourself with
  `apply_migration`. Get the order right relative to merging code (additive
  changes before the deploy that needs them; closing/dropping after).
- **Data:** add or edit opportunities, partners, gallery rows yourself with
  `execute_sql` when Cristian gives you the details. Read back what you wrote.
- **Spots filled outside the site:** when Cristian says a need is full or
  that N people signed up elsewhere, don't lower `total_spots`. Add confirmed
  signups from the placeholder volunteers "Filled elsewhere 1"–"10"
  (`filled-elsewhere-N@placeholder.invalid`; add more numbers if ever
  needed). Insert them with SQL so no email is sent. Anything that emails or
  exports a roster must skip `@placeholder.invalid` addresses.
- **Edge functions:** deploy changed functions yourself with
  `deploy_edge_function`, then check `query_logs` for errors after a test.
- **Git:** work on a branch, commit in small steps, open a PR. When
  `npm run build` and `npm run lint` pass and the change is checked at 375px
  and 1280px, merge the PR yourself, wait for the GitHub Pages deploy, and
  smoke-test the live site.
- **Ask first** before: deleting rows or files, dropping tables/columns,
  removing or loosening RLS policies, touching auth settings or secrets,
  anything that emails real volunteers, or anything you can't undo.
- **CHANGELOG.md:** at the end of every phase or change, add a dated entry
  covering code, database, and any manual/service changes.
- Code must keep working **before** a migration runs where reasonable (see the
  `image_url` handling in `content.js`/`admin.js` for the pattern).
- If the Supabase connector isn't available in a session, say so and fall
  back to giving Cristian the SQL to paste.
- Things only Cristian can do (DNS at Namecheap, Resend dashboard, GitHub and
  Supabase account settings): tell him in plain, numbered steps.

## Known gotchas (already solved — don't regress)
- **RLS + RETURNING:** anon can insert into `signups` but not select, so
  inserts use a client-generated UUID and **no `.select()`**.
- **Edge function 401 with new-format keys:** pass `apikey` and
  `Authorization: Bearer <publishable key>` headers explicitly on
  `functions.invoke`.
- `vite.config.js` `base` comes from `BASE_PATH` (set to `/` for the custom domain).
- JSX text doesn't process `’`-style escapes — use the real character.

## Brand rules (non-negotiable)
- Fonts: Cormorant Garamond (`--serif`, headlines), Inter (`--sans`, body),
  JetBrains Mono (`--mono`, eyebrows/labels only, caps, wide tracking).
- Palette via tokens in `src/styles/tokens.css` only: paper `#FBF7EE`
  background, ink `#14120F`, gold `#B8923E` accent, sage = confirmed,
  clay = urgent. No new colors.
- Sentence case for headings, buttons, nav. Never Title Case.
- Square edges, 2px radius max. No pills, no rounded cards.
- One gold accent per section. No emoji. Motion gentle; honor
  `prefers-reduced-motion`.
- Voice: quiet, specific, local ("Saturdays", "Titusville"), never salesy.
- No new dependencies unless the spec names one or Cristian agrees.

## Current work
`SPEC-audit-fixes.md` — six phases (public fixes → DB migration → real URLs →
admin opportunities → admin partners → inbox/public forms). Do one phase per
PR, in order. Phase 0 and running the Phase 2 migration are Cristian's.
`SPEC-prelaunch.md` and `SPEC-opportunity-image.md` are earlier, completed specs.

## Confirmed partners
North Brevard Charities, Better Together, Hope for North Brevard.
