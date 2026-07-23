import { prisma } from "@/lib/prisma";
import NewCategoryForm from "./NewCategoryForm";

export const dynamic = 'force-dynamic';


export default async function NewCategoryPage() {
  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const safeCategories = allCategories.map(c => ({
    id: c.id.toString(),
    name: c.name
  }));

  return (
    <div>
      <NewCategoryForm allCategories={safeCategories} />
    </div>
  );
}
