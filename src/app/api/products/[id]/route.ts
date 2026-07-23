import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Parse the id to BigInt since Prisma schema uses BigInt for ID
    const productId = String(id);

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = String(id);
    
    const body = await request.json();
    
    // Format variants for nested Prisma creation
    let variantsConfig = undefined;
    if (body.variants && Array.isArray(body.variants)) {
      variantsConfig = {
        // Delete old variants and replace with new ones to simplify sync
        deleteMany: {},
        create: body.variants.map((v: any) => ({
          sku: v.sku,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          stockQuantity: Number(v.stockQuantity),
          attributes: v.attributes,
          image: v.image,
        }))
      };
    }

    // Format images for nested Prisma creation
    let imagesConfig = undefined;
    if (body.images && Array.isArray(body.images)) {
      imagesConfig = {
        deleteMany: {},
        create: body.images.map((img: any, idx: number) => ({
          imageUrl: img.secureUrl || img.imageUrl,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
          bytes: img.bytes,
          altText: img.altText,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: !!img.isPrimary
        }))
      };
    }

    // We expect the body to contain the product fields
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title: body.title,
        slug: body.slug,
        sku: body.sku,
        basePrice: body.basePrice ? Number(body.basePrice) : 0,
        salePrice: body.salePrice !== undefined ? body.salePrice : null,
        description: body.description,
        shortDescription: body.shortDescription,
        status: body.status,
        productType: body.productType,
        categoryId: body.categoryId ? String(body.categoryId) : null,
        brandId: body.brandId ? String(body.brandId) : null,
        tags: body.tags || [],
        isFeatured: body.isFeatured || false,
        stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : 0,
        lowStockLimit: body.lowStockLimit !== undefined && body.lowStockLimit !== null ? Number(body.lowStockLimit) : null,
        weight: body.weight !== undefined && body.weight !== null ? Number(body.weight) : null,
        length: body.length !== undefined && body.length !== null ? Number(body.length) : null,
        width: body.width !== undefined && body.width !== null ? Number(body.width) : null,
        height: body.height !== undefined && body.height !== null ? Number(body.height) : null,
        shippingInfo: body.shippingInfo || null,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        faq: body.faq,
        details: body.details,
        mainImage: body.mainImage,
        videoUrl: body.videoUrl,
        variants: variantsConfig,
        images: imagesConfig,
        focusKeyword: body.focusKeyword,
        canonicalUrl: body.canonicalUrl,
        readinessScore: body.readinessScore !== undefined ? Number(body.readinessScore) : 0,
      },
      include: {
        variants: true,
        images: true
      }
    });

    // Invalidate ISR caches so changes reflect immediately on the frontend
    revalidateTag('products');
    if (updatedProduct.slug) {
      revalidateTag(`product:${updatedProduct.slug}`);
    }

    // BigInt cannot be serialized by default Next.js JSON, we must convert it
    const safeProduct = {
      ...updatedProduct,
      id: updatedProduct.id.toString(),
      categoryId: updatedProduct.categoryId?.toString(),
      brandId: updatedProduct.brandId?.toString(),
      variants: updatedProduct.variants.map(v => ({
        ...v,
        id: v.id.toString(),
        productId: v.productId.toString(),
      })),
      images: updatedProduct.images.map(img => ({
        ...img,
        id: img.id.toString(),
        productId: img.productId.toString(),
      }))
    };

    return NextResponse.json({ success: true, product: safeProduct });
  } catch (error: any) {
    console.error('Failed to update product:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `A product with this ${error.meta?.target?.join(', ')} already exists.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
