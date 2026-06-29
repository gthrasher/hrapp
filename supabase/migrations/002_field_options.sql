-- New columns on employees
alter table public.employees
  add column if not exists user_type   text,
  add column if not exists cost_center text,
  add column if not exists division    text;

-- New table for dropdown options
create table if not exists public.field_options (
  id          uuid primary key default gen_random_uuid(),
  field_name  text not null,
  value       text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now(),
  unique(field_name, value)
);

alter table public.field_options enable row level security;
drop policy if exists "allow all" on public.field_options;
create policy "allow all" on public.field_options for all using (true) with check (true);

-- Seed data
insert into public.field_options (field_name, value, sort_order) values
  ('department','Engineering',1),('department','Sales',2),('department','Marketing',3),
  ('department','Finance',4),('department','Support',5),('department','Facilities',6),
  ('user_type','Full-time',1),('user_type','Part-time',2),('user_type','Contractor',3),('user_type','Intern',4),
  ('cost_center','CC-100',1),('cost_center','CC-200',2),('cost_center','CC-300',3),
  ('division','North America',1),('division','Europe',2),('division','APAC',3);
