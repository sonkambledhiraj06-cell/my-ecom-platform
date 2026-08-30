-- AID AI Business Operating System - Product Schema Upgrade
-- Run this in Supabase SQL Editor to add AI/Marketing fields and demo data support

-- 1. Add new columns to products table for AI Business OS
alter table public.products
  add column if not exists brand text,
  add column if not exists mrp numeric(12, 2) default 0,
  add column if not exists discount numeric(5, 2) default 0,
  add column if not exists features jsonb default '[]'::jsonb,
  add column if not exists benefits jsonb default '[]'::jsonb,
  add column if not exists usp text,
  add column if not exists status text default 'active',
  add column if not exists is_demo boolean default false,
  add column if not exists user_id uuid references auth.users(id);

-- 2. Add indexes for performance
create index if not exists idx_products_is_demo on public.products(is_demo);
create index if not exists idx_products_user_id on public.products(user_id);
create index if not exists idx_products_status on public.products(status);

-- 3. Update RLS policies to support user-scoped access
drop policy if exists "Products are readable by authenticated users" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Users can view all products"
  on public.products for select to authenticated using (true);

create policy "Users can insert own products"
  on public.products for insert to authenticated with check (
    user_id is null or user_id = auth.uid()
  );

create policy "Users can update own products"
  on public.products for update to authenticated using (
    user_id is null or user_id = auth.uid()
  ) with check (
    user_id is null or user_id = auth.uid()
  );

create policy "Users can delete own products"
  on public.products for delete to authenticated using (
    user_id is null or user_id = auth.uid()
  );

-- 4. Keep public storefront access for active products
drop policy if exists "Public can view products" on public.products;
create policy "Public can view active products"
  on public.products for select to anon, authenticated using (
    status = 'active' or user_id = auth.uid()
  );

-- 5. Create demo_products_seeds table to track demo data
create table if not exists public.demo_seeds (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  seed_key text not null unique,
  created_at timestamptz default now()
);

create index if not exists idx_demo_seeds_product_id on public.demo_seeds(product_id);
create index if not exists idx_demo_seeds_seed_key on public.demo_seeds(seed_key);

alter table public.demo_seeds enable row level security;

drop policy if exists "Users can manage demo seeds" on public.demo_seeds;
create policy "Users can manage demo seeds"
  on public.demo_seeds for all to authenticated using (true) with check (true);

-- 6. Add user_id to existing products (assign to first admin or leave null for backwards compatibility)
-- Existing products will have user_id = null and remain accessible to all authenticated users
