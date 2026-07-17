'use client';

import React, { useState, useEffect } from 'react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { BuyNowButton } from '@/components/BuyNowButton';
import { WishlistButton } from './WishlistButton';
// Fallback simple formatter since formatPrice is async in this project
function formatMoney(amount: string | number) {
  const num = Number(amount);
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  return `${formatted} CAD`;
}

export function ProductActionBox({ 
  product 
}: { 
  product: any 
}) {
  const variants = product.variants || [];
  
  // Try to pre-select a variant based on URL hash or just use base product defaults
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#variant-', '');
      if (variants.find((v: any) => v.id.toString() === hashId)) {
        setSelectedVariantId(hashId);
      }
    } else if (variants.length > 0) {
      // Default to first variant if none selected
      setSelectedVariantId(variants[0].id.toString());
    }
  }, [variants]);

  const selectedVariant = variants.find((v: any) => v.id.toString() === selectedVariantId) || null;

  const currentPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.basePrice);
  const currentSalePrice = selectedVariant ? (selectedVariant.salePrice ? Number(selectedVariant.salePrice) : null) : (product.salePrice ? Number(product.salePrice) : null);
  const currentStock = selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity;

  let discountPercentage = 0;
  if (currentSalePrice && currentPrice > 0) {
    discountPercentage = Math.round(((currentPrice - currentSalePrice) / currentPrice) * 100);
  }

  // Handle image update dispatch
  useEffect(() => {
    if (selectedVariant && selectedVariant.image && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('variantImageChanged', { detail: selectedVariant.image }));
    }
  }, [selectedVariant]);

  // Group attributes for rendering selector
  const attributeGroups: Record<string, string[]> = {};
  variants.forEach((v: any) => {
    if (v.attributes) {
      Object.entries(v.attributes).forEach(([key, val]) => {
        // Skip Shopify's default empty variant attribute
        if (key === 'Title' && val === 'Default Title') return;
        
        if (!attributeGroups[key]) attributeGroups[key] = [];
        if (!attributeGroups[key].includes(val as string)) attributeGroups[key].push(val as string);
      });
    }
  });

  // Find the currently selected attributes
  const currentAttributes = selectedVariant?.attributes || {};

  const handleAttributeSelect = (key: string, val: string) => {
    const newAttrs = { ...currentAttributes, [key]: val };
    // Find the variant that matches these attributes best
    const bestMatch = variants.find((v: any) => {
      return Object.entries(newAttrs).every(([k, vVal]) => !v.attributes || v.attributes[k] === vVal);
    });
    if (bestMatch) {
      setSelectedVariantId(bestMatch.id.toString());
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#variant-${bestMatch.id.toString()}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .action-btns-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .meta-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; }
        @media (max-width: 640px) {
          .action-btns-grid { grid-template-columns: 1fr; }
          .meta-info-grid { grid-template-columns: 1fr; gap: 12px; }
        }
      `}} />
      
      {/* Pricing and Wishlist */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {discountPercentage > 0 && currentSalePrice ? (
            <>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#94a3b8', textDecoration: 'line-through' }}>
                {formatMoney(currentPrice)}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#e01a70', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {formatMoney(currentSalePrice)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 500, color: '#475569' }}>
                  You Save {formatMoney(currentPrice - currentSalePrice).replace(' CAD', '')}
                </span>
                <span style={{ border: '1px solid #e01a70', color: '#e01a70', padding: '2px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
                  {discountPercentage}% OFF
                </span>
              </div>
            </>
          ) : (
            <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {formatMoney(currentPrice)}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, paddingLeft: '16px' }}>
          <WishlistButton productId={product.id.toString()} />
        </div>
      </div>

      {/* Dynamic Meta Data (BRAND, SKU, CATEGORY, BARCODE) */}
      <div className="meta-info-grid">
        {product.brand && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Brand</span>
            <a href={`/brand/${product.brand.slug}`} style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>{product.brand.name}</a>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SKU</span>
          <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>{selectedVariant?.sku || product.sku}</span>
        </div>
        {product.category && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Category</span>
            <a href={`/category/${product.category.slug}`} style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>{product.category.name}</a>
          </div>
        )}
        {(selectedVariant?.barcode || product.barcode) && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
             <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Barcode</span>
             <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '15px' }}>{selectedVariant?.barcode || product.barcode}</span>
           </div>
        )}
      </div>

      {/* Short Description */}
      <div style={{ color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
        {product.shortDescription}
        {Array.isArray(product.benefits) && product.benefits.length > 0 && (
          <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
            {(product.benefits as string[]).slice(0,3).map((benefit, i) => <li key={i} style={{ marginBottom: '4px' }}>{String(benefit)}</li>)}
          </ul>
        )}
      </div>

      {/* Stock Status */}
      <div style={{ fontWeight: 700, fontSize: '14px', color: currentStock > 0 ? '#10b981' : '#ef4444', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
        {currentStock > 0 ? `Availability: ${currentStock} in stock` : 'Out of Stock'}
      </div>

      {/* Variant Selector */}
      {Object.keys(attributeGroups).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          {Object.entries(attributeGroups).map(([key, options]) => (
            <div key={key}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: '#0f172a' }}>{key}: <span style={{ color: '#64748b', fontWeight: 500 }}>{currentAttributes[key]}</span></div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {options.map(opt => {
                  const isSelected = currentAttributes[key] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAttributeSelect(key, opt)}
                      style={{
                        padding: '8px 16px',
                        border: isSelected ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        background: isSelected ? '#f8fafc' : '#ffffff',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 500,
                        color: '#0f172a',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Box */}
      <div className="action-btns-grid" style={{ marginTop: '8px' }}>
        <AddToCartButton 
          productId={product.id.toString()} 
          variantId={selectedVariantId || undefined} 
          outOfStock={currentStock <= 0} 
        />
        <BuyNowButton 
          productId={product.id.toString()} 
          outOfStock={currentStock <= 0} 
        />
      </div>
    </div>
  );
}
