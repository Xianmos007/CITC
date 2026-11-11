-- =====================================================================
-- 0010_audit.sql — SPEC-audit-fixes Phase 2, sections 2.1–2.5
--
-- ADDITIVE ONLY. Adds columns, a new table, and two functions. Nothing is
-- dropped and no existing policy changes, so the live site keeps working
-- exactly as before. Safe to run any time; safe to run twice.
--
-- Run this BEFORE merging the Phase 2/3 pull request: the new site code
-- signs volunteers up through submit_signup() below.
--
-- 0011_close_volunteers.sql (drops the public volunteer policies) runs
-- AFTER the new code is live. See that file.
-- =====================================================================
begin;

-- 2.1 Opportunities: structured time & place. The existing date_label /
--     time_label columns stay, and become optional display overrides.
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

-- 2.3 Inbox: one table for every public form (used from Phase 6 on).
create table if not exists public.inbox (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('need','partner','newsletter','photo','contact')),
  payload    jsonb not null default '{}'::jsonb,
  status     text not null default 'new' check (status in ('new','done','dismissed')),
  created_at timestamptz not null default now()
);
alter table public.inbox enable row level security;
-- Supabase normally grants these by default; spelled out so it doesn't
-- depend on project settings. RLS below still decides what's allowed.
grant insert on public.inbox to anon, authenticated;
grant select, update, delete on public.inbox to authenticated;

-- The public can add new items but never read them back. Same pattern as
-- signups: the site inserts with its own UUID and no RETURNING.
drop policy if exists inbox_public_insert on public.inbox;
create policy inbox_public_insert on public.inbox
  for insert to anon, authenticated
  with check (status = 'new' and pg_column_size(payload) < 8000);

-- Admin access uses is_admin(), matching every other admin policy in this
-- database (the spec's "using (true)" would let any logged-in user in).
drop policy if exists inbox_admin_all on public.inbox;
create policy inbox_admin_all on public.inbox
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 2.4 All public signup counts in one call (confirmed only).
create or replace function public.get_signup_counts()
returns table (opportunity_id uuid, confirmed int)
language sql stable security definer set search_path = public as $$
  select s.opportunity_id, count(*)::int
  from signups s
  join opportunities o on o.id = s.opportunity_id
  where o.is_published and s.status = 'confirmed'
  group by s.opportunity_id
$$;
grant execute on function public.get_signup_counts() to anon, authenticated;

-- 2.5 Sign up through one server-side function. The server decides
--     confirmed vs waitlist, so the browser can't misreport it, and the
--     browser never needs to read or write the volunteers table.
create or replace function public.submit_signup(
  p_opportunity_id uuid,
  p_name   text,
  p_email  text,
  p_phone  text,
  p_church text
)
returns table (signup_id uuid, status text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_name   text := trim(coalesce(p_name, ''));
  v_phone  text := nullif(trim(coalesce(p_phone, '')), '');
  v_church text := nullif(trim(coalesce(p_church, '')), '');
  v_vol_id uuid;
  v_total  int;
  v_count  int;
  v_status text;
  v_signup uuid;
begin
  if v_name = '' then
    raise exception 'Please enter your name.';
  end if;
  if position('@' in v_email) = 0 then
    raise exception 'Please enter a valid email.';
  end if;
  if length(v_name) > 200 or length(v_email) > 320
     or length(coalesce(v_phone, '')) > 50 or length(coalesce(v_church, '')) > 200 then
    raise exception 'That entry is too long.';
  end if;

  -- Lock the opportunity row so two people grabbing the last spot at the
  -- same moment are counted one after the other.
  select o.total_spots into v_total
    from opportunities o
   where o.id = p_opportunity_id and o.is_published
   for update;
  if not found then
    raise exception 'This opportunity is no longer available.';
  end if;

  -- Match an existing volunteer case-insensitively (older rows may not be
  -- lowercased), otherwise create one.
  select v.id into v_vol_id
    from volunteers v
   where lower(v.email) = v_email
   order by v.first_seen_at nulls last
   limit 1;

  if v_vol_id is null then
    insert into volunteers (name, email, phone, church)
    values (v_name, v_email, v_phone, v_church)
    on conflict (email) do update set last_seen_at = now()
    returning id into v_vol_id;
  else
    update volunteers v set
      name         = v_name,
      phone        = coalesce(v_phone, v.phone),
      church       = coalesce(v_church, v.church),
      last_seen_at = now()
    where v.id = v_vol_id;
  end if;

  select count(*) into v_count
    from signups s
   where s.opportunity_id = p_opportunity_id and s.status = 'confirmed';

  v_status := case when v_total is not null and v_count >= v_total then 'waitlist' else 'confirmed' end;

  -- A repeat signup hits signups_opportunity_id_volunteer_id_key and raises
  -- 23505; the site turns that into "You're already signed up".
  insert into signups (opportunity_id, volunteer_id, status)
  values (p_opportunity_id, v_vol_id, v_status)
  returning id into v_signup;

  return query select v_signup, v_status;
end $$;
grant execute on function public.submit_signup(uuid, text, text, text, text) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------
-- How to verify (optional), in the SQL editor after running:
--   select * from public.get_signup_counts();
--     -> one row per published opportunity that has confirmed signups
--   select column_name from information_schema.columns
--    where table_name = 'opportunities' and column_name in
--      ('start_time','location','is_virtual','is_ongoing');
--     -> 4 rows
-- ---------------------------------------------------------------------
