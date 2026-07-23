'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return { 
      success: true, 
      coupons: coupons.map(c => ({
        ...c,
        id: c.id.toString(),
        discountValue: c.discountValue.toString(),
        minOrderValue: c.minOrderValue?.toString() || null
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveCoupon(data: {
  id?: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue?: string;
  usageLimit?: number;
  expiresAt?: string;
  isActive: boolean;
}) {
  try {
    const minOrderVal = data.minOrderValue && parseFloat(data.minOrderValue) > 0 ? parseFloat(data.minOrderValue) : null;
    const expiresDate = data.expiresAt ? new Date(data.expiresAt) : null;
    
    if (data.id) {
      // Update
      await prisma.coupon.update({
        where: { id: String(data.id) },
        data: {
          code: data.code.toUpperCase(),
          discountType: data.discountType,
          discountValue: parseFloat(data.discountValue),
          minOrderValue: minOrderVal,
          usageLimit: data.usageLimit || null,
          expiresAt: expiresDate,
          isActive: data.isActive
        }
      });
    } else {
      // Create
      // Check if code exists
      const existing = await prisma.coupon.findUnique({ where: { code: data.code.toUpperCase() } });
      if (existing) {
        throw new Error("Coupon code already exists.");
      }
      
      await prisma.coupon.create({
        data: {
          code: data.code.toUpperCase(),
          discountType: data.discountType,
          discountValue: parseFloat(data.discountValue),
          minOrderValue: minOrderVal,
          usageLimit: data.usageLimit || null,
          expiresAt: expiresDate,
          isActive: data.isActive
        }
      });
    }

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id: String(id) }
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
