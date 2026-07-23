import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;
    const id = String(resolvedParams.id);

    const currency = await prisma.currency.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        symbol: body.symbol,
        exchangeRate: body.exchangeRate,
        isDefault: body.isDefault,
        isActive: body.isActive,
      },
    });

    if (currency.isDefault) {
      await prisma.currency.updateMany({
        where: { id: { not: currency.id } },
        data: { isDefault: false },
      });
    }

    const safeCurrency = {
      ...currency,
      id: currency.id.toString(),
      exchangeRate: currency.exchangeRate.toString(),
    };

    return NextResponse.json({ success: true, currency: safeCurrency });
  } catch (error: any) {
    console.error('Failed to update currency:', error);
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = String(resolvedParams.id);
    
    const currency = await prisma.currency.findUnique({ where: { id } });
    if (currency?.isDefault) {
      return NextResponse.json({ error: 'Cannot delete the default currency.' }, { status: 400 });
    }

    await prisma.currency.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete currency:', error);
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 });
  }
}
