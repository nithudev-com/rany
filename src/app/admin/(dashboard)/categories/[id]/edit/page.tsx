import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditCategoryForm from './EditCategoryForm';

export const dynamic = 'force-dynamic';

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id: String(id) },
  });

  if (!category) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const serializedCategory = {
    ...category,
    id: category.id.toString(),
    parentId: category.parentId?.toString(),
  };

  const safeCategories = allCategories
    .filter(c => c.id !== category.id)
    .map(c => ({ id: c.id.toString(), name: c.name }));

  return (
    <div>
      <EditCategoryForm category={serializedCategory as any} allCategories={safeCategories} />
    </div>
  );
}
