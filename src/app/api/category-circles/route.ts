import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.categoryCircle.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    
    const safeItems = items.map(item => ({
      ...item,
      id: item.id.toString(),
    }));
    
    return NextResponse.json(safeItems);
  } catch (error) {
    console.error('Failed to fetch category circles:', error);
    return NextResponse.json({ error: 'Failed to fetch category circles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, image, url, sortOrder } = body;

    let result;

    if (id) {
      // Update existing item
      result = await prisma.categoryCircle.update({
        where: { id: String(id) },
        data: {
          name,
          image,
          url,
          sortOrder: parseInt(sortOrder) || 0,
        },
      });
    } else {
      // Create new item
      result = await prisma.categoryCircle.create({
        data: {
          name,
          image,
          url,
          sortOrder: parseInt(sortOrder) || 0,
        },
      });
    }

    const safeResult = {
      ...result,
      id: result.id.toString(),
    };

    return NextResponse.json({ success: true, item: safeResult });
  } catch (error: any) {
    console.error('Failed to save category circle:', error);
    return NextResponse.json({ error: 'Failed to save category circle' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.categoryCircle.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category circle:', error);
    return NextResponse.json({ error: 'Failed to delete category circle' }, { status: 500 });
  }
}
