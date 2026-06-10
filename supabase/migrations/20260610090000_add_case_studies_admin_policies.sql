-- Allow authenticated admin users to manage case studies from the admin UI.
-- Public users retain read-only access through the existing select policy.

drop policy if exists "Authenticated admins can insert case studies" on public.case_studies;
create policy "Authenticated admins can insert case studies"
  on public.case_studies
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated admins can update case studies" on public.case_studies;
create policy "Authenticated admins can update case studies"
  on public.case_studies
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated admins can delete case studies" on public.case_studies;
create policy "Authenticated admins can delete case studies"
  on public.case_studies
  for delete
  to authenticated
  using (true);
