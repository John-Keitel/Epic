-- EPIC community platform — initial schema
-- Safe to re-run? No. Applied once by `supabase db reset` / migration runner.

create extension if not exists pgcrypto;

------------------------------------------------------------------------------
-- Enums
------------------------------------------------------------------------------
create type public.member_role as enum ('member', 'moderator', 'admin');
create type public.member_status as enum ('pending', 'active', 'restricted', 'deactivated');
create type public.reaction_kind as enum ('heart', 'torch', 'clap');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

------------------------------------------------------------------------------
-- Tables
------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  role_title text check (char_length(role_title) <= 80),
  region text check (char_length(region) <= 80),
  bio text check (char_length(bio) <= 500),
  avatar_url text,
  community_role public.member_role not null default 'member',
  status public.member_status not null default 'active',
  show_role boolean not null default true,
  show_region boolean not null default true,
  show_bio boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name text not null,
  description text not null,
  icon text not null default 'chat',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 1 and 5000),
  is_removed boolean not null default false,
  removed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_space_created_idx on public.posts (space_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);
create index posts_author_idx on public.posts (author_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  is_removed boolean not null default false,
  removed_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_created_idx on public.comments (post_id, created_at);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);

create index reactions_post_idx on public.reactions (post_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type text not null check (type in ('reply', 'mention', 'moderation')),
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'member')),
  target_id uuid not null,
  reason text not null,
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'open',
  handled_by uuid references public.profiles (id),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index reports_status_created_idx on public.reports (status, created_at);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'member')),
  target_id uuid not null,
  action text not null check (action in ('hide', 'remove', 'restore', 'warn', 'restrict', 'reinstate')),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.blocked_members (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table public.terms_acceptance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  version text not null,
  accepted_at timestamptz not null default now(),
  unique (user_id, version)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

------------------------------------------------------------------------------
-- Helper functions (security definer avoids recursive RLS)
------------------------------------------------------------------------------
create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and community_role in ('moderator', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and status = 'active'
      and community_role = 'admin'
  );
$$;

create or replace function public.is_blocked(viewer uuid, other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.blocked_members
    where (blocker_id = viewer and blocked_id = other)
       or (blocker_id = other and blocked_id = viewer)
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();
create trigger comments_touch before update on public.comments
  for each row execute function public.touch_updated_at();

-- Non-staff authors may edit their text but must not flip moderation flags.
create or replace function public.guard_post_flags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() and (new.is_removed <> old.is_removed or new.removed_by is distinct from old.removed_by) then
    raise exception 'Only moderators can change moderation flags';
  end if;
  return new;
end;
$$;

create trigger posts_guard_flags before update on public.posts
  for each row execute function public.guard_post_flags();

create or replace function public.guard_comment_flags()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() and (new.is_removed <> old.is_removed or new.removed_by is distinct from old.removed_by) then
    raise exception 'Only moderators can change moderation flags';
  end if;
  return new;
end;
$$;

create trigger comments_guard_flags before update on public.comments
  for each row execute function public.guard_comment_flags();

-- Create a profile for every new auth user using sign-up metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_handle text;
  candidate text;
  suffix integer := 0;
begin
  base_handle := lower(
    regexp_replace(
      coalesce(new.raw_user_meta_data ->> 'handle', split_part(new.email, '@', 1)),
      '[^a-z0-9_]', '', 'g'
    )
  );

  if char_length(base_handle) < 3 then
    base_handle := 'member_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  candidate := left(base_handle, 26);
  while exists (select 1 from public.profiles where handle = candidate) loop
    suffix := suffix + 1;
    candidate := left(base_handle, 26) || suffix::text;
  end loop;

  insert into public.profiles (id, handle, display_name, role_title, region)
  values (
    new.id,
    candidate,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'role_title'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'region'), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Notify a post author when someone replies.
create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  post_author uuid;
begin
  select author_id into post_author from public.posts where id = new.post_id;

  if post_author is not null and post_author <> new.author_id then
    insert into public.notifications (user_id, actor_id, type, post_id, comment_id)
    values (post_author, new.author_id, 'reply', new.post_id, new.id);
  end if;

  return new;
end;
$$;

create trigger comments_notify after insert on public.comments
  for each row execute function public.notify_on_comment();

------------------------------------------------------------------------------
-- Member directory view (hides fields each member chose not to share)
------------------------------------------------------------------------------
create view public.member_directory
with (security_invoker = true)
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
-- Row level security
------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.blocked_members enable row level security;
alter table public.terms_acceptance enable row level security;
alter table public.audit_events enable row level security;

-- profiles
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_staff() or (public.is_active_member() and status = 'active'));

create policy "profiles_insert_self" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());

-- spaces
create policy "spaces_select" on public.spaces
  for select to anon, authenticated
  using (is_active or public.is_staff());

create policy "spaces_admin_write" on public.spaces
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- posts
create policy "posts_select" on public.posts
  for select to authenticated
  using (
    (
      public.is_active_member()
      and not is_removed
      and exists (select 1 from public.spaces s where s.id = space_id and s.is_active)
      and not public.is_blocked(auth.uid(), author_id)
    )
    or author_id = auth.uid()
    or public.is_staff()
  );

create policy "posts_insert" on public.posts
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and exists (select 1 from public.spaces s where s.id = space_id and s.is_active)
  );

create policy "posts_update" on public.posts
  for update to authenticated
  using (author_id = auth.uid() or public.is_staff())
  with check (author_id = auth.uid() or public.is_staff());

create policy "posts_delete" on public.posts
  for delete to authenticated
  using (author_id = auth.uid() or public.is_staff());

-- comments
create policy "comments_select" on public.comments
  for select to authenticated
  using (
    (
      public.is_active_member()
      and not is_removed
      and not public.is_blocked(auth.uid(), author_id)
      and exists (
        select 1 from public.posts p
        where p.id = post_id and not p.is_removed
      )
    )
    or author_id = auth.uid()
    or public.is_staff()
  );

create policy "comments_insert" on public.comments
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.posts p
      where p.id = post_id
        and not p.is_removed
        and not public.is_blocked(auth.uid(), p.author_id)
    )
  );

create policy "comments_update" on public.comments
  for update to authenticated
  using (author_id = auth.uid() or public.is_staff())
  with check (author_id = auth.uid() or public.is_staff());

create policy "comments_delete" on public.comments
  for delete to authenticated
  using (author_id = auth.uid() or public.is_staff());

-- reactions
create policy "reactions_select" on public.reactions
  for select to authenticated
  using (public.is_active_member() or public.is_staff());

create policy "reactions_insert" on public.reactions
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active_member()
    and exists (select 1 from public.posts p where p.id = post_id and not p.is_removed)
  );

create policy "reactions_delete" on public.reactions
  for delete to authenticated
  using (user_id = auth.uid() or public.is_staff());

-- notifications
create policy "notifications_select" on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy "notifications_update" on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_delete" on public.notifications
  for delete to authenticated
  using (user_id = auth.uid());

create policy "notifications_staff_insert" on public.notifications
  for insert to authenticated
  with check (public.is_staff() and actor_id = auth.uid());

-- reports
create policy "reports_insert" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid() and public.is_active_member());

create policy "reports_select" on public.reports
  for select to authenticated
  using (reporter_id = auth.uid() or public.is_staff());

create policy "reports_update_staff" on public.reports
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- moderation actions
create policy "moderation_select" on public.moderation_actions
  for select to authenticated
  using (public.is_staff());

create policy "moderation_insert" on public.moderation_actions
  for insert to authenticated
  with check (public.is_staff() and moderator_id = auth.uid());

-- blocks
create policy "blocks_select" on public.blocked_members
  for select to authenticated
  using (blocker_id = auth.uid() or public.is_staff());

create policy "blocks_insert" on public.blocked_members
  for insert to authenticated
  with check (blocker_id = auth.uid() and public.is_active_member());

create policy "blocks_delete" on public.blocked_members
  for delete to authenticated
  using (blocker_id = auth.uid());

-- terms
create policy "terms_select" on public.terms_acceptance
  for select to authenticated
  using (user_id = auth.uid() or public.is_staff());

create policy "terms_insert" on public.terms_acceptance
  for insert to authenticated
  with check (user_id = auth.uid());

-- audit
create policy "audit_select" on public.audit_events
  for select to authenticated
  using (public.is_staff());

create policy "audit_insert" on public.audit_events
  for insert to authenticated
  with check (public.is_staff() and actor_id = auth.uid());

------------------------------------------------------------------------------
-- Seed the launch spaces
------------------------------------------------------------------------------
insert into public.spaces (id, slug, name, description, icon, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'front-porch', 'The Front Porch',
   'Introduce yourself, share a photo, or tell us how your week is going. Linus and everybody else starts here.',
   'chair', 1),
  ('22222222-2222-4222-8222-222222222222', 'campfire', 'The Campfire',
   'Stories, memories, and professional experiences shared with sensitivity. What made you proud, what changed you.',
   'campfire', 2),
  ('33333333-3333-4333-8333-333333333333', 'break-room', 'The Break Room',
   'Light conversation, humor, pets, playlists, and everyday encouragement. Life outside funeral service belongs here too.',
   'coffee', 3),
  ('44444444-4444-4444-8444-444444444444', 'ask-epic', 'Ask EPIC',
   'Practical questions and peer advice. Real experience from people who understand the work.',
   'question', 4),
  ('55555555-5555-4555-8555-555555555555', 'ive-been-there', 'I''ve Been There',
   'Supportive experiences and lessons learned from difficult professional moments. Ask for help from someone who truly understands.',
   'heart', 5)
on conflict (slug) do nothing;
