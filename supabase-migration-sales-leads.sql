-- Migration: Create sales_leads table for contact form submissions
-- Run this in Supabase SQL Editor

create table public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  team_size text not null,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.sales_leads enable row level security;

-- Allow anyone (including authenticated users) to submit a lead
create policy "Anyone can submit a lead"
  on public.sales_leads for insert
  with check (true);

-- Only service role can read leads (view in Supabase dashboard)
-- No SELECT policy = no client-side reads
