import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const FAKE_NAMES = ['John D.', 'Sarah M.', 'Alex K.', 'Emily R.', 'Michael T.', 'Jessica L.', 'David W.', 'Amanda B.', 'Chris P.', 'Samantha C.'];
const FAKE_TITLES = ['Great product!', 'Highly recommended', 'Exceeded expectations', 'Good quality', 'Very satisfied', 'Awesome purchase', 'Not bad', 'Exactly as described', 'Love it!', '5 stars'];
const FAKE_BODIES = [
  'I was pleasantly surprised by how well this works. Definitely worth the price.',
  'Shipped fast and arrived in perfect condition. Would buy again.',
  'Really solid build quality. Have been using it for a week with zero issues.',
  'Does exactly what it says on the tin. No complaints here.',
  'Bought this on a whim and it turned out to be one of my best purchases this year.',
  'The customer service was great and the product itself is flawless.',
  'Easy to use and looks great. Very happy.',
  'A bit pricey but you get what you pay for. Premium quality all around.',
  'My whole family loves this. Highly recommend getting one.',
  'Perfect. Exactly what I was looking for!'
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get('admin_auth')?.value === 'true';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productId = body.productId;
    const count = parseInt(body.count, 10);

    if (!productId || isNaN(count) || count < 1 || count > 50) {
      return NextResponse.json({ error: 'Invalid input. Provide a productId and a count between 1 and 50.' }, { status: 400 });
    }

    const reviewsToCreate = [];
    for (let i = 0; i < count; i++) {
      reviewsToCreate.push({
        productId: String(productId),
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars mostly
        title: getRandom(FAKE_TITLES),
        body: getRandom(FAKE_BODIES),
        author: getRandom(FAKE_NAMES),
        approved: true // Auto-approve admin generated reviews
      });
    }

    await prisma.review.createMany({
      data: reviewsToCreate
    });

    return NextResponse.json({ success: true, message: `Successfully generated ${count} reviews.` });
  } catch (error: any) {
    console.error('Bulk review creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create reviews' }, { status: 500 });
  }
}
