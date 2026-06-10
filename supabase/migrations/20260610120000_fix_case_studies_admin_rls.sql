-- Ensure authenticated Supabase users can manage case studies from the admin UI.
--
-- The admin form uses the browser Supabase client, so writes are performed as the
-- logged-in `authenticated` role and must be explicitly allowed by both table
-- privileges and RLS policies. This migration is intentionally idempotent so it
-- can be re-run safely if the remote database has drifted from earlier policies.

alter table public.case_studies enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.case_studies to anon, authenticated;
grant insert, update, delete on public.case_studies to authenticated;

-- Remove every previous admin policy name used in this project before creating
-- the canonical policies below.
drop policy if exists "Authenticated admins can insert case studies" on public.case_studies;
drop policy if exists "Authenticated admins can update case studies" on public.case_studies;
drop policy if exists "Authenticated admins can delete case studies" on public.case_studies;
drop policy if exists "Authenticated users can insert case studies" on public.case_studies;
drop policy if exists "Authenticated users can update case studies" on public.case_studies;
drop policy if exists "Authenticated users can delete case studies" on public.case_studies;

create policy "Authenticated users can insert case studies"
  on public.case_studies
  for insert
  to authenticated
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update case studies"
  on public.case_studies
  for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete case studies"
  on public.case_studies
  for delete
  to authenticated
  using (auth.role() = 'authenticated');
