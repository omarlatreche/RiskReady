-- RiskReady Organisation Migration
-- Run this in the Supabase SQL editor to add organisation features
-- to an existing RiskReady database.

-- 1. ORGANISATIONS TABLE
create table public.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.organisations enable row level security;
create policy "Members read own org" on public.organisations for select using (id in (select org_id from public.profiles where id = auth.uid()));
create policy "Auth users create org" on public.organisations for insert with check (auth.uid() = created_by);

-- 2. ORG INVITES TABLE
create table public.org_invites (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organisations(id) on delete cascade,
  email      text not null,
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(org_id, email)
);
alter table public.org_invites enable row level security;
create policy "Admins read invites" on public.org_invites for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins create invites" on public.org_invites for insert with check (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins delete invites" on public.org_invites for delete using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin'));

-- 3. FOREIGN KEYS on existing org_id columns
alter table public.profiles add constraint profiles_org_fk foreign key (org_id) references public.organisations(id);
alter table public.attempts add constraint attempts_org_fk foreign key (org_id) references public.organisations(id);
alter table public.responses add constraint responses_org_fk foreign key (org_id) references public.organisations(id);
alter table public.review_queue add constraint review_queue_org_fk foreign key (org_id) references public.organisations(id);
alter table public.streaks add constraint streaks_org_fk foreign key (org_id) references public.organisations(id);

-- 4. UPDATE TRIGGER to auto-assign org on invite signup
create or replace function public.handle_new_user()
returns trigger as $$
declare _invite record;
begin
  select * into _invite from public.org_invites where email = new.email limit 1;
  if _invite is not null then
    insert into public.profiles (id, display_name, org_id, role)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'), _invite.org_id, 'user');
    delete from public.org_invites where id = _invite.id;
  else
    insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'));
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- 5. ADMIN RLS POLICIES (admins can read all data in their org)
create policy "Admins read org profiles" on public.profiles for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins update org profiles" on public.profiles for update using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org attempts" on public.attempts for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org responses" on public.responses for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org streaks" on public.streaks for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
