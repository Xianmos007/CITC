begin;

alter table public.partners
  add column if not exists kind text not null default 'ministry';

update public.partners
set kind = 'ministry'
where kind is null;

alter table public.partners
  drop constraint if exists partners_kind_check;

alter table public.partners
  add constraint partners_kind_check
  check (kind in ('ministry', 'church'));

commit;
