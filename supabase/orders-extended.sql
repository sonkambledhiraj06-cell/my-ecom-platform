-- Extended Order tracking schema for Supabase SQL Editor.
-- Run this script after the base order-tracking.sql to add new columns.
-- Adds customer email, order items JSON, payment reference, and notifications table.

-- Add email column for customer contact
alter table public.orders add column if not exists customer_email text;
alter table public.orders alter column customer_email drop not null;

-- Add order_items as JSONB for storing the cart items in the order
alter table public.orders add column if not exists order_items jsonb;
alter table public.orders alter column order_items drop not null;

-- Add shipping address
alter table public.orders add column if not exists shipping_address text;
alter table public.orders alter column shipping_address drop not null;

-- Add payment transaction reference (Razorpay payment ID)
alter table public.orders add column if not exists payment_id text;
alter table public.orders alter column payment_id drop not null;

-- Add source column for ad attribution (Meta, Google, Direct, etc.)
alter table public.orders add column if not exists source text default 'website';
alter table public.orders alter column source drop not null;

-- Create notifications table for tracking WhatsApp messages
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  customer_phone text,
  message text,
  channel text default 'whatsapp',
  status text default 'sent',
  sent_at timestamptz default now()
);

-- Enable RLS and add policies for notifications
alter table public.notifications enable row level security;

drop policy if exists "Authenticated users can read notifications" on public.notifications;
drop policy if exists "Authenticated users can insert notifications" on public.notifications;

create policy "Authenticated users can read notifications"
  on public.notifications for select to authenticated using (true);
create policy "Authenticated users can insert notifications"
  on public.notifications for insert to authenticated with check (true);

-- RLS policies for orders (already exists but ensure updated)
alter table public.orders enable row level security;

drop policy if exists "Authenticated users can read orders" on public.orders;
drop policy if exists "Authenticated users can insert orders" on public.orders;
drop policy if exists "Authenticated users can update orders" on public.orders;
drop policy if exists "Authenticated users can delete orders" on public.orders;

create policy "Authenticated users can read orders" on public.orders for select to authenticated using (true);
create policy "Authenticated users can insert orders" on public.orders for insert to authenticated with check (true);
create policy "Authenticated users can update orders" on public.orders for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete orders" on public.orders for delete to authenticated using (true);

-- Add order item tracking table for granular order-item management
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text,
  quantity integer,
  price numeric(12, 2),
  total numeric(12, 2)
);

alter table public.order_items enable row level security;
create policy "Authenticated users can read order items" on public.order_items for select to authenticated using (true);
create policy "Authenticated users can insert order items" on public.order_items for insert to authenticated with check (true);
create policy "Authenticated users can update order items" on public.order_items for update to authenticated using (true) with check (true);
