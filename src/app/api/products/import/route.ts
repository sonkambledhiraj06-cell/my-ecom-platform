import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createImportJob, createImportJobItem } from "@/lib/import/db";
import * as XLSX from "xlsx";
import type { ProductRow } from "@/lib/import/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Excel file is empty" }, { status: 400 });
    }

    const uploadedImageUrls = await uploadImages(formData, user.id, supabase);

    const job = await createImportJob(user.id, rows.length);

    const productRows: ProductRow[] = rows.map((row, index) => ({
      sku: String(row.sku ?? row.SKU ?? `SKU-${index + 1}`),
      name: String(row.name ?? row.product_name ?? row.Product ?? `Product ${index + 1}`),
      category: row.category ? String(row.category) : undefined,
      price: row.price ? Number(row.price) : undefined,
      cogs: row.cogs ? Number(row.cogs) : undefined,
      stock: row.stock ? Number(row.stock) : undefined,
      description: row.description ? String(row.description) : undefined,
    }));

    const imageFields = ["image", "images", "image_url", "image_urls", "photo", "photos"];

    for (const row of productRows) {
      const imageUrls: string[] = [];

      for (const field of imageFields) {
        const value = (rows[productRows.indexOf(row)] as Record<string, unknown>)?.[field];
        if (typeof value === "string" && value.trim()) {
          imageUrls.push(value.trim());
        } else if (Array.isArray(value)) {
          for (const url of value) {
            if (typeof url === "string" && url.trim()) {
              imageUrls.push(url.trim());
            }
          }
        }
      }

      const rowIndex = productRows.indexOf(row);
      for (let imgIdx = 0; imgIdx < 10; imgIdx++) {
        const uploaded = uploadedImageUrls.get(`${rowIndex}_${imgIdx}`);
        if (uploaded) imageUrls.push(uploaded);
      }

      await createImportJobItem(job.id, {
        sku: row.sku,
        product_name: row.name,
        filename: file.name,
        image_urls: imageUrls,
        status: "queued",
        error: null,
        matched_product_id: null,
        created_product_id: null,
      });
    }

    return NextResponse.json({ jobId: job.id, totalItems: job.total_items });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 },
    );
  }
}

async function uploadImages(
  formData: FormData,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Map<string, string>> {
  const uploadedUrls = new Map<string, string>();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.type.startsWith("image/")) {
      try {
        const filePath = `imports/${userId}/${Date.now()}_${value.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(filePath, value, { contentType: value.type, upsert: true });

        if (error) {
          console.error(`Failed to upload ${value.name}:`, error);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        if (publicData?.publicUrl) {
          uploadedUrls.set(key, publicData.publicUrl);
        }
      } catch {
        console.error(`Upload error for ${value.name}`);
      }
    }
  }

  return uploadedUrls;
}
