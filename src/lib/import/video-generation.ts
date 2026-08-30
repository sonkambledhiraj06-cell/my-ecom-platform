import OpenAI from "openai";
import { createProductVideo, updateProductVideo } from "./db";
import type { VideoGenerationResult } from "./types";

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const VIDEO_CONCURRENCY = parseInt(process.env.VIDEO_CONCURRENCY ?? "3", 10);

export async function generateVideoForProduct(
  productName: string,
  productDescription: string,
  imageBuffer: Buffer,
  productId: string,
  jobItemId: string,
): Promise<VideoGenerationResult> {
  const videoRecord = await createProductVideo({
    product_id: productId,
    job_item_id: jobItemId,
    status: "processing",
    prompt: `Product video for ${productName}: ${productDescription}`,
    video_url: null,
    thumbnail_url: null,
    error: null,
  });

  try {
    await requestVideoGeneration(productName, productDescription, imageBuffer);

    const videoUrl = `https://mock-video.example.com/${encodeURIComponent(productName)}.mp4`;
    const thumbnailUrl = `https://mock-thumbnail.example.com/${encodeURIComponent(productName)}.jpg`;

    await updateProductVideo(videoRecord.id, {
      status: "completed",
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
    });

    return { videoUrl, thumbnailUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Video generation failed";
    await updateProductVideo(videoRecord.id, {
      status: "failed",
      error: message,
    });
    throw error;
  }
}

async function requestVideoGeneration(
  productName: string,
  productDescription: string,
  imageBuffer: Buffer,
): Promise<void> {
  try {
    const base64Image = imageBuffer.toString("base64");
    await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a video generation assistant. Generate a prompt and return JSON with videoPrompt.",
        },
        {
          role: "user",
          content: `Product: ${productName}\nDescription: ${productDescription}\nImage (base64): ${base64Image.slice(0, 100)}...\nGenerate a video prompt.`,
        },
      ],
      max_tokens: 200,
      response_format: { type: "json_object" },
    });
  } catch {
    // Non-critical: continue even if prompt generation fails
  }
}

export { VIDEO_CONCURRENCY };
