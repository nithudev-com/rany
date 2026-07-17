'use server';

import { prisma } from '@/lib/prisma';
import type { CartItemInput } from '@/hooks/useCart';

export type RevalidatedCartItem = {
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: number;
  originalPrice?: number;
  totalPrice: number;
  imageUrl: string;
  inStock: boolean;
  maxStock: number;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  currency: string;
};

export type RevalidatedCart = {
  items: RevalidatedCartItem[];
  totals: CartTotals;
  isValid: boolean;
  error?: string;
  couponMessage?: string;
};

export type ShippingOption = {
  id: string;
  name: string;
  price: number;
  estimatedDays: string | null;
};

export async function getShippingOptions(): Promise<ShippingOption[]> {
  const methods = await prisma.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' }
  });
  return methods.map(m => ({
    id: m.id.toString(),
    name: m.name,
    price: Number(m.price),
    estimatedDays: m.estimatedDays
  }));
}

function optimizeCloudinaryUrl(url: string | null): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    return url.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto,f_auto/');
  }
  return url;
}

export async function revalidateCartTotals(
  clientItems: CartItemInput[],
  shippingMethodId?: string,
  couponCode?: string
): Promise<RevalidatedCart> {
  if (!clientItems || clientItems.length === 0) {
    return {
      items: [],
      totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, grandTotal: 0, currency: 'GBP' },
      isValid: true
    };
  }

  const revalidatedItems: RevalidatedCartItem[] = [];
  let subtotal = 0;
  let isValid = true;
  let errorMsg = undefined;

  // 1. Validate Items & Prices
  for (const item of clientItems) {
    try {
      const prodId = BigInt(item.productId);
      const product = await prisma.product.findUnique({
        where: { id: prodId },
        include: { variants: true }
      });

      if (!product) {
        isValid = false;
        errorMsg = "Some items in your cart are no longer available.";
        continue;
      }

      let unitPrice = Number(product.salePrice || product.basePrice);
      let originalPrice = product.salePrice ? Number(product.basePrice) : undefined;
      let stock = product.stockQuantity;
      let title = product.title;
      let variantTitle = undefined;
      let imageUrl = product.mainImage || '';

      if (item.variantId) {
        const variant = product.variants.find(v => v.id.toString() === item.variantId);
        if (variant) {
          unitPrice = Number(variant.salePrice || variant.price);
          originalPrice = variant.salePrice ? Number(variant.price) : undefined;
          stock = variant.stockQuantity;
          if (variant.attributes) {
            const attrs = variant.attributes as Record<string, string>;
            variantTitle = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(' • ');
          }
          if (variant.image) imageUrl = variant.image;
        } else {
          isValid = false;
          errorMsg = "A selected product variation is invalid.";
          continue;
        }
      }

      let quantity = item.quantity;
      if (quantity < 1) quantity = 1;
      let inStock = true;
      if (quantity > stock) {
        quantity = stock;
        inStock = false;
        isValid = false;
        errorMsg = "Some items exceed available stock and have been adjusted.";
      }

      const totalPrice = unitPrice * quantity;
      subtotal += totalPrice;

      revalidatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        title,
        variantTitle,
        quantity,
        unitPrice,
        originalPrice,
        totalPrice,
        imageUrl: optimizeCloudinaryUrl(imageUrl),
        inStock,
        maxStock: stock,
      });

    } catch (e) {
      console.error("Error validating cart item:", e);
      isValid = false;
      errorMsg = "An error occurred while checking your cart.";
    }
  }

  // 2. Coupon Validation
  let discount = 0;
  let couponMessage = undefined;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode.toUpperCase() }
    });

    if (!coupon) {
      errorMsg = "Invalid coupon code.";
    } else if (!coupon.isActive) {
      errorMsg = "This coupon is no longer active.";
    } else if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      errorMsg = "This coupon has expired.";
    } else if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      errorMsg = "This coupon has reached its usage limit.";
    } else if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      errorMsg = `This coupon requires a minimum order of $${Number(coupon.minOrderValue).toFixed(2)}.`;
    } else {
      // Coupon is valid
      if (coupon.discountType === 'PERCENTAGE') {
        discount = subtotal * (Number(coupon.discountValue) / 100);
      } else {
        discount = Number(coupon.discountValue);
      }
      
      // Ensure discount doesn't exceed subtotal
      if (discount > subtotal) discount = subtotal;
      
      couponMessage = `Coupon applied: -${discount.toFixed(2)}`;
    }
  }

  const subtotalAfterDiscount = subtotal - discount;

  // 3. Shipping Validation
  let shipping = 0;
  if (shippingMethodId) {
    const method = await prisma.shippingMethod.findUnique({
      where: { id: BigInt(shippingMethodId) }
    });

    if (!method || !method.isActive) {
      errorMsg = "Selected shipping method is currently unavailable.";
    } else {
      shipping = Number(method.price);
    }
  }

  // 4. Tax Validation (Simple flat rate for demo, can be complex in production)
  // E.g., standard 5% tax on items after discount
  const tax = subtotalAfterDiscount * 0.05; 

  const grandTotal = subtotalAfterDiscount + shipping + tax;

  return {
    items: revalidatedItems,
    totals: {
      subtotal,
      discount,
      shipping,
      tax,
      grandTotal,
      currency: 'GBP'
    },
    isValid,
    error: errorMsg,
    couponMessage
  };
}
