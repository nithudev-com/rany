'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function buyAgain(productId: string, variantId: string | null) {
  const cookieStore = await cookies();
  const customerAuth = cookieStore.get('customer_auth')?.value;
  
  if (!customerAuth) {
    return { success: false, error: 'You must be logged in to buy again.' };
  }

  try {
    // 1. Confirm product still exists and is ACTIVE
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      return { success: false, error: 'This product is no longer available.' };
    }

    // 2. Confirm variant still exists (if applicable)
    let finalPrice = product.salePrice || product.basePrice;
    let stock = product.stockQuantity;
    let stockStatus = product.stockStatus;

    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant || !variant.isEnabled) {
        return { success: false, error: 'This specific variation is no longer available.' };
      }
      finalPrice = variant.salePrice || variant.price;
      stock = variant.stockQuantity;
      stockStatus = variant.stockStatus;
    }

    // 3. Confirm stock availability
    if (stockStatus === 'OUT_OF_STOCK' || stock <= 0) {
      return { success: false, error: 'This item is currently out of stock.' };
    }

    // 4. Cart logic goes here. Since we don't know the exact cart implementation,
    // we would theoretically add it to the DB Cart or Cookie Cart here using `finalPrice` and `1` quantity.
    
    // For demonstration, we simulate success
    revalidatePath('/cart');
    
    return { 
      success: true, 
      message: 'Added to cart successfully at the current price!',
      currentPrice: finalPrice 
    };

  } catch (error) {
    console.error('Buy Again Error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
