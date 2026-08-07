alter table public.profiles enable row level security;
alter table public.pallets enable row level security;
alter table public.pallet_labels enable row level security;

-- Helper: read current user's role without recursive RLS issues.
-- SECURITY DEFINER bypasses RLS on profiles internally for this lookup only.
create or replace function public.current_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- profiles ----------
create policy profiles_select_own
  on public.profiles for select
  using (id = auth.uid());

create policy profiles_select_all_for_staff
  on public.profiles for select
  using (public.current_role() in ('admin', 'supervisor'));

-- No client-side insert/update/delete policies for profiles.
-- All profile creation/editing/deactivation goes through the secured
-- server-side API route using the service role key (bypasses RLS by design).

-- ---------- pallets ----------
create policy pallets_select_own
  on public.pallets for select
  using (opened_by = auth.uid());

create policy pallets_insert_own
  on public.pallets for insert
  with check (opened_by = auth.uid());

create policy pallets_update_own
  on public.pallets for update
  using (opened_by = auth.uid())
  with check (opened_by = auth.uid());

create policy pallets_select_all_for_staff
  on public.pallets for select
  using (public.current_role() in ('admin', 'supervisor'));

-- ---------- pallet_labels ----------
create policy labels_insert_own_open_pallet
  on public.pallet_labels for insert
  with check (
    scanned_by = auth.uid()
    and exists (
      select 1 from public.pallets p
      where p.id = pallet_id
        and p.opened_by = auth.uid()
        and p.status = 'open'
    )
  );

create policy labels_select_own
  on public.pallet_labels for select
  using (
    exists (
      select 1 from public.pallets p
      where p.id = pallet_id and p.opened_by = auth.uid()
    )
  );

create policy labels_select_all_for_staff
  on public.pallet_labels for select
  using (public.current_role() in ('admin', 'supervisor'));

-- No update/delete policies on pallet_labels: scans are immutable (audit trail).
