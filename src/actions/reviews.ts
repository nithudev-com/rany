'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(data: {
  productId: string;
  rating: number;
  title: string;
  body: string;
  author: string;
}) {
  try {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return { error: "Please provide a valid rating between 1 and 5." };
    }
    if (!data.author || data.author.trim() === '') {
      return { error: "Please provide your name." };
    }
    if (!data.body || data.body.trim() === '') {
      return { error: "Please write a review." };
    }

    await prisma.review.create({
      data: {
        productId: String(data.productId),
        rating: data.rating,
        title: data.title,
        body: data.body,
        author: data.author,
        approved: false, // Default to false requiring admin approval
      }
    });

    // Revalidate paths that might show this product's reviews
    revalidatePath(`/product/[slug]`, 'page');
    revalidatePath(`/account/reviews`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return { error: error.message || "Failed to submit review. Please try again." };
  }
}

export async function approveReview(id: string, approved: boolean) {
  try {
    await prisma.review.update({
      where: { id: String(id) },
      data: { approved }
    });

    revalidatePath(`/admin/reviews`);
    revalidatePath(`/product/[slug]`, 'page');
    revalidatePath(`/account/reviews`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to approve review:", error);
    return { error: error.message || "Failed to update review status." };
  }
}

export async function deleteReview(id: string) {
  try {
    await prisma.review.delete({
      where: { id: String(id) }
    });

    revalidatePath(`/admin/reviews`);
    revalidatePath(`/product/[slug]`, 'page');
    revalidatePath(`/account/reviews`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete review:", error);
    return { error: error.message || "Failed to delete review." };
  }
}

export async function verifyPurchaseStatus(productId: string): Promise<boolean> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const customerIdStr = cookieStore.get('customer_auth')?.value;

    if (!customerIdStr) return false;

    const purchaseCount = await prisma.order.count({
      where: {
        customerId: String(customerIdStr),
        status: { in: ['PAID', 'PROCESSING', 'DELIVERED'] },
        items: {
          some: {
            productId: String(productId)
          }
        }
      }
    });

    return purchaseCount > 0;
  } catch (error) {
    console.error("Failed to verify purchase status:", error);
    return false;
  }
}
