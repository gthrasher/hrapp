-- Run this in your Supabase project's SQL Editor to create the employees table.

create table public.employees (
  id          uuid primary key default gen_random_uuid(),
  first_name  text not null,
  last_name   text not null,
  email       text not null unique,
  phone       text,
  department  text,
  job_title   text,
  start_date  date,
  status      text not null default 'active' check (status in ('active', 'inactive')),
  manager_id  uuid references public.employees(id),
  created_at  timestamptz not null default now()
);

-- Allow public read/write access (no auth).
-- Tighten these policies once you add authentication.
alter table public.employees enable row level security;

create policy "allow all" on public.employees
  for all using (true) with check (true);
