-- Admin label/pallet deletion (via service_role, see /api/admin/labels
-- and /api/admin/pallets) needs DELETE on pallet_labels; 0003_grants.sql
-- only granted select+insert since labels were originally immutable.
grant delete on public.pallet_labels to service_role;
