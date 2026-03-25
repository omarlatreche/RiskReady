-- Migration: Add 7-day trial to profiles
-- Run this in Supabase SQL Editor

-- 1. Add trial_ends_at column
alter table public.profiles
  add column trial_ends_at timestamptz;

-- 2. Backfill: existing users without an org get 7 days from signup
-- Org members get null (no trial limit)
update public.profiles
  set trial_ends_at = created_at + interval '7 days'
  where org_id is null and trial_ends_at is null;

-- 3. Set default for new signups (will be overridden by trigger for org invites)
alter table public.profiles
  alter column trial_ends_at set default now() + interval '7 days';

-- 4. Update handle_new_user() to set trial_ends_at properly
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _invite record;
  _current_count int;
  _max_count int;
begin
  select * into _invite from public.org_invites where email = new.email limit 1;

  if _invite is not null then
    -- Check seat limit
    select count(*) into _current_count
      from public.profiles where org_id = _invite.org_id;
    select max_seats into _max_count
      from public.organisations where id = _invite.org_id;

    if _current_count < _max_count then
      -- Invited + seats available: join org, no trial limit
      insert into public.profiles (id, display_name, org_id, role, trial_ends_at)
      values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'display_name', 'User'),
        _invite.org_id,
        'user',
        null
      );
      delete from public.org_invites where id = _invite.id;
    else
      -- Invited but no seats: standalone with trial
      insert into public.profiles (id, display_name, trial_ends_at)
      values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'), now() + interval '7 days');
    end if;
  else
    -- No invite: standalone with trial
    insert into public.profiles (id, display_name, trial_ends_at)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'), now() + interval '7 days');
  end if;

  return new;
end;
$$ language plpgsql security definer;
