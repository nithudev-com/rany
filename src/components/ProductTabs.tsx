'use client';

import React, { useState, useEffect } from 'react';
import { ReviewForm } from './ReviewForm';
import { verifyPurchaseStatus } from '@/actions/reviews';

interface ProductTabsProps {
  productId: string;
  reviewsCount: number;
  hasFaqs: boolean;
  hasDetails?: boolean;
  descriptionNode: React.ReactNode;
  reviewsListNode: React.ReactNode;
  faqsNode: React.ReactNode;
  detailsNode?: React.ReactNode;
}

export function ProductTabs({ productId, reviewsCount, hasFaqs, hasDetails = false, descriptionNode, reviewsListNode, faqsNode, detailsNode }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'description' | 'reviews' | 'faq'>(hasDetails ? 'details' : 'description');

  return (
    <div style={{ marginTop: '64px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', overflowX: 'auto' }}>
        {hasDetails && (
          <button 
            onClick={() => setActiveTab('details')}
            style={{ padding: '20px 32px', fontSize: '16px', fontWeight: activeTab === 'details' ? 800 : 600, color: activeTab === 'details' ? '#0f172a' : '#64748b', border: 'none', background: activeTab === 'details' ? '#fff' : 'transparent', borderBottom: activeTab === 'details' ? '3px solid #D63062' : '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          >
            Product Details
          </button>
        )}
        <button 
          onClick={() => setActiveTab('description')}
          style={{ padding: '20px 32px', fontSize: '16px', fontWeight: activeTab === 'description' ? 800 : 600, color: activeTab === 'description' ? '#0f172a' : '#64748b', border: 'none', background: activeTab === 'description' ? '#fff' : 'transparent', borderBottom: activeTab === 'description' ? '3px solid #D63062' : '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
        >
          Description
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          style={{ padding: '20px 32px', fontSize: '16px', fontWeight: activeTab === 'reviews' ? 800 : 600, color: activeTab === 'reviews' ? '#0f172a' : '#64748b', border: 'none', background: activeTab === 'reviews' ? '#fff' : 'transparent', borderBottom: activeTab === 'reviews' ? '3px solid #D63062' : '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          Reviews
          <span style={{ background: activeTab === 'reviews' ? '#D63062' : '#e2e8f0', color: activeTab === 'reviews' ? '#fff' : '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>{reviewsCount}</span>
        </button>
        {hasFaqs && (
          <button 
            onClick={() => setActiveTab('faq')}
            style={{ padding: '20px 32px', fontSize: '16px', fontWeight: activeTab === 'faq' ? 800 : 600, color: activeTab === 'faq' ? '#0f172a' : '#64748b', border: 'none', background: activeTab === 'faq' ? '#fff' : 'transparent', borderBottom: activeTab === 'faq' ? '3px solid #D63062' : '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          >
            FAQ
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '40px' }}>
        
        {/* Details Tab */}
        {hasDetails && (
          <div style={{ display: activeTab === 'details' ? 'block' : 'none' }}>
            {detailsNode}
          </div>
        )}

        {/* Description Tab */}
        <div style={{ display: activeTab === 'description' ? 'block' : 'none' }}>
          {descriptionNode}
        </div>

        {/* Reviews Tab */}
        <div style={{ display: activeTab === 'reviews' ? 'block' : 'none' }}>
          {reviewsListNode}
        </div>

        {/* FAQ Tab */}
        {hasFaqs && (
          <div style={{ display: activeTab === 'faq' ? 'block' : 'none' }}>
            {faqsNode}
          </div>
        )}
      </div>
    </div>
  );
}
