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

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'User'));
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
  org_id            uuid,
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
  org_id        uuid,
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
  org_id         uuid,
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
  org_id           uuid,
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
