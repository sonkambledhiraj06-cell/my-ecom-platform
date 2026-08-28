-- Product categories setup for Supabase SQL Editor.
-- Run this script once. The category column remains optional.

alter table public.products
  add column if not exists category text;

alter table public.products
  alter column category drop not null;

alter table public.products enable row level security;

drop policy if exists "Products are readable by authenticated users" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Products are readable by authenticated users"
  on public.products for select to authenticated using (true);

create policy "Authenticated users can insert products"
  on public.products for insert to authenticated with check (true);

create policy "Authenticated users can update products"
  on public.products for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete products"
  on public.products for delete to authenticated using (true);

-- Keep profiles synchronized when a new auth user signs up.
alter table public.profiles
  add column if not exists role text default 'user';

alter table public.profiles
  alter column role type text using role::text;

alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
drop policy if exists "Authenticated users can update profiles" on public.profiles;
drop policy if exists "Authenticated users can insert profiles" on public.profiles;
drop policy if exists "Authenticated users can delete profiles" on public.profiles;

create policy "Authenticated users can read profiles"
  on public.profiles for select to authenticated using (true);

create policy "Authenticated users can update profiles"
  on public.profiles for update to authenticated using (true) with check (true);

create policy "Authenticated users can insert profiles"
  on public.profiles for insert to authenticated with check (true);

create policy "Authenticated users can delete profiles"
  on public.profiles for delete to authenticated using (true);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
