'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BulkAddReviewButtonProps {
  products: { id: bigint; title: string }[];
}

export function BulkAddReviewButton({ products }: BulkAddReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id.toString() || '');
  const [reviewCount, setReviewCount] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(products[0]?.title || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/reviews/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, count: reviewCount })
      });

      if (!res.ok) {
        throw new Error('Failed to bulk add reviews');
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      alert(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary" 
        style={{ padding: '8px 16px', background: '#D63062', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
      >
        + Bulk Add Reviews
      </button>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '32px', position: 'relative' }}>
            
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Bulk Add Reviews</h3>
            
            <form onSubmit={handleBulkAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Target Product</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      setProductId(''); // Reset ID if they type something new
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search for a product..."
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                    required
                  />
                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10 }}>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(p => (
                          <div 
                            key={p.id.toString()}
                            onClick={() => {
                              setProductId(p.id.toString());
                              setSearchTerm(p.title);
                              setIsDropdownOpen(false);
                            }}
                            style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: productId === p.id.toString() ? '#f8fafc' : '#fff' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = productId === p.id.toString() ? '#f8fafc' : '#fff'}
                          >
                            {p.title}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '12px', color: '#64748b' }}>No products found</div>
                      )}
                    </div>
                  )}
                  {/* Hidden input to ensure form validation triggers if no valid product ID is selected */}
                  <input type="hidden" required value={productId} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Number of Reviews to Generate</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={reviewCount}
                  onChange={e => setReviewCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ background: '#D63062', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, marginTop: '16px' }}
              >
                {isSubmitting ? 'Generating...' : 'Generate Reviews'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
