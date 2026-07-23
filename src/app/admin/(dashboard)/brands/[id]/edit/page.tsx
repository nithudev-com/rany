import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditBrandForm from './EditBrandForm';

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const brand = await prisma.brand.findUnique({
    where: { id: String(id) },
  });

  if (!brand) {
    notFound();
  }

  const serializedBrand = {
    ...brand,
    id: brand.id.toString(),
  };

  return (
    <div>
      <EditBrandForm brand={serializedBrand as any} />
    </div>
  );
}
