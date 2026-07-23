import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        mainImage: true
      },
      take: 5
    });

    // Serialize Decimal basePrice to string/number
    const serializedProducts = products.map(p => ({
      ...p,
      id: p.id.toString(),
      basePrice: Number(p.basePrice)
    }));

    return NextResponse.json({ suggestions: serializedProducts });
  } catch (error) {
    console.error('Search Suggestions Error:', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
