import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    const safeCurrencies = currencies.map(c => ({
      ...c,
      id: c.id.toString(),
      exchangeRate: c.exchangeRate.toString(),
    }));
    
    return NextResponse.json(safeCurrencies);
  } catch (error) {
    console.error('Failed to fetch currencies:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch currencies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const currency = await prisma.currency.create({
      data: {
        code: body.code,
        name: body.name,
        symbol: body.symbol,
        exchangeRate: body.exchangeRate,
        isDefault: body.isDefault || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
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
    console.error('Failed to create currency:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A currency with this code already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
  }
}
