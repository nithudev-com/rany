import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteProductsFromSearch } from "@/lib/search";

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Optional: First, get all product IDs from this batch to delete from Meilisearch
    const productsInBatch = await prisma.product.findMany({
      where: { importBatchId: id },
      select: { id: true }
    });
    const productIds = productsInBatch.map(p => p.id.toString());
    
    if (productIds.length > 0) {
      await deleteProductsFromSearch(productIds);
    }

    // Because we set onDelete: Cascade on Product.importBatchId in Prisma schema,
    // deleting the batch will automatically delete all associated products in the DB.
    await prisma.productImportBatch.delete({
      where: { id }
    });

    // Clear caches so the storefront updates
    revalidateTag("products");
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch" },
      { status: 500 }
    );
  }
}
