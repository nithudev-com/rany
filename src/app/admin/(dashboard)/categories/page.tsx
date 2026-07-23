import { prisma } from "@/lib/prisma";
import CategoryTreeManager, { CategoryData } from "./CategoryTreeManager";

export const dynamic = 'force-dynamic';


export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' }
    ],
    include: { 
      _count: { select: { products: true } },
    }
  });

  // Convert BigInt IDs to string for the client component
  const formattedCategories: CategoryData[] = categories.map(c => ({
    id: c.id.toString(),
    name: c.name,
    slug: c.slug,
    parentId: c.parentId ? c.parentId.toString() : null,
    sortOrder: c.sortOrder,
    showOnHome: c.showOnHome,
    _count: { products: c._count.products }
  }));

  return <CategoryTreeManager initialCategories={formattedCategories} />;
}
