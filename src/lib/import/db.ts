import { createClient } from "@/lib/supabase/client";
import type { ImportJob, ImportJobItem, ImageAnalysisCache, ProductVideo } from "./types";

const supabase = createClient();

export async function createImportJob(userId: string, totalItems: number): Promise<ImportJob> {
  const { data, error } = await supabase
    .from("import_jobs")
    .insert({
      user_id: userId,
      total_items: totalItems,
      status: "queued",
    })
    .select()
    .single();

  if (error) throw error;
  return data as ImportJob;
}

export async function getImportJob(jobId: string): Promise<ImportJob | null> {
  const { data, error } = await supabase
    .from("import_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) return null;
  return data as ImportJob;
}

export async function updateImportJob(
  jobId: string,
  updates: Partial<ImportJob>,
): Promise<void> {
  const { error } = await supabase
    .from("import_jobs")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (error) throw error;
}

export async function createImportJobItem(
  jobId: string,
  item: Omit<ImportJobItem, "id" | "job_id" | "created_at" | "updated_at" | "retry_count">,
): Promise<ImportJobItem> {
  const { data, error } = await supabase
    .from("import_job_items")
    .insert({
      ...item,
      job_id: jobId,
      retry_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ImportJobItem;
}

export async function getImportJobItems(jobId: string): Promise<ImportJobItem[]> {
  const { data, error } = await supabase
    .from("import_job_items")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) return [];
  return data as ImportJobItem[];
}

export async function updateImportJobItem(
  itemId: string,
  updates: Partial<ImportJobItem>,
): Promise<void> {
  const { error } = await supabase
    .from("import_job_items")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", itemId);

  if (error) throw error;
}

export async function incrementJobItemRetry(itemId: string): Promise<number> {
  const { data, error } = await supabase
    .from("import_job_items")
    .select("retry_count")
    .eq("id", itemId)
    .single();

  if (error || !data) throw error ?? new Error("Failed to fetch retry count");

  const newCount = (data as { retry_count: number }).retry_count + 1;

  const { error: updateError } = await supabase
    .from("import_job_items")
    .update({ retry_count: newCount })
    .eq("id", itemId);

  if (updateError) throw updateError;
  return newCount;
}

export async function getImageAnalysis(contentHash: string): Promise<ImageAnalysisCache | null> {
  const { data, error } = await supabase
    .from("image_analysis_cache")
    .select("*")
    .eq("content_hash", contentHash)
    .single();

  if (error) return null;
  return data as ImageAnalysisCache;
}

export async function setImageAnalysis(
  contentHash: string,
  analysis: ImageAnalysisCache["analysis"],
): Promise<void> {
  const { error } = await supabase
    .from("image_analysis_cache")
    .upsert({
      content_hash: contentHash,
      analysis,
      created_at: new Date().toISOString(),
    });

  if (error) throw error;
}

export async function createProductVideo(video: Omit<ProductVideo, "id" | "created_at" | "updated_at" | "retry_count">): Promise<ProductVideo> {
  const { data, error } = await supabase
    .from("product_videos")
    .insert({ ...video, retry_count: 0 })
    .select()
    .single();

  if (error) throw error;
  return data as ProductVideo;
}

export async function updateProductVideo(
  videoId: string,
  updates: Partial<ProductVideo>,
): Promise<void> {
  const { error } = await supabase
    .from("product_videos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", videoId);

  if (error) throw error;
}

export async function getProductVideos(productId: string): Promise<ProductVideo[]> {
  const { data, error } = await supabase
    .from("product_videos")
    .select("*")
    .eq("product_id", productId);

  if (error) return [];
  return data as ProductVideo[];
}

export async function getQueuedVideos(limit: number = 50): Promise<ProductVideo[]> {
  const { data, error } = await supabase
    .from("product_videos")
    .select("*")
    .eq("status", "queued")
    .limit(limit);

  if (error) return [];
  return data as ProductVideo[];
}
