-- Allow trusted server-side operations (migrations, service role, SQL console)
-- while still blocking member-driven privilege escalation.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- No end-user JWT: this is a trusted database or service-role operation.
  if auth.uid() is null then
    return new;
  end if;

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
