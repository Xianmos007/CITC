-- =====================================================================
-- 0011_close_volunteers.sql — SPEC-audit-fixes Phase 2, section 2.6
--
-- Closes the volunteers table to the public. Today anyone with the
-- site's public key can list every volunteer's name, email and phone.
--
-- ORDER MATTERS. Run this only AFTER:
--   1. 0010_audit.sql has been run, and
--   2. the Phase 2/3 pull request is merged AND the deploy has finished
--      (the GitHub "Actions" tab shows a green check).
-- Run it earlier and signups on the old site code will fail.
--
-- Drops every policy that lets anon touch public.volunteers, and the
-- anon INSERT policy on public.signups (signups now go through
-- submit_signup()). The admin policies (volunteers_admin_all,
-- signups_admin_all) are untouched.
-- =====================================================================
begin;

-- Refuse to run if 0010 hasn't been applied — without submit_signup()
-- nobody could sign up at all.
do $$
begin
  if to_regprocedure('public.submit_signup(uuid, text, text, text, text)') is null then
    raise exception 'Run 0010_audit.sql first: public.submit_signup() does not exist yet.';
  end if;
end $$;

-- Policy names from supabase/schema.sql.rtf
drop policy if exists "volunteers_public_insert"      on public.volunteers;
drop policy if exists "volunteers_public_self_read"   on public.volunteers;
drop policy if exists "volunteers_public_self_update" on public.volunteers;
drop policy if exists "signups_public_insert"         on public.signups;

commit;

-- ---------------------------------------------------------------------
-- How to verify
--
-- In a terminal, replace <publishable key> with the site's publishable
-- key (Supabase dashboard → Project Settings → API Keys) and run:
--
--   curl 'https://xsdnopfsmrabhhqwlmyr.supabase.co/rest/v1/volunteers?select=email&limit=1' \
--     -H "apikey: <publishable key>"
--
-- It must print [] or a permission error. If it prints an email address,
-- the table is still open: check Authentication → Policies → volunteers
-- for any policy other than volunteers_admin_all.
--
-- Then sign up for a test need on the live site to confirm signups
-- still work, and delete the test signup in the dashboard.
-- ---------------------------------------------------------------------
