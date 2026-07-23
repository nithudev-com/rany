import React from 'react';
import { prisma } from '@/lib/prisma';
import { ReviewList } from './components/ReviewList';
import { BulkAddReviewButton } from './components/BulkAddReviewButton';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          title: true,
          slug: true
        }
      }
    }
  });

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Review Management</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Approve, reject, or delete customer reviews before they appear on the storefront.</p>
        </div>
        <BulkAddReviewButton products={products} />
      </div>
      <ReviewList initialReviews={reviews} />
    </div>
  );
}
