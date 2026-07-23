import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    
    const safeCategories = categories.map(c => ({
      ...c,
      id: c.id.toString(),
      parentId: c.parentId?.toString()
    }));
    
    return NextResponse.json(safeCategories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const slug = body.slug || slugify(body.name, { lower: true, strict: true });
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slug,
        image: body.image,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        parentId: body.parentId ? String(body.parentId) : null,
        showOnHome: body.showOnHome === true,
      },
    });

    const safeCategory = {
      ...category,
      id: category.id.toString(),
      parentId: category.parentId?.toString(),
    };

    return NextResponse.json({ success: true, category: safeCategory });
  } catch (error: any) {
    console.error('Failed to create category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
