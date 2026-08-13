begin;

-- Optional documentary photo shown only in an opportunity's expanded view.
-- Nullable with no default: most opportunities will never have one, and the
-- frontend treats a missing column exactly like a null value.
alter table public.opportunities
  add column if not exists image_url text;

commit;
