-- Deleting a pallet (admin data-correction action) should remove its
-- labels too, instead of failing on the foreign key or leaving orphans.
alter table public.pallet_labels
  drop constraint pallet_labels_pallet_id_fkey,
  add constraint pallet_labels_pallet_id_fkey
    foreign key (pallet_id) references public.pallets(id) on delete cascade;
