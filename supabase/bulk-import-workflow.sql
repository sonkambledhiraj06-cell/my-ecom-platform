-- Bulk Product Import & AI Workflow Schema
-- Run this in Supabase SQL Editor to enable the optimized import pipeline.

-- 1. Import jobs table
create table if not exists public.import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  status text not null default 'queued',
  total_items int not null default 0,
  processed_items int not null default 0,
  matched_items int not null default 0,
  created_items int not null default 0,
  failed_items int not null default 0,
  current_stage text,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Import job items table
create table if not exists public.import_job_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.import_jobs(id) on delete cascade not null,
  sku text,
  product_name text,
  filename text,
  image_urls jsonb default '[]'::jsonb,
  status text not null default 'queued',
  matched_product_id uuid references public.products(id),
  created_product_id uuid references public.products(id),
  error text,
  retry_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Image analysis cache (content hash -> analysis)
create table if not exists public.image_analysis_cache (
  content_hash text primary key,
  analysis jsonb not null,
  created_at timestamptz default now()
);

-- 4. Product videos table
create table if not exists public.product_videos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  job_item_id uuid references public.import_job_items(id) on delete cascade,
  status text not null default 'queued',
  video_url text,
  thumbnail_url text,
  prompt text,
  error text,
  retry_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_import_jobs_user_id on public.import_jobs(user_id);
create index if not exists idx_import_jobs_status on public.import_jobs(status);
create index if not exists idx_import_job_items_job_id on public.import_job_items(job_id);
create index if not exists idx_import_job_items_status on public.import_job_items(status);
create index if not exists idx_product_videos_product_id on public.product_videos(product_id);
create index if not exists idx_product_videos_status on public.product_videos(status);

-- Storage bucket for product images (run in Supabase Dashboard > Storage)
-- Create a bucket named "product-images" with public access enabled.
-- The import API will upload images to: product-images/imports/{user_id}/{timestamp}_{filename}

-- RLS policies
alter table public.import_jobs enable row level security;
alter table public.import_job_items enable row level security;
alter table public.image_analysis_cache enable row level security;
alter table public.product_videos enable row level security;

drop policy if exists "Users manage own import jobs" on public.import_jobs;
create policy "Users manage own import jobs"
  on public.import_jobs for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view own import job items" on public.import_job_items;
create policy "Users view own import job items"
  on public.import_job_items for select to authenticated using (
    exists (select 1 from public.import_jobs where import_jobs.id = import_job_items.job_id and import_jobs.user_id = auth.uid())
  );
create policy "Users insert own import job items"
  on public.import_job_items for insert to authenticated with check (
    exists (select 1 from public.import_jobs where import_jobs.id = import_job_items.job_id and import_jobs.user_id = auth.uid())
  );
create policy "Users update own import job items"
  on public.import_job_items for update to authenticated using (
    exists (select 1 from public.import_jobs where import_jobs.id = import_job_items.job_id and import_jobs.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.import_jobs where import_jobs.id = import_job_items.job_id and import_jobs.user_id = auth.uid())
  );

drop policy if exists "Authenticated read image cache" on public.image_analysis_cache;
create policy "Authenticated read image cache"
  on public.image_analysis_cache for select to authenticated using (true);
create policy "Authenticated insert image cache"
  on public.image_analysis_cache for insert to authenticated with check (true);
create policy "Authenticated update image cache"
  on public.image_analysis_cache for update to authenticated using (true) with check (true);

drop policy if exists "Users manage own product videos" on public.product_videos;
create policy "Users manage own product videos"
  on public.product_videos for all to authenticated using (
    exists (select 1 from public.products where products.id = product_videos.product_id and products.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.products where products.id = product_videos.product_id and products.user_id = auth.uid())
  );
