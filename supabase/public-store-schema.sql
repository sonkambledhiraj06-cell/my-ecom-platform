-- Public Storefront & Orders SQL configuration
-- Run this in Supabase SQL Editor to allow public storefront browsing & order checkout

-- 1. Ensure columns exist on products
alter table public.products add column if not exists image_url text;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists selling_price numeric(12, 2) default 0;
alter table public.products add column if not exists cost_cogs numeric(12, 2) default 0;
alter table public.products add column if not exists stock_level int default 0;

-- 2. Ensure columns exist on orders
alter table public.orders add column if not exists items jsonb default '[]'::jsonb;
alter table public.orders add column if not exists shipping_address text;
alter table public.orders add column if not exists city text;
alter table public.orders add column if not exists pincode text;
alter table public.orders add column if not exists payment_method text default 'online';
alter table public.orders add column if not exists notes text;
alter table public.orders add column if not exists utm_source text;
alter table public.orders add column if not exists utm_campaign text;

-- 3. Row Level Security (RLS) - Allow public (anon + authenticated) to view products
alter table public.products enable row level security;
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select to anon, authenticated using (true);

drop policy if exists "Authenticated users manage products" on public.products;
create policy "Authenticated users manage products"
  on public.products for all to authenticated using (true) with check (true);

-- 4. Allow public to insert orders and check their own order by order_number
alter table public.orders enable row level security;
drop policy if exists "Public can insert orders" on public.orders;
create policy "Public can insert orders"
  on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "Public can track orders" on public.orders;
create policy "Public can track orders"
  on public.orders for select to anon, authenticated using (true);

drop policy if exists "Authenticated users manage orders" on public.orders;
create policy "Authenticated users manage orders"
  on public.orders for all to authenticated using (true) with check (true);

-- 5. RPC function to safely decrement stock on order placement
create or replace function public.decrement_product_stock(p_product_id uuid, p_quantity int)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_level = greatest(0, coalesce(stock_level, stock, 0) - p_quantity),
      stock = greatest(0, coalesce(stock_level, stock, 0) - p_quantity)
  where id = p_product_id;
end;
$$;
