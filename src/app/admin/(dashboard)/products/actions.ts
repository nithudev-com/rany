'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bulkUpdateInventory(productIds: string[], newQuantity: number) {
  if (!productIds || productIds.length === 0) return { success: false, error: 'No products selected' };
  
  try {
    const ids = productIds.map(id => String(id));
    
    await prisma.product.updateMany({
      where: { id: { in: ids } },
      data: { stockQuantity: newQuantity, stockStatus: newQuantity > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK' }
    });
    
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error("Bulk inventory update failed:", error);
    return { success: false, error: 'Failed to update inventory' };
  }
}

export async function bulkUpdatePricePercentage(productIds: string[], percentage: number) {
  if (!productIds || productIds.length === 0) return { success: false, error: 'No products selected' };
  if (percentage === 0) return { success: true };

  try {
    const ids = productIds.map(id => String(id));
    
    // Prisma does not have native support for multiplying Decimal fields by a float in updateMany.
    // We must fetch them, calculate, and update them one by one. But using a transaction makes it atomic.
    
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, basePrice: true }
    });

    const multiplier = 1 + (percentage / 100);

    const updates = products.map(p => {
      const newPrice = (Number(p.basePrice) * multiplier).toFixed(2);
      return prisma.product.update({
        where: { id: p.id },
        data: { basePrice: Number(newPrice) }
      });
    });

    await prisma.$transaction(updates);

    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error("Bulk price update failed:", error);
    return { success: false, error: 'Failed to update prices' };
  }
}

export async function getProductsListForAI() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
        faq: true,
        details: true,
        status: true,
        generatedByAI: true,
        focusKeyword: true,
        images: true,
        blogs: { select: { id: true, title: true, isPublished: true } }
      }
    });
    
    // We stringify the IDs to make them client component compatible safely
    return products.map(p => ({
      ...p,
      id: p.id.toString(),
      isPublished: p.status === 'ACTIVE',
      hasBlog: p.blogs && p.blogs.length > 0,
      existingBlog: p.blogs && p.blogs.length > 0 ? {
        id: p.blogs[0].id.toString(),
        title: p.blogs[0].title,
        isPublished: p.blogs[0].isPublished
      } : null
    }));
  } catch (error) {
    console.error("Failed to fetch products for AI:", error);
    return [];
  }
}

export async function saveProductDataForAI(id: string, data: {
  seoTitle?: string;
  seoDescription?: string;
  faq?: any;
  details?: any;
  description?: string;
  shortDescription?: string;
  focusKeyword?: string;
  tags?: any;
  images?: any;
}) {
  try {
    const updateData: any = {
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      faq: data.faq || undefined,
      details: data.details || undefined,
      description: data.description || undefined,
      shortDescription: data.shortDescription || undefined,
      tags: data.tags || undefined,
      focusKeyword: data.focusKeyword || undefined,
      generatedByAI: true,
    };

    if (data.images && Array.isArray(data.images)) {
      updateData.images = {
        update: data.images.map((img: any) => ({
          where: { id: String(img.id) },
          data: { altText: img.altText }
        }))
      };
    }

    await prisma.product.update({
      where: { id: String(id) },
      data: updateData
    });
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error) {
    console.error("Failed to save product AI data:", error);
    return { success: false, error: 'Failed to save product AI data' };
  }
}

export async function saveGeneratedBlog(sourceProductId: string, data: {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  faqs?: any;
  coverImage?: string;
  isPublished?: boolean;
}) {
  try {
    let finalSlug = data.slug;
    
    // Check for existing slug and append a random string if duplicate
    const existing = await prisma.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    const blog = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt,
        content: data.contentHtml,
        coverImage: data.coverImage || undefined,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        focusKeyword: data.focusKeyword,
        secondaryKeywords: data.secondaryKeywords || [],
        faqs: data.faqs || undefined,
        generatedByAI: true,
        aiGenerationStatus: 'COMPLETED',
        seoScore: 90, // Basic mock score, can be dynamically calculated later
        sourceProductId: String(sourceProductId),
        isPublished: data.isPublished || false
      }
    });

    revalidatePath('/admin/blog');
    return { success: true, blogId: blog.id.toString() };
  } catch (error) {
    console.error("Failed to save generated blog:", error);
    return { success: false, error: 'Failed to save generated blog.' };
  }
}
