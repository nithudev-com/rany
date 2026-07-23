'use client';

import { useState } from 'react';
import { buyAgain } from '../actions';

export function BuyAgainButton({ productId, variantId }: { productId: string, variantId?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBuyAgain = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await buyAgain(String(productId), variantId ? String(variantId) : null);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Failed to add');
      setTimeout(() => setError(''), 4000);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
      <button 
        onClick={handleBuyAgain}
        disabled={loading || success}
        style={{
          background: success ? '#10b981' : '#111111',
          color: '#FFFFFF',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: loading || success ? 'not-allowed' : 'pointer',
          transition: '0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        {loading ? (
          <span style={{ opacity: 0.8 }}>Checking...</span>
        ) : success ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Added to Cart
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Buy Again
          </>
        )}
      </button>
      
      {error && (
        <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '600' }}>{error}</span>
      )}
    </div>
  );
}
