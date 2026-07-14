'use client';

import { useState, useEffect } from 'react';
import { toggleWishlist, checkWishlistStatus } from '../../account/wishlist/actions';
import { toast } from 'react-hot-toast';

export function WishlistButton({ productId, mini = false }: { productId: string, mini?: boolean }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true); // Start loading while checking status

  useEffect(() => {
    checkWishlistStatus(BigInt(productId)).then(status => {
      setInWishlist(status);
      setLoading(false);
    });
  }, [productId]);

  const handleToggle = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    setLoading(true);
    const result = await toggleWishlist(BigInt(productId));
    if (result.success) {
      setInWishlist(result.action === 'added');
      if (result.action === 'added') {
        toast.success('Added to wishlist', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1e293b',
            backdropFilter: 'blur(10px)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            fontWeight: 500,
            fontSize: '15px'
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        });
      } else {
        toast('Removed from wishlist', {
          duration: 3000,
          position: 'top-center',
          icon: '💔',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#1e293b',
            backdropFilter: 'blur(10px)',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            fontWeight: 500,
            fontSize: '15px'
          },
        });
      }
    } else if (result.error) {
      toast.error(result.error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1e293b',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
          fontSize: '15px'
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      });
    }
    setLoading(false);
  };

  if (mini) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title="Save to Wishlist"
        className={`wishlist-btn-mini ${inWishlist ? 'active' : ''} ${loading ? 'loading' : ''}`}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          border: 'none',
          color: inWishlist ? '#ef4444' : '#94a3b8',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={inWishlist ? '#ef4444' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <style dangerouslySetInnerHTML={{ __html: `
          .wishlist-btn-mini:active { transform: scale(0.85); }
        `}} />
      </button>
    );
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      title="Save to Wishlist"
      style={{
        background: '#FFF4F7',
        border: '1px solid #F0DDE5',
        color: inWishlist ? '#D63062' : '#94a3b8',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: loading ? 'wait' : 'pointer',
        transition: '0.2s'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={inWishlist ? '#D63062' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </button>
  );
}
