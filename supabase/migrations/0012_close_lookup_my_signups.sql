-- =====================================================================
-- 0012_close_lookup_my_signups.sql
--
-- lookup_my_signups(email) returns every signup for whatever email it is
-- given. Open to the public, anyone could type a neighbor's email and see
-- which needs they signed up for. The website stopped calling it in the
-- Phase 2/3 release, so this takes away public access.
--
-- It does not delete the function: the admin panel and edge functions
-- (which use the service role) are unaffected, and access can be
-- restored with a GRANT if it's ever needed.
--
-- Safe to run any time, and safe to run twice. Nothing on the site uses
-- this function, so there's no ordering with code deploys.
-- =====================================================================
begin;

do $$
declare
  fn regprocedure := to_regprocedure('public.lookup_my_signups(text)');
begin
  if fn is null then
    raise notice 'public.lookup_my_signups(text) does not exist; nothing to do.';
    return;
  end if;
  -- PUBLIC covers the default grant every Postgres function gets;
  -- anon/authenticated cover Supabase's own default grants.
  execute format('revoke execute on function %s from public, anon, authenticated', fn);
end $$;

commit;

-- ---------------------------------------------------------------------
-- How to verify, in the SQL editor:
--   select has_function_privilege('anon', 'public.lookup_my_signups(text)', 'execute');
-- must return false.
-- ---------------------------------------------------------------------
