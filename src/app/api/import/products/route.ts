import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createImportBatch, parseProductCsv, processImportBatch } from "@/services/import-products";
import { getProductImportQueue } from "@/lib/import-queue";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const priceTiersStr = formData.get("priceTiers") as string | null;
    const updateMode = formData.get("updateMode") as string || "FULL";
    let priceTiers = null;
    if (priceTiersStr) {
      try { priceTiers = JSON.parse(priceTiersStr); } catch (e) {}
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const csvText = await file.text();
    const rows = parseProductCsv(csvText);
    const batchId = await createImportBatch(file.name, rows, priceTiers, updateMode);
    const queue = getProductImportQueue();
    if (queue) {
      await queue.add("product-import" as any, { batchId } as any, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
      return NextResponse.json({ ok: true, mode: "queued", batchId, totalRows: rows.length });
    }

    // Local fallback: process immediately if Redis/BullMQ is not configured.
    // For 2 lakh products, use the worker instead.
    const result = await processImportBatch(batchId);
    revalidateTag("products");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true, mode: "sync", batchId, totalRows: rows.length, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 }
    );
  }
}
