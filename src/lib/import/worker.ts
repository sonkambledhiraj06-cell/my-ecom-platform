import PQueue from "p-queue";
import { createWorkerClient } from "./worker-client";
import {
  getImportJob,
  updateImportJob,
  getImportJobItems,
  updateImportJobItem,
} from "./db";
import { processImage, urlToBuffer } from "./image-processing";
import { analyzeImageWithAI, generateMarketingContent } from "./ai-analysis";
import { smartMatch } from "./smart-matching";
import { generateVideoForProduct } from "./video-generation";

const BATCH_SIZE = 10;
const AI_CONCURRENCY = parseInt(process.env.AI_CONCURRENCY ?? "5", 10);
const VIDEO_CONCURRENCY_LIMIT = parseInt(process.env.VIDEO_CONCURRENCY ?? "3", 10);

export async function processImportJob(jobId: string): Promise<void> {
  const supabase = createWorkerClient();
  const job = await getImportJob(jobId);
  if (!job || job.status === "processing" || job.status === "completed") return;

  await updateImportJob(jobId, { status: "processing", current_stage: "parsing" });

  const items = await getImportJobItems(jobId);
  if (items.length === 0) {
    await updateImportJob(jobId, { status: "completed", current_stage: null });
    return;
  }

  const existingProducts = await fetchExistingProducts();
  const imageBuffers = new Map<string, Buffer>();

  const aiQueue = new PQueue({ concurrency: AI_CONCURRENCY });
  const videoQueue = new PQueue({ concurrency: VIDEO_CONCURRENCY_LIMIT });

  let processedCount = 0;
  let matchedCount = 0;
  let createdCount = 0;
  let failedCount = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    await updateImportJob(jobId, { current_stage: "matching" });

    const matchPromises = batch.map((item) =>
      aiQueue.add(async () => {
        try {
          await updateImportJobItem(item.id, { status: "matching" });

          const buffers: Buffer[] = [];
          for (const url of item.image_urls) {
            try {
              const buf = imageBuffers.get(url) ?? (await urlToBuffer(url));
              if (!imageBuffers.has(url)) imageBuffers.set(url, buf);
              buffers.push(buf);
            } catch {
              // Skip unreachable images
            }
          }

          const primaryBuffer = buffers[0];
          if (!primaryBuffer) {
            await updateImportJobItem(item.id, {
              status: "failed",
              error: "No accessible images",
            });
            return { success: false };
          }

          const processed = await processImage(primaryBuffer, "image/jpeg");
          const match = await smartMatch(
            item.sku ?? "",
            item.product_name ?? "",
            item.filename ?? "",
            item.image_urls,
            existingProducts,
            imageBuffers,
          );

          if (match.type !== "none" && match.productId) {
            await updateImportJobItem(item.id, {
              status: "completed",
              matched_product_id: match.productId,
            });
            return { success: true, matched: true };
          }

          await updateImportJobItem(item.id, { status: "creating" });

          const analysis = await analyzeImageWithAI(
            processed.buffer,
            processed.contentHash,
            { productName: item.product_name ?? undefined, sku: item.sku ?? undefined },
          );

          const marketingContent = await generateMarketingContent(
            item.product_name ?? "Unnamed Product",
            analysis,
          );

          const productData = {
            sku: item.sku ?? `SKU-${Date.now()}-${item.id.slice(0, 8)}`,
            name: item.product_name ?? "Unnamed Product",
            category: analysis.category,
            description: marketingContent.marketingCopy?.description ?? analysis.description,
            price: 0,
            cogs: 0,
            stock: 0,
          };

          const { data: newProduct, error: insertError } = await supabase
            .from("products")
            .insert({
              name: productData.name,
              sku: productData.sku,
              category: productData.category,
              description: productData.description,
              selling_price: productData.price,
              cost_cogs: productData.cogs,
              stock_level: productData.stock,
              image_url: item.image_urls[0] ?? null,
            })
            .select()
            .single();

          if (insertError || !newProduct) {
            await updateImportJobItem(item.id, {
              status: "failed",
              error: insertError?.message ?? "Failed to create product",
            });
            return { success: false };
          }

          existingProducts.push({
            id: newProduct.id,
            name: newProduct.name,
            sku: newProduct.sku,
            image_url: newProduct.image_url,
          });

          await updateImportJobItem(item.id, {
            status: "video",
            created_product_id: newProduct.id,
          });

          if (primaryBuffer) {
            videoQueue.add(async () => {
              try {
                await generateVideoForProduct(
                  newProduct.name,
                  newProduct.description ?? "",
                  primaryBuffer,
                  newProduct.id,
                  item.id,
                );
              } catch {
                // Video generation failed, product still created
              }
            });
          }

          return { success: true, created: true };
        } catch (error) {
          await updateImportJobItem(item.id, {
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return { success: false };
        }
      }),
    );

    const results = await Promise.allSettled(matchPromises);

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.matched) matchedCount++;
        if (result.value.created) createdCount++;
        if (!result.value.success) failedCount++;
      } else {
        failedCount++;
      }
      processedCount++;
    }

    await updateImportJob(jobId, {
      processed_items: processedCount,
      matched_items: matchedCount,
      created_items: createdCount,
      failed_items: failedCount,
    });
  }

  await videoQueue.onIdle();

  await updateImportJob(jobId, {
    status: "completed",
    current_stage: null,
    processed_items: items.length,
    matched_items: matchedCount,
    created_items: createdCount,
    failed_items: failedCount,
  });
}

async function fetchExistingProducts(): Promise<Array<{ id: string; name: string; sku: string; image_url: string | null }>> {
  const supabase = createWorkerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, image_url")
    .limit(10000);

  if (error) return [];
  return (data ?? []) as Array<{ id: string; name: string; sku: string; image_url: string | null }>;
}
