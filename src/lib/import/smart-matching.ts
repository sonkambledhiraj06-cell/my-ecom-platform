import { getImageAnalysis } from "./db";
import { computeContentHash, urlToBuffer } from "./image-processing";
import { matchProductWithAI } from "./ai-analysis";
import type { MatchResult } from "./types";

export async function smartMatch(
  sku: string,
  productName: string,
  filename: string,
  imageUrls: string[],
  existingProducts: Array<{ id: string; name: string; sku: string; image_url: string | null }>,
  imageBuffers: Map<string, Buffer>,
  aiMatchFn?: (buffer: Buffer, contentHash: string, products: typeof existingProducts) => Promise<MatchResult>,
): Promise<MatchResult> {
  const normalizedSku = sku.trim().toLowerCase();
  const normalizedName = productName.trim().toLowerCase();
  const normalizedFilename = filename.trim().toLowerCase();

  const skuMatch = existingProducts.find((p) => p.sku.toLowerCase() === normalizedSku);
  if (skuMatch) {
    return {
      type: "sku",
      confidence: 1.0,
      productId: skuMatch.id,
      product: skuMatch,
    };
  }

  const filenameSku = extractSkuFromFilename(normalizedFilename);
  if (filenameSku) {
    const filenameMatch = existingProducts.find((p) => p.sku.toLowerCase() === filenameSku);
    if (filenameMatch) {
      return {
        type: "filename",
        confidence: 0.95,
        productId: filenameMatch.id,
        product: filenameMatch,
      };
    }
  }

  const nameMatches = existingProducts.filter((p) => {
    const pName = p.name.toLowerCase();
    return (
      pName.includes(normalizedName) ||
      normalizedName.includes(pName) ||
      levenshteinDistance(normalizedName, pName) <= Math.max(3, Math.floor(normalizedName.length * 0.2))
    );
  });

  if (nameMatches.length === 1) {
    return {
      type: "name",
      confidence: 0.8,
      productId: nameMatches[0].id,
      product: nameMatches[0],
    };
  }

  for (const imageUrl of imageUrls) {
    try {
      const buffer = imageBuffers.get(imageUrl) ?? (await urlToBuffer(imageUrl));
      imageBuffers.set(imageUrl, buffer);
      const contentHash = computeContentHash(buffer);

      const cachedAnalysis = await getImageAnalysis(contentHash);
      if (cachedAnalysis) {
        const visualMatch = existingProducts.find((p) => {
          if (!p.image_url) return false;
          return p.image_url === imageUrl;
        });

        if (visualMatch) {
          return {
            type: "visual",
            confidence: 0.9,
            productId: visualMatch.id,
            product: visualMatch,
          };
        }
      }
    } catch {
      // Skip failed image fetches
    }
  }

  if (imageUrls.length > 0) {
    try {
      const buffer = imageBuffers.get(imageUrls[0]) ?? (await urlToBuffer(imageUrls[0]));
      imageBuffers.set(imageUrls[0], buffer);
      const aiMatch = aiMatchFn
        ? await aiMatchFn(buffer, computeContentHash(buffer), existingProducts)
        : await matchProductWithAI(buffer, computeContentHash(buffer), existingProducts);
      if (aiMatch.type !== "none") {
        return aiMatch;
      }
    } catch {
      // AI matching failed, fall through
    }
  }

  return {
    type: "none",
    confidence: 0,
  };
}

function extractSkuFromFilename(filename: string): string | null {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const skuPatterns = [
    /^([a-z]{2,}-\d+)/i,
    /^(\d{3,})/,
    /([a-z]{2,}\d{3,})/i,
  ];

  for (const pattern of skuPatterns) {
    const match = withoutExt.match(pattern);
    if (match) return match[1].toLowerCase();
  }

  return withoutExt.toLowerCase();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    Array.from({ length: a.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}
