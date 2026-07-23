import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    
    const safeBrands = brands.map(b => ({
      ...b,
      id: b.id.toString(),
    }));
    
    return NextResponse.json(safeBrands);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const slug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const brand = await prisma.brand.create({
      data: {
        name: body.name,
        slug: slug,
        logo: body.logo,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      },
    });

    const safeBrand = {
      ...brand,
      id: brand.id.toString(),
    };

    return NextResponse.json({ success: true, brand: safeBrand });
  } catch (error: any) {
    console.error('Failed to create brand:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A brand with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
