import sharp from "sharp";
import crypto from "crypto";

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 200;
const ANALYSIS_WIDTH = 512;
const ANALYSIS_HEIGHT = 512;

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  width: number;
  height: number;
  contentHash: string;
  thumbnail: Buffer;
}

export async function processImage(buffer: Buffer, contentType: string): Promise<ProcessedImage> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");

  const thumbnail = await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    buffer,
    contentType,
    width,
    height,
    contentHash,
    thumbnail,
  };
}

export async function generateOptimizedAnalysisImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(ANALYSIS_WIDTH, ANALYSIS_HEIGHT, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}

export async function getImageMetadata(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    format: metadata.format,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
    channels: metadata.channels,
    size: buffer.length,
  };
}

export function computeContentHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = Buffer.from(reader.result as ArrayBuffer);
      resolve(buffer);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

export async function urlToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
