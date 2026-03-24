-- RiskReady Supabase Schema
-- Run this in the Supabase SQL editor after creating your project.

-- PROFILES
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'User',
  org_id       uuid,
  role         text not null default 'user',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- ORGANISATIONS
create table public.organisations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_by uuid not null references auth.users(id),
  max_seats  integer not null default 10,
  created_at timestamptz not null default now()
);
alter table public.organisations enable row level security;
create policy "Members read own org" on public.organisations for select using (id = public.get_my_org_id());
-- No INSERT policy — orgs are provisioned via provision_org() in SQL editor only

-- ORG INVITES
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

-- Foreign keys for org_id columns
alter table public.profiles add constraint profiles_org_fk foreign key (org_id) references public.organisations(id);

-- Auto-create profile on signup, auto-assign org if invited
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ATTEMPTS
create table public.attempts (
  id                text not null,
  user_id           uuid not null references auth.users(id) on delete cascade,
  org_id            uuid references public.organisations(id),
  mode              text not null,
  score             integer not null,
  total_questions   integer not null,
  correct_count     integer not null,
  time_spent_seconds integer,
  started_at        timestamptz,
  completed_at      timestamptz not null default now(),
  question_ids      jsonb not null default '[]',
  created_at        timestamptz not null default now(),
  primary key (id, user_id)
);
alter table public.attempts enable row level security;
create policy "Users read own attempts" on public.attempts for select using (auth.uid() = user_id);
create policy "Users insert own attempts" on public.attempts for insert with check (auth.uid() = user_id);
create index idx_attempts_user on public.attempts(user_id);

-- RESPONSES
create table public.responses (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  org_id        uuid references public.organisations(id),
  attempt_id    text not null,
  question_id   text not null,
  chapter       text not null,
  answer        integer not null,
  correct       boolean not null,
  confidence    integer not null default 2,
  answered_at   timestamptz not null default now()
);
alter table public.responses enable row level security;
create policy "Users read own responses" on public.responses for select using (auth.uid() = user_id);
create policy "Users insert own responses" on public.responses for insert with check (auth.uid() = user_id);
create index idx_responses_user on public.responses(user_id);
create index idx_responses_attempt on public.responses(user_id, attempt_id);

-- REVIEW QUEUE
create table public.review_queue (
  user_id        uuid not null references auth.users(id) on delete cascade,
  org_id         uuid references public.organisations(id),
  question_id    text not null,
  chapter        text not null,
  added_at       timestamptz not null default now(),
  times_reviewed integer not null default 0,
  resolved       boolean not null default false,
  primary key (user_id, question_id)
);
alter table public.review_queue enable row level security;
create policy "Users read own queue" on public.review_queue for select using (auth.uid() = user_id);
create policy "Users insert own queue" on public.review_queue for insert with check (auth.uid() = user_id);
create policy "Users update own queue" on public.review_queue for update using (auth.uid() = user_id);
create policy "Users delete own queue" on public.review_queue for delete using (auth.uid() = user_id);

-- STREAKS
create table public.streaks (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  org_id           uuid references public.organisations(id),
  current_streak   integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_date date,
  history          jsonb not null default '[]',
  updated_at       timestamptz not null default now()
);
alter table public.streaks enable row level security;
create policy "Users read own streaks" on public.streaks for select using (auth.uid() = user_id);
create policy "Users insert own streaks" on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users update own streaks" on public.streaks for update using (auth.uid() = user_id);

-- ORG-LEVEL READ POLICIES (admins can read all data in their org)
create policy "Admins read org profiles" on public.profiles for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins update org profiles" on public.profiles for update using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org attempts" on public.attempts for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org responses" on public.responses for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
create policy "Admins read org streaks" on public.streaks for select using (org_id in (select org_id from public.profiles where id = auth.uid() and role = 'admin') and org_id is not null);
