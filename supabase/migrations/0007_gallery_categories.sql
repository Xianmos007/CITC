begin;
create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.gallery_categories enable row level security;
drop policy if exists "gallery_cats_public_read" on public.gallery_categories;
create policy "gallery_cats_public_read" on public.gallery_categories
  for select using (true);
drop policy if exists "gallery_cats_admin_all" on public.gallery_categories;
create policy "gallery_cats_admin_all" on public.gallery_categories
  for all to authenticated using (true) with check (true);
insert into public.gallery_categories (key, label, sort_order) values
  ('saturday','Saturdays',0),('pantry','Pantry',1),('yard','Yard work',2),
  ('tutoring','Tutoring',3),('bridge','Under the bridge',4),('sunday','Sunday',5)
on conflict (key) do nothing;
commit;
