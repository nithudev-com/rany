import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-generate slug from title if not provided
    const slug = body.slug || slugify(body.title, { lower: true, strict: true }) || `product-${Date.now()}`;
    
    // Format variants for nested Prisma creation
    let variantsConfig = undefined;
    if (body.variants && Array.isArray(body.variants) && body.variants.length > 0) {
      variantsConfig = {
        create: body.variants.map((v: any) => ({
          sku: v.sku,
          price: Number(v.price),
          salePrice: v.salePrice ? Number(v.salePrice) : null,
          stockQuantity: Number(v.stockQuantity),
          attributes: v.attributes,
          image: v.image,
          isEnabled: v.isEnabled !== undefined ? v.isEnabled : true,
        }))
      };
    }

    let imagesConfig = undefined;
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      imagesConfig = {
        create: body.images.map((img: any) => ({
          imageUrl: img.secureUrl,
          publicId: img.publicId,
          width: img.width,
          height: img.height,
          format: img.format,
          bytes: img.bytes,
          altText: img.altText || '',
          sortOrder: img.sortOrder || 0,
          isPrimary: img.isPrimary || false,
        }))
      };
    }

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        slug: slug,
        sku: body.sku,
        basePrice: body.basePrice ? Number(body.basePrice) : 0,
        description: body.description,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        faq: body.faq,
        details: body.details,
        mainImage: body.mainImage,
        videoUrl: body.videoUrl,
        stockQuantity: body.stockQuantity ? Number(body.stockQuantity) : 0,
        lowStockLimit: body.lowStockLimit ? Number(body.lowStockLimit) : null,
        status: body.status || 'ACTIVE',
        productType: body.productType || 'SIMPLE',
        categoryId: body.categoryId ? String(body.categoryId) : null,
        brandId: body.brandId ? String(body.brandId) : null,
        saleStartDate: body.saleStartDate ? new Date(body.saleStartDate) : null,
        saleEndDate: body.saleEndDate ? new Date(body.saleEndDate) : null,
        weight: body.weight ? Number(body.weight) : null,
        length: body.length ? Number(body.length) : null,
        width: body.width ? Number(body.width) : null,
        height: body.height ? Number(body.height) : null,
        shippingInfo: body.shippingInfo,
        returnInfo: body.returnInfo,
        warrantyInfo: body.warrantyInfo,
        isFeatured: body.isFeatured || false,
        focusKeyword: body.focusKeyword,
        canonicalUrl: body.canonicalUrl,
        ogTitle: body.ogTitle,
        ogDescription: body.ogDescription,
        tags: body.tags,
        shortDescription: body.shortDescription,
        readinessScore: body.readinessScore || 0,
        variants: variantsConfig,
        images: imagesConfig,
      },
      include: {
        variants: true,
        images: true,
      }
    });

    // BigInt cannot be serialized natively
    const safeProduct = {
      ...newProduct,
      id: newProduct.id.toString(),
      categoryId: newProduct.categoryId?.toString(),
      brandId: newProduct.brandId?.toString(),
      variants: newProduct.variants.map(v => ({
        ...v,
        id: v.id.toString(),
        productId: v.productId.toString(),
      })),
      images: newProduct.images?.map(i => ({
        ...i,
        id: i.id.toString(),
        productId: i.productId.toString(),
      }))
    };

    return NextResponse.json({ success: true, product: safeProduct });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    
    // Handle Prisma unique constraint error gracefully (P2002)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `A product with this ${error.meta?.target?.join(', ')} already exists.` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product. Check server logs.' },
      { status: 500 }
    );
  }
}
