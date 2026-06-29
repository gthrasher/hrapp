alter table public.employees
  add column if not exists okta_id text unique;
