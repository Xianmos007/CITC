# SPEC: Optional opportunity image

Add an optional image to volunteer opportunities. It appears **only in the
expanded/detail view** of an opportunity card — never on the collapsed card in
the grid. Most opportunities will not have one, so the no-image case is the
default and must look intentional, not broken.

**Read first:** the volunteer card + expanded view components, the admin
"New Opportunity" form, and however blog cover images or gallery photos are
uploaded and stored. Reuse those patterns — the gallery Supabase bucket already
handles image upload; do not introduce a new bucket, service, or dependency.

**Brand rules (non-negotiable):** square edges (2px radius max), sentence case,
no emoji, no new colors outside the existing CSS variables, motion gentle or
off, documentary photography only — never add stock or placeholder imagery.

---

## 1. Schema

Inspect the `opportunities` table first.

- **If an image column already exists** (`image_url`, `photo_url`, or similar):
  use it. Do not add another. Say which one you found.
- **If not:** write a migration `00NN_opportunity_image.sql` (next number in
  sequence) adding `image_url text` — **nullable, no default**. Leave the file
  for Cristian to run in the Supabase SQL editor; do not attempt to run it.
  Follow the style of the existing migrations (wrapped in begin/commit,
  `add column if not exists`).

The frontend must degrade gracefully if the column doesn't exist yet — treat a
missing column exactly like a null value. Nothing should error or blank out.

## 2. Admin — New Opportunity form

Add an image field to the existing create flow, mirroring however blog covers
or gallery photos are uploaded.

- Clearly optional. Label it plainly, e.g. "Photo (optional)".
- Uploads to the existing gallery bucket; store the resulting public URL in
  `image_url`. It must be a fully-qualified absolute URL.
- Show a small preview after upload, and allow removing/replacing before save.
- Saving with no image is valid and must not warn or block.
- If an edit flow for opportunities already exists, add the field there too so
  photos can be attached after the fact. If no edit flow exists, do not build
  one — note it in your summary instead.

## 3. Display — expanded view only

- Render the image at the **top of the expanded content**, above the
  description, unless the existing layout makes another position obviously
  better — if so, say why.
- Landscape frame, 16:9, `object-fit: cover`, full width of the expanded
  content area. Square corners.
- Always set `alt`. Use the opportunity title as the alt text.
- Lazy-load it (`loading="lazy"`) — it isn't visible until expansion.
- **No image:** render nothing at all. No placeholder box, no empty frame, no
  reserved space, no "no photo" label. Spacing must look deliberate either way.
- **Broken image URL:** must not leave a broken-image icon or blank frame.
  Hide the element on error.
- The collapsed card in the grid is unchanged — no thumbnail, no layout shift,
  no change to card heights.

---

## Verify

1. `npm run build` passes; `npm run lint` shows no new errors (the
   `vite.config.js` `process is not defined` error is pre-existing — ignore).
2. Expanded view **with** an image: renders at 375px, 768px, 1440px. No
   horizontal overflow at any width.
3. Expanded view **without** an image: this is the common case — verify
   explicitly that spacing looks correct and nothing is reserved or empty.
4. Broken/404 image URL: degrades cleanly.
5. Collapsed card grid: visually identical to before, equal heights preserved.
6. Admin: creating an opportunity with an image and without one both work.

## Finishing up

- Commit. **Do not push** — Cristian reviews locally and pushes himself.
- Summarize: files changed, which schema branch you took, whether a migration
  needs running, anything you couldn't verify, and anything left undone.
