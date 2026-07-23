import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditProductForm from './EditProductForm';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: String(id) },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' }
      },
      variants: true
    }
  });

  if (!product) {
    notFound();
  }

  // We need to serialize the product because BigInt cannot be passed to Client Components natively via props
  const serializedProduct = {
    ...product,
    id: product.id.toString(),
    categoryId: product.categoryId?.toString(),
    brandId: product.brandId?.toString(),
    basePrice: Number(product.basePrice),
    salePrice: product.salePrice ? Number(product.salePrice) : null,
    images: product.images?.map(img => ({
      ...img,
      id: img.id.toString(),
      productId: img.productId.toString(),
    })),
    variants: product.variants?.map(v => ({
      ...v,
      id: v.id.toString(),
      productId: v.productId.toString(),
      price: Number(v.price),
      salePrice: v.salePrice ? Number(v.salePrice) : null,
    }))
  };

  return (
    <div>
      <EditProductForm product={serializedProduct as any} />
    </div>
  );
}
