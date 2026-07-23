import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    let count = 0;

    // Fix Product Slugs
    const products = await prisma.product.findMany({ select: { id: true, slug: true } });
    for (const p of products) {
      if (p.slug.match(/[^a-z0-9-]/)) {
        let cleanSlug = p.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        try {
          await prisma.product.update({
            where: { id: p.id },
            data: { slug: cleanSlug }
          });
          count++;
        } catch (e) {
          console.error('Failed to update product slug', p.id, e);
        }
      }
    }

    // Fix Category Slugs
    const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
    for (const c of categories) {
      if (c.slug.match(/[^a-z0-9-]/)) {
        let cleanSlug = c.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        try {
          await prisma.category.update({
            where: { id: c.id },
            data: { slug: cleanSlug }
          });
          count++;
        } catch (e) {
          console.error('Failed to update category slug', c.id, e);
        }
      }
    }

    // Fix Brand Slugs
    const brands = await prisma.brand.findMany({ select: { id: true, slug: true } });
    for (const b of brands) {
      if (b.slug.match(/[^a-z0-9-]/)) {
        let cleanSlug = b.slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        try {
          await prisma.brand.update({
            where: { id: b.id },
            data: { slug: cleanSlug }
          });
          count++;
        } catch (e) {
          console.error('Failed to update brand slug', b.id, e);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully cleaned and optimized ${count} SEO URLs in the database!` 
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
