-- Dashboard analytics and CSV export setup.
-- Analytics reads orders and products; no new required columns are introduced.

alter table public.orders enable row level security;
alter table public.products enable row level security;

 drop policy if exists "Authenticated users can read orders" on public.orders;
 drop policy if exists "Authenticated users can insert orders" on public.orders;
 drop policy if exists "Authenticated users can update orders" on public.orders;
 drop policy if exists "Authenticated users can delete orders" on public.orders;

create policy "Authenticated users can read orders" on public.orders for select to authenticated using (true);
create policy "Authenticated users can insert orders" on public.orders for insert to authenticated with check (true);
create policy "Authenticated users can update orders" on public.orders for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete orders" on public.orders for delete to authenticated using (true);

 drop policy if exists "Authenticated users can read products" on public.products;
 drop policy if exists "Authenticated users can insert products" on public.products;
 drop policy if exists "Authenticated users can update products" on public.products;
 drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Authenticated users can read products" on public.products for select to authenticated using (true);
create policy "Authenticated users can insert products" on public.products for insert to authenticated with check (true);
create policy "Authenticated users can update products" on public.products for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete products" on public.products for delete to authenticated using (true);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles alter column role type text using role::text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
