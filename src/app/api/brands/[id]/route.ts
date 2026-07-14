import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brandId = BigInt(id);
    const body = await request.json();
    
    const brand = await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        showOnHome: body.showOnHome,
        faqs: body.faqs,
      },
    });

    const safeBrand = {
      ...brand,
      id: brand.id.toString(),
    };

    return NextResponse.json({ success: true, brand: safeBrand });
  } catch (error: any) {
    console.error('Failed to update brand:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A brand with this slug already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.brand.delete({
      where: { id: BigInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
