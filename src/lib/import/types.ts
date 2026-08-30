export type ImportJobStatus = "queued" | "processing" | "completed" | "failed";
export type ImportJobStage = "parsing" | "matching" | "creating" | "metadata" | "video" | null;
export type ImportItemStatus = "queued" | "parsing" | "matching" | "creating" | "metadata" | "video" | "completed" | "failed";
export type VideoStatus = "queued" | "processing" | "completed" | "failed";

export interface ImportJob {
  id: string;
  user_id: string;
  status: ImportJobStatus;
  total_items: number;
  processed_items: number;
  matched_items: number;
  created_items: number;
  failed_items: number;
  current_stage: ImportJobStage;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportJobItem {
  id: string;
  job_id: string;
  sku: string | null;
  product_name: string | null;
  filename: string | null;
  image_urls: string[];
  status: ImportItemStatus;
  matched_product_id: string | null;
  created_product_id: string | null;
  error: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface ImageAnalysisCache {
  content_hash: string;
  analysis: {
    description?: string;
    tags?: string[];
    colors?: string[];
    category?: string;
    confidence?: number;
  };
  created_at: string;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  job_item_id: string | null;
  status: VideoStatus;
  video_url: string | null;
  thumbnail_url: string | null;
  prompt: string | null;
  error: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  sku: string;
  name: string;
  category?: string;
  price?: number;
  cogs?: number;
  stock?: number;
  description?: string;
  images?: File[];
  imageUrls?: string[];
}

export interface MatchResult {
  type: "sku" | "filename" | "name" | "metadata" | "visual" | "ai" | "none";
  confidence: number;
  productId?: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
  };
}

export interface AnalysisResult {
  description: string;
  tags: string[];
  colors: string[];
  category: string;
  confidence: number;
  marketingCopy?: {
    headline: string;
    description: string;
    features: string[];
  };
}

export interface VideoGenerationResult {
  videoUrl: string;
  thumbnailUrl: string;
}
