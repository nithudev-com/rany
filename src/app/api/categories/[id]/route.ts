import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = String(id);
    const body = await request.json();
    
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        slug: body.slug,
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
    console.error('Failed to update category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.category.delete({
      where: { id: String(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
