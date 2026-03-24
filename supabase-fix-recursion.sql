-- Fix: infinite recursion in RLS policies for "profiles"
-- The admin policies on profiles do a subquery back into profiles, causing a loop.
-- Solution: use a SECURITY DEFINER function to get the current user's org_id without RLS.

-- 1. Create helper function (bypasses RLS)
create or replace function public.get_my_org_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select org_id from public.profiles where id = auth.uid()
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- 2. Drop the recursive policies
drop policy if exists "Admins read org profiles" on public.profiles;
drop policy if exists "Admins update org profiles" on public.profiles;

-- 3. Also fix organisations SELECT policy (it subqueries profiles too)
drop policy if exists "Members read own org" on public.organisations;

-- 4. Fix org_invites policies
drop policy if exists "Admins read invites" on public.org_invites;
drop policy if exists "Admins create invites" on public.org_invites;
drop policy if exists "Admins delete invites" on public.org_invites;

-- 5. Fix other admin policies that subquery profiles
drop policy if exists "Admins read org attempts" on public.attempts;
drop policy if exists "Admins read org responses" on public.responses;
drop policy if exists "Admins read org streaks" on public.streaks;

-- 6. Re-create all policies using the helper functions
create policy "Members read own org" on public.organisations
  for select using (id = public.get_my_org_id());

create policy "Admins read org profiles" on public.profiles
  for select using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
    and org_id is not null
  );

create policy "Admins update org profiles" on public.profiles
  for update using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
    and org_id is not null
  );

create policy "Admins read invites" on public.org_invites
  for select using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
  );

create policy "Admins create invites" on public.org_invites
  for insert with check (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
  );

create policy "Admins delete invites" on public.org_invites
  for delete using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
  );

create policy "Admins read org attempts" on public.attempts
  for select using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
    and org_id is not null
  );

create policy "Admins read org responses" on public.responses
  for select using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
    and org_id is not null
  );

create policy "Admins read org streaks" on public.streaks
  for select using (
    org_id = public.get_my_org_id()
    and public.get_my_role() = 'admin'
    and org_id is not null
  );
