'use client';

import React, { useState } from 'react';

interface ProductTabsProps {
  productId: string;
  reviewsCount: number;
  hasFaqs: boolean;
  hasDetails?: boolean;
  descriptionNode: React.ReactNode;
  reviewsListNode: React.ReactNode;
  faqsNode: React.ReactNode;
  detailsNode?: React.ReactNode;
  trustBadgesNode?: React.ReactNode;
}

const AccordionItem = ({ title, icon, isOpen, onClick, children }: any) => (
  <div style={{ borderBottom: '1px solid #e2e8f0' }}>
    <button 
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 0', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#0f172a', fontWeight: 600, fontSize: '18px' }}>
        {icon}
        {title}
      </div>
      <div style={{ color: '#0f172a', fontWeight: 400, fontSize: '28px', lineHeight: 1 }}>
        {isOpen ? '−' : '+'}
      </div>
    </button>
    {isOpen && (
      <div style={{ paddingBottom: '24px', animation: 'fadeIn 0.3s ease' }}>
        {children}
      </div>
    )}
  </div>
);

export function ProductTabs({ productId, reviewsCount, hasFaqs, hasDetails = false, descriptionNode, reviewsListNode, faqsNode, detailsNode, trustBadgesNode }: ProductTabsProps) {
  const [openSection, setOpenSection] = useState<string | null>(hasDetails ? 'details' : 'description');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div style={{ marginTop: '32px' }}>
      
      {/* Accordion Sections */}
      <div style={{ borderTop: '1px solid #e2e8f0' }}>
        
        {hasDetails && (
          <AccordionItem 
            title="Product Details" 
            isOpen={openSection === 'details'} 
            onClick={() => toggleSection('details')}
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect></svg>}
          >
            {detailsNode}
          </AccordionItem>
        )}

        <AccordionItem 
          title="Description" 
          isOpen={openSection === 'description'} 
          onClick={() => toggleSection('description')}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>}
        >
          {descriptionNode}
        </AccordionItem>

        {hasFaqs && (
          <AccordionItem 
            title="FAQ" 
            isOpen={openSection === 'faq'} 
            onClick={() => toggleSection('faq')}
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
          >
            {faqsNode}
          </AccordionItem>
        )}

      </div>

      {trustBadgesNode}

      {/* Persistent Customer Reviews Section */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>Customer reviews</h2>
        
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>{reviewsCount} Reviews</span>
        </div>
        
        {reviewsListNode}
      </div>

    </div>
  );
}
