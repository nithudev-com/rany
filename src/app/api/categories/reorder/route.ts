import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // items should be an array of { id: string | number, parentId: string | number | null, sortOrder: number }
    // Execute all updates in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.category.update({
          where: { id: String(item.id) },
          data: {
            parentId: item.parentId ? String(item.parentId) : null,
            sortOrder: item.sortOrder,
          },
        })
      )
    );

    // Revalidate frontend caches to reflect the new hierarchy
    revalidateTag("categories");
    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({ ok: true, message: "Categories reordered successfully" });
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 });
  }
}
