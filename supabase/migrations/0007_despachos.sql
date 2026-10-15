-- Modulo de despacho: pallets de salida y las cajas (etiquetas) que contienen.
-- Una etiqueta solo puede salir una vez (UNIQUE sobre pallet_label_id) y solo si
-- ya fue ingresada y su pallet de ingreso esta cerrado (ver despachar_etiqueta).

-- ============================================================
-- PALLETS DE SALIDA
-- ============================================================
create table public.despachos (
  id uuid primary key default gen_random_uuid(),
  numero bigint not null,
  opened_by uuid not null references public.profiles(id),
  opened_at timestamptz not null default now(),
  status pallet_status not null default 'open',
  closed_at timestamptz,
  destino text,
  referencia text,
  constraint despacho_numero_unique unique (numero)
);

-- Un usuario solo puede tener UN pallet de salida abierto a la vez.
create unique index one_open_despacho_per_user
  on public.despachos (opened_by)
  where status = 'open';

-- Mismo criterio que pallets: el numero sale de lo que hay en la tabla
-- (MAX+1), con lock para que dos inserts simultaneos no calculen el mismo.
create or replace function public.assign_despacho_numero()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.numero is null then
    lock table public.despachos in share row exclusive mode;
    select coalesce(max(numero), 0) + 1 into new.numero from public.despachos;
  end if;
  return new;
end;
$$;

create trigger trg_assign_despacho_numero
before insert on public.despachos
for each row
execute function public.assign_despacho_numero();

-- ============================================================
-- CAJAS DE CADA PALLET DE SALIDA
-- ============================================================
create table public.despacho_etiquetas (
  id uuid primary key default gen_random_uuid(),
  despacho_id uuid not null references public.despachos(id) on delete cascade,
  -- RESTRICT: no se puede borrar una etiqueta de ingreso que ya salio.
  pallet_label_id uuid not null references public.pallet_labels(id) on delete restrict,
  scanned_by uuid not null references public.profiles(id),
  scanned_at timestamptz not null default now(),
  constraint despacho_label_unique unique (pallet_label_id)
);

create index idx_despacho_etiquetas_despacho_id on public.despacho_etiquetas (despacho_id);

-- ============================================================
-- DESPACHAR UNA ETIQUETA (valida + inserta en un solo paso)
-- ============================================================
create or replace function public.despachar_etiqueta(p_despacho_id uuid, p_ean13 text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_despacho record;
  v_label record;
  v_prev record;
begin
  select id, opened_by, status into v_despacho
  from public.despachos where id = p_despacho_id;

  if not found or v_uid is null or v_despacho.opened_by <> v_uid or v_despacho.status <> 'open' then
    return jsonb_build_object('resultado', 'despacho_invalido');
  end if;

  select l.id, p.pallet_number, p.status into v_label
  from public.pallet_labels l
  join public.pallets p on p.id = l.pallet_id
  where l.ean13 = btrim(p_ean13);

  if not found then
    return jsonb_build_object('resultado', 'no_ingresada');
  end if;

  select d.numero, pr.username, de.scanned_at into v_prev
  from public.despacho_etiquetas de
  join public.despachos d on d.id = de.despacho_id
  join public.profiles pr on pr.id = de.scanned_by
  where de.pallet_label_id = v_label.id;

  if found then
    return jsonb_build_object(
      'resultado', 'ya_despachada',
      'despacho_numero', v_prev.numero,
      'operario', v_prev.username,
      'fecha', v_prev.scanned_at
    );
  end if;

  if v_label.status <> 'closed' then
    return jsonb_build_object('resultado', 'ingreso_abierto', 'pallet_numero', v_label.pallet_number);
  end if;

  begin
    insert into public.despacho_etiquetas (despacho_id, pallet_label_id, scanned_by)
    values (p_despacho_id, v_label.id, v_uid);
  exception when unique_violation then
    -- otro operario la despacho justo entre la consulta y el insert
    select d.numero, pr.username, de.scanned_at into v_prev
    from public.despacho_etiquetas de
    join public.despachos d on d.id = de.despacho_id
    join public.profiles pr on pr.id = de.scanned_by
    where de.pallet_label_id = v_label.id;

    return jsonb_build_object(
      'resultado', 'ya_despachada',
      'despacho_numero', v_prev.numero,
      'operario', v_prev.username,
      'fecha', v_prev.scanned_at
    );
  end;

  return jsonb_build_object('resultado', 'ok');
end;
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.despachos enable row level security;
alter table public.despacho_etiquetas enable row level security;

create policy despachos_select_own on public.despachos
  for select using (opened_by = auth.uid());

create policy despachos_insert_own on public.despachos
  for insert with check (opened_by = auth.uid());

create policy despachos_update_own on public.despachos
  for update using (opened_by = auth.uid()) with check (opened_by = auth.uid());

create policy despachos_select_all_for_staff on public.despachos
  for select using (public.current_role() in ('admin', 'supervisor'));

create policy despacho_etiquetas_select_own on public.despacho_etiquetas
  for select using (
    exists (
      select 1 from public.despachos d
      where d.id = despacho_id and d.opened_by = auth.uid()
    )
  );

create policy despacho_etiquetas_select_all_for_staff on public.despacho_etiquetas
  for select using (public.current_role() in ('admin', 'supervisor'));

-- Las cajas solo entran por despachar_etiqueta(): no hay policy de insert.

-- ============================================================
-- GRANTS (las claves nuevas de Supabase no los traen por defecto)
-- ============================================================
grant select, insert, update on public.despachos to authenticated;
grant select, insert, update, delete on public.despachos to service_role;

grant select on public.despacho_etiquetas to authenticated;
grant select, insert, update, delete on public.despacho_etiquetas to service_role;

revoke all on function public.despachar_etiqueta(uuid, text) from public, anon;
grant execute on function public.despachar_etiqueta(uuid, text) to authenticated, service_role;
