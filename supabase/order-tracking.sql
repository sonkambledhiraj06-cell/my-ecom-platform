-- Order tracking setup for Supabase SQL Editor.
-- Run once before using the order tracking screen.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text,
  amount numeric(12, 2) not null default 0,
  payment_status text not null default 'pending',
  status text not null default 'received',
  source text,
  carrier text,
  tracking_number text,
  tracking_url text,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists carrier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists tracking_url text;
alter table public.orders alter column carrier drop not null;
alter table public.orders alter column tracking_number drop not null;
alter table public.orders alter column tracking_url drop not null;

alter table public.orders enable row level security;

drop policy if exists "Authenticated users can read orders" on public.orders;
drop policy if exists "Authenticated users can insert orders" on public.orders;
drop policy if exists "Authenticated users can update orders" on public.orders;
drop policy if exists "Authenticated users can delete orders" on public.orders;

create policy "Authenticated users can read orders"
  on public.orders for select to authenticated using (true);

create policy "Authenticated users can insert orders"
  on public.orders for insert to authenticated with check (true);

create policy "Authenticated users can update orders"
  on public.orders for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete orders"
  on public.orders for delete to authenticated using (true);

-- Keep roles as text and sync a profile for new auth users.
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles alter column role type text using role::text;

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
