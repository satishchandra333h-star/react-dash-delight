-- PawHome pet adoption schema + CRUD permissions

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'pet_species'
      and n.nspname = 'public'
  ) then
    create type public.pet_species as enum ('dog', 'cat', 'rabbit', 'bird', 'other');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'pet_status'
      and n.nspname = 'public'
  ) then
    create type public.pet_status as enum ('available', 'pending', 'adopted');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'adoption_status'
      and n.nspname = 'public'
  ) then
    create type public.adoption_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  species public.pet_species not null default 'dog',
  breed text,
  age_months integer not null default 12,
  gender text not null default 'unknown',
  description text,
  image_url text,
  status public.pet_status not null default 'available',
  shelter_location text,
  weight_kg numeric(5,2),
  is_vaccinated boolean default false,
  is_neutered boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.adoption_requests (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  requester_name text not null,
  requester_email text not null,
  requester_phone text,
  message text,
  status public.adoption_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pets_created_at on public.pets (created_at desc);
create index if not exists idx_pets_species on public.pets (species);
create index if not exists idx_requests_created_at on public.adoption_requests (created_at desc);
create index if not exists idx_requests_status on public.adoption_requests (status);

alter table public.pets enable row level security;
alter table public.adoption_requests enable row level security;

drop policy if exists "Anyone can view pets" on public.pets;
drop policy if exists "Anyone can insert pets" on public.pets;
drop policy if exists "Anyone can update pets" on public.pets;
drop policy if exists "Anyone can delete pets" on public.pets;

create policy "Anyone can view pets"
on public.pets
for select
using (true);

create policy "Anyone can insert pets"
on public.pets
for insert
with check (true);

create policy "Anyone can update pets"
on public.pets
for update
using (true)
with check (true);

create policy "Anyone can delete pets"
on public.pets
for delete
using (true);

drop policy if exists "Anyone can view adoption requests" on public.adoption_requests;
drop policy if exists "Anyone can submit adoption requests" on public.adoption_requests;
drop policy if exists "Anyone can update adoption requests" on public.adoption_requests;
drop policy if exists "Anyone can delete adoption requests" on public.adoption_requests;

create policy "Anyone can view adoption requests"
on public.adoption_requests
for select
using (true);

create policy "Anyone can submit adoption requests"
on public.adoption_requests
for insert
with check (true);

create policy "Anyone can update adoption requests"
on public.adoption_requests
for update
using (true)
with check (true);

create policy "Anyone can delete adoption requests"
on public.adoption_requests
for delete
using (true);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_pets_updated_at on public.pets;
create trigger update_pets_updated_at
before update on public.pets
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_adoption_requests_updated_at on public.adoption_requests;
create trigger update_adoption_requests_updated_at
before update on public.adoption_requests
for each row
execute function public.update_updated_at_column();

insert into public.pets (
  name,
  species,
  breed,
  age_months,
  gender,
  description,
  image_url,
  status,
  shelter_location,
  weight_kg,
  is_vaccinated,
  is_neutered
)
select *
from (
  values
    (
      'Max',
      'dog'::public.pet_species,
      'Labrador Retriever',
      30,
      'male',
      'Friendly and playful, great with kids.',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      'available'::public.pet_status,
      'Downtown Shelter',
      24.5,
      true,
      true
    ),
    (
      'Luna',
      'cat'::public.pet_species,
      'Domestic Shorthair',
      18,
      'female',
      'Calm indoor cat who loves quiet corners.',
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=80',
      'available'::public.pet_status,
      'North Branch',
      4.2,
      true,
      false
    ),
    (
      'Coco',
      'rabbit'::public.pet_species,
      'Holland Lop',
      10,
      'female',
      'Gentle rabbit, comfortable around families.',
      'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&q=80',
      'pending'::public.pet_status,
      'East Care Center',
      1.7,
      true,
      false
    )
) as seed (
  name,
  species,
  breed,
  age_months,
  gender,
  description,
  image_url,
  status,
  shelter_location,
  weight_kg,
  is_vaccinated,
  is_neutered
)
where not exists (select 1 from public.pets);
