-- =====================================================================
-- 0014: tighten gallery permissions and harden SECURITY DEFINER functions
--
-- From the Nov 10 security review:
--   * gallery_photos / gallery_categories let ANY signed-in user write
--     (using(true)). Every other table requires is_admin(). Match them.
--   * The 'gallery' storage bucket let any signed-in user upload, change
--     or delete files, with no size or type limit. Require is_admin() and
--     allow only images up to 10 MB. (The admin panel always uploads
--     compressed JPEGs, well under that.)
--   * Pin search_path on four functions flagged by the Supabase linter.
--
-- Public reads are unchanged. Idempotent: safe to run more than once.
-- (0013 is reserved for 0013_inbox_uploads.sql in SPEC-audit-fixes.md.)
-- =====================================================================
begin;

-- ---- Gallery tables: writes are admin-only --------------------------
drop policy if exists gallery_admin_all on public.gallery_photos;
create policy gallery_admin_all on public.gallery_photos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists gallery_cats_admin_all on public.gallery_categories;
create policy gallery_cats_admin_all on public.gallery_categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Gallery storage: admin-only writes ------------------------------
drop policy if exists gallery_admin_insert on storage.objects;
create policy gallery_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists gallery_admin_update on storage.objects;
create policy gallery_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin())
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists gallery_admin_delete on storage.objects;
create policy gallery_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

-- Images only, 10 MB max. The bucket stays public for reading.
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'gallery';

-- ---- Pin search_path on flagged functions -----------------------------
alter function public.is_admin() set search_path = public;
alter function public.get_opportunity_signup_count(uuid) set search_path = public;
alter function public.lookup_my_signups(text) set search_path = public;
alter function public.touch_updated_at() set search_path = public;

commit;
