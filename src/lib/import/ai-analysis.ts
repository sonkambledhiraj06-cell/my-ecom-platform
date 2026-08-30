import OpenAI from "openai";
import { getImageAnalysis, setImageAnalysis } from "./db";
import { generateOptimizedAnalysisImage } from "./image-processing";
import type { AnalysisResult, MatchResult } from "./types";

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const AI_MODEL = process.env.OPENAI_AI_MODEL ?? "gpt-4o-mini";
const MAX_RETRIES = 2;

export async function analyzeImageWithAI(
  imageBuffer: Buffer,
  contentHash: string,
  context?: { productName?: string; sku?: string },
): Promise<AnalysisResult> {
  const cached = await getImageAnalysis(contentHash);
  if (cached) {
    return cached.analysis as AnalysisResult;
  }

  const optimizedBuffer = await generateOptimizedAnalysisImage(imageBuffer);
  const base64 = optimizedBuffer.toString("base64");
  const mimeType = "image/jpeg";

  const systemPrompt = `You are a product analysis AI. Analyze the product image and return a JSON object with:
- description: 1-2 sentence product description
- tags: array of 5-10 relevant product tags/keywords
- colors: array of dominant colors
- category: single product category (e.g., Electronics, Clothing, Home & Kitchen)
- confidence: 0.0-1.0 confidence score
- marketingCopy: optional object with headline, description (2-3 sentences), and features (array of 3-5 bullet points)

Return ONLY valid JSON, no markdown fences.`;

  const userPrompt = context?.productName
    ? `Analyze this product image. Context: name="${context.productName}", sku="${context.sku ?? ""}"`
    : "Analyze this product image and identify what it is.";

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await getOpenAIClient().chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "low" },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty AI response");

      const analysis = JSON.parse(content) as AnalysisResult;
      analysis.confidence = Math.max(0, Math.min(1, analysis.confidence ?? 0.8));

      await setImageAnalysis(contentHash, analysis);
      return analysis;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("AI analysis failed after retries");
}

export async function generateMarketingContent(
  productName: string,
  analysis: AnalysisResult,
): Promise<AnalysisResult> {
  if (analysis.marketingCopy) return analysis;

  const prompt = `Generate marketing copy for product "${productName}" based on this analysis:
- Description: ${analysis.description}
- Tags: ${analysis.tags.join(", ")}
- Category: ${analysis.category}

Return JSON with headline (max 60 chars), description (2-3 sentences), and features (3-5 bullet points).`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a marketing copywriter. Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const marketingCopy = JSON.parse(content);
      analysis.marketingCopy = marketingCopy;
    }
  } catch {
    // Non-critical: continue without marketing copy
  }

  return analysis;
}

export async function matchProductWithAI(
  imageBuffer: Buffer,
  contentHash: string,
  existingProducts: Array<{ id: string; name: string; sku: string; image_url: string | null }>,
): Promise<MatchResult> {
  const analysis = await analyzeImageWithAI(imageBuffer, contentHash);

  let bestMatch: { product: typeof existingProducts[0]; score: number } | null = null;

  for (const product of existingProducts) {
    let score = 0;

    const nameLower = product.name.toLowerCase();
    const analysisLower = analysis.description.toLowerCase();

    if (nameLower.includes(analysisLower.split(" ")[0]) || analysisLower.includes(nameLower)) {
      score += 0.3;
    }

    const commonTags = analysis.tags.filter((tag) => nameLower.includes(tag.toLowerCase()));
    score += commonTags.length * 0.1;

    if (product.image_url) {
      score += 0.05;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { product, score };
    }
  }

  if (bestMatch && bestMatch.score >= 0.3) {
    return {
      type: "ai",
      confidence: bestMatch.score,
      productId: bestMatch.product.id,
      product: bestMatch.product,
    };
  }

  return {
    type: "none",
    confidence: 0,
  };
}
