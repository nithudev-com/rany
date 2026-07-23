import { NextResponse } from 'next/server';
import { generateProductData } from '@/services/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const aiData = await generateProductData(prompt);
    return NextResponse.json(aiData);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate product data' }, { status: 500 });
  }
}
