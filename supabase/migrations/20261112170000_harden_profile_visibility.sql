-- Harden profile visibility and prevent privilege escalation.

------------------------------------------------------------------------------
-- Guard profile columns that members must never set on themselves
------------------------------------------------------------------------------
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_staff() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.community_role <> 'member' or new.status <> 'active' then
      raise exception 'Members cannot set their own community role or status';
    end if;
    return new;
  end if;

  if new.community_role <> old.community_role or new.status <> old.status then
    raise exception 'Only staff can change community role or membership status';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges
  before insert or update on public.profiles
  for each row execute function public.guard_profile_privileges();

------------------------------------------------------------------------------
-- Column-level select privileges: hidden profile fields are never served
-- from the base table to ordinary members.
------------------------------------------------------------------------------
revoke select on public.profiles from anon, authenticated;
grant select (
  id,
  handle,
  display_name,
  avatar_url,
  community_role,
  status,
  show_role,
  show_region,
  show_bio,
  created_at,
  updated_at
) on public.profiles to authenticated;

-- A member's own full profile (still filtered by their session).
create or replace view public.my_profile
with (security_invoker = false)
as
select * from public.profiles where id = auth.uid();

grant select on public.my_profile to authenticated;

-- Directory view hides optional fields a member chose not to share.
drop view if exists public.member_directory;

create view public.member_directory
with (security_invoker = false)
as
select
  id,
  handle,
  display_name,
  case when show_role then role_title else null end as role_title,
  case when show_region then region else null end as region,
  case when show_bio then bio else null end as bio,
  avatar_url,
  community_role,
  created_at
from public.profiles
where status = 'active';

grant select on public.member_directory to authenticated;

------------------------------------------------------------------------------
-- Reports may only be filed as open
------------------------------------------------------------------------------
drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports
  for insert to authenticated
  with check (
    reporter_id = auth.uid()
    and public.is_active_member()
    and status = 'open'
    and handled_by is null
  );
