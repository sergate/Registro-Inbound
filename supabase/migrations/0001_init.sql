-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role as enum ('admin', 'supervisor', 'operario');
create type pallet_status as enum ('open', 'closed');

-- ============================================================
-- PROFILES
-- one row per auth.users user, holds role + username + active flag
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role user_role not null default 'operario',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ============================================================
-- PALLETS
-- pallet_number is DB-guaranteed sequential via GENERATED ALWAYS AS IDENTITY
-- ============================================================
create table public.pallets (
  id uuid primary key default gen_random_uuid(),
  pallet_number bigint generated always as identity,
  opened_by uuid not null references public.profiles(id),
  opened_at timestamptz not null default now(),
  status pallet_status not null default 'open',
  closed_at timestamptz,
  constraint pallet_number_unique unique (pallet_number)
);

-- Enforce: a user can only have ONE open pallet at a time.
create unique index one_open_pallet_per_user
  on public.pallets (opened_by)
  where status = 'open';

-- ============================================================
-- PALLET_LABELS
-- ean13 is GLOBALLY unique across the whole table (whole system)
-- ============================================================
create table public.pallet_labels (
  id uuid primary key default gen_random_uuid(),
  pallet_id uuid not null references public.pallets(id),
  ean13 text not null,
  scanned_by uuid not null references public.profiles(id),
  scanned_at timestamptz not null default now(),
  constraint ean13_globally_unique unique (ean13)
);

create index idx_pallet_labels_pallet_id on public.pallet_labels (pallet_id);
create index idx_pallet_labels_scanned_by on public.pallet_labels (scanned_by);

-- Convenience view: label count per pallet, derived (never stored/desynced)
create view public.pallet_summary as
select
  p.id,
  p.pallet_number,
  p.opened_by,
  p.opened_at,
  p.status,
  p.closed_at,
  count(l.id) as label_count
from public.pallets p
left join public.pallet_labels l on l.pallet_id = p.id
group by p.id;
