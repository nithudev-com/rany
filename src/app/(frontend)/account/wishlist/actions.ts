'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const val = cookieStore.get('customer_auth')?.value;
  return val ? String(val) : null;
}

export async function toggleWishlist(productId: string, variantId: string | null = null) {
  const customerId = await getCustomerId();
  if (!customerId) return { success: false, error: 'Please log in to use your wishlist.' };

  try {
    let wishlist = await prisma.wishlist.findUnique({ where: { customerId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { customerId } });
    }

    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      revalidatePath('/account/wishlist');
      revalidatePath(`/product/[slug]`);
      return { success: true, action: 'removed' };
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
          variantId: variantId || null
        }
      });
      revalidatePath('/account/wishlist');
      revalidatePath(`/product/[slug]`);
      return { success: true, action: 'added' };
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function removeFromWishlist(itemId: string) {
  const customerId = await getCustomerId();
  if (!customerId) return { success: false, error: 'Unauthorized.' };

  try {
    // Zero-trust verification: ensure item belongs to this customer
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: { wishlist: true }
    });

    if (!item || item.wishlist.customerId !== customerId) {
      return { success: false, error: 'Item not found.' };
    }

    await prisma.wishlistItem.delete({ where: { id: itemId } });
    revalidatePath('/account/wishlist');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to remove item.' };
  }
}

export async function checkWishlistStatus(productId: string, variantId: string | null = null) {
  const customerId = await getCustomerId();
  if (!customerId) return false;

  const wishlist = await prisma.wishlist.findUnique({ where: { customerId } });
  if (!wishlist) return false;

  const item = await prisma.wishlistItem.findFirst({
    where: { wishlistId: wishlist.id, productId, variantId: variantId || null }
  });

  return !!item;
}
