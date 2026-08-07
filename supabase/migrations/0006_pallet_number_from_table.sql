-- pallet_number used to be a GENERATED ALWAYS AS IDENTITY column backed by
-- a sequence, which never rewinds after rows are deleted (by design, for
-- ordinary sequences). The business wants numbering to always reflect the
-- current contents of the table instead: after deleting pallets, the next
-- one created should reuse the freed-up number, computed from
-- MAX(pallet_number) over whatever rows currently exist (open or closed).
alter table public.pallets alter column pallet_number drop identity;

create or replace function public.assign_pallet_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.pallet_number is null then
    -- serializes concurrent inserts so two operarios starting a pallet
    -- at the same time can't compute the same "next" number
    lock table public.pallets in share row exclusive mode;
    select coalesce(max(pallet_number), 0) + 1 into new.pallet_number from public.pallets;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_pallet_number on public.pallets;
create trigger trg_assign_pallet_number
before insert on public.pallets
for each row
execute function public.assign_pallet_number();
