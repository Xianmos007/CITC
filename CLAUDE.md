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
- `npm run build` — Vite build + `scripts/prerender-blog.mjs` (writes
  `dist/blog/<slug>/index.html` with OG tags)
- `npm run lint`

## Layout
- `src/App.jsx` — routing + public frame. Admin renders at `/#admin`.
- `src/components/Chrome.jsx` — meta bar, nav, footer
- `src/pages/` — public pages; `volunteer/` has BrowseTab + OppModal
- `src/pages/AdminPage.jsx` — whole admin panel (opportunities, partners,
  gallery, signups)
- `src/lib/` — `supabase.js` (client), `content.js` (public reads + row
  mappers), `signups.js`, `admin.js` (admin CRUD), `galleryUpload.js`
- `src/hooks/useContent.js` — loads DB content once; falls back to
  `src/data/*.js` static content if the DB is unreachable
- `src/data/` — editable copy for each page (headings, nav, footer)
- `src/content/blog/*.md` + `src/data/blog.js` — blog is a **static markdown
  pipeline**, not Supabase. Migration "0008_blog.sql" was never run; ignore it.
- `supabase/migrations/` — only 0007+ are in the repo; earlier schema lives in
  `supabase/schema.sql` once Cristian exports it. Read it before writing SQL.

## How we work
- **Cristian runs all SQL** in the Supabase SQL editor and manages data in the
  dashboard. Write migrations as numbered files in `supabase/migrations/`,
  idempotent (`if not exists`, `drop policy if exists`), wrapped in
  `begin; … commit;`. Tell him clearly when one must be run, and in what order
  relative to deploying code.
- Code must keep working **before** a migration runs where reasonable (see the
  `image_url` handling in `content.js`/`admin.js` for the pattern).
- Edge functions: Cristian deploys with `supabase functions deploy <name>`.
  Say so when one changes.
- Git: work on a branch, commit in small logical steps, open a PR to `main`.
  Merging to `main` deploys to production — never push to `main` directly.
- Before finishing any task: `npm run build` and `npm run lint` pass, and the
  change is checked at 375px and 1280px widths.

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
