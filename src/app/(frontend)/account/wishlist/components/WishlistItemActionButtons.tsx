'use client';

import { useState } from 'react';
import { removeFromWishlist } from '../actions';
import { buyAgain } from '../../orders/actions';

export function WishlistItemActionButtons({ itemId, productId, isAvailable }: { itemId: string, productId: string, isAvailable: boolean }) {
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    await buyAgain(String(productId), null);
    setLoading(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    await removeFromWishlist(String(itemId));
    // It will revalidate and remove itself from the server render
  };

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: 'auto' }}>
      <button 
        onClick={handleRemove}
        disabled={removing}
        style={{ 
          background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', fontWeight: '700', cursor: removing ? 'not-allowed' : 'pointer', padding: '8px 12px',
          transition: '0.2s', borderRadius: '8px'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'none'; }}
      >
        {removing ? 'Removing...' : 'Remove'}
      </button>

      <button 
        onClick={handleAddToCart}
        disabled={!isAvailable || loading}
        style={{
          background: !isAvailable ? '#f1f5f9' : '#111111',
          color: !isAvailable ? '#94a3b8' : '#FFFFFF',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '700',
          cursor: !isAvailable || loading ? 'not-allowed' : 'pointer',
          transition: '0.2s',
        }}
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}
