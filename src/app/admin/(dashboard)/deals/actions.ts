'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAdminProductsForDeals() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        mainImage: true,
        basePrice: true,
        salePrice: true,
        saleEndDate: true,
        status: true
      },
      orderBy: [
        { salePrice: 'asc' }, // Deals first (since nulls will probably go last depending on Prisma, but let's just order by title for simplicity)
        { title: 'asc' }
      ]
    });

    // In Prisma, nulls might appear first or last. Let's sort them in memory so deals are at the top.
    const sorted = products.sort((a, b) => {
      if (a.salePrice && !b.salePrice) return -1;
      if (!a.salePrice && b.salePrice) return 1;
      return 0;
    });

    return {
      success: true,
      products: sorted.map(p => ({
        ...p,
        id: p.id.toString(),
        basePrice: p.basePrice.toString(),
        salePrice: p.salePrice?.toString() || '',
        saleEndDate: p.saleEndDate ? p.saleEndDate.toISOString() : ''
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductDeal(productId: string, newSalePrice: string | null, newSaleEndDate: string | null) {
  try {
    let parsedSalePrice = null;
    if (newSalePrice && newSalePrice.trim() !== '') {
      parsedSalePrice = parseFloat(newSalePrice);
      if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
        throw new Error("Invalid sale price");
      }
    }

    await prisma.product.update({
      where: { id: String(productId) },
      data: {
        salePrice: parsedSalePrice,
        saleEndDate: newSaleEndDate ? new Date(newSaleEndDate) : null
      }
    });

    revalidatePath('/deals');
    revalidatePath('/admin/deals');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
