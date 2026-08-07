-- Base table-level privileges. RLS policies (0002_rls.sql) still govern what
-- anon/authenticated can actually see or write; service_role bypasses RLS via
-- its BYPASSRLS role attribute but still needs these base grants to touch the
-- tables at all under Postgres' privilege system.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on public.profiles to authenticated, service_role;
grant select, insert, update, delete on public.pallets to authenticated, service_role;
grant select, insert on public.pallet_labels to authenticated, service_role;
grant select on public.pallet_summary to authenticated, service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;
