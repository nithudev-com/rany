import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function CustomerReviewsPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }

  const customer = await prisma.customer.findUnique({
    where: { id: String(customerIdStr) }
  });

  if (!customer) {
    redirect('/login');
  }

  // Find reviews by the customer's name since Review schema uses string author
  const authorName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim();

  const reviews = await prisma.review.findMany({
    where: {
      author: {
        contains: customer.firstName || ''
      }
    },
    include: {
      product: {
        select: {
          title: true,
          slug: true,
          mainImage: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      
      <div className="dashboard-card" style={{ padding: '32px' }}>
        <h1 className="dashboard-card-title">My Reviews</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>
          Manage your submitted product reviews.
        </p>
      </div>

      <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
        {reviews.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', background: '#F8FAFC' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>No reviews yet</h3>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
              You haven't written any product reviews. Once you review a product, it will appear here.
            </p>
            <Link href="/" className="dashboard-btn-primary" style={{ marginTop: '24px', display: 'inline-flex' }}>Start Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {reviews.map((review) => (
              <div key={review.id.toString()} style={{ display: 'flex', gap: '24px', padding: '24px', borderBottom: '1px solid #F0DDE5' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#f8fafc', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                  {review.product.mainImage && (
                    <img src={review.product.mainImage} alt={review.product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <Link href={`/product/${review.product.slug}`} style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
                        {review.product.title}
                      </Link>
                      <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} width="14" height="14" fill={star <= review.rating ? 'currentColor' : '#cbd5e1'} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, background: review.approved ? '#ecfdf5' : '#fef3c7', color: review.approved ? '#059669' : '#d97706' }}>
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginTop: '8px' }}>
                        {review.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', margin: '12px 0 4px' }}>{review.title}</h4>
                  <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
                    {review.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
