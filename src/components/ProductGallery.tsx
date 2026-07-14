'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { shopifyLoader } from "@/lib/image-loader";

interface ProductImage {
  imageUrl: string;
  altText?: string | null;
}

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [localImages, setLocalImages] = useState<ProductImage[]>(images || []);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Update local images if prop changes
    setLocalImages(images || []);
  }, [images]);

  useEffect(() => {
    const handleVariantImageChange = (e: any) => {
      const newImageUrl = e.detail;
      if (!newImageUrl) return;

      // Find if image already exists in our list
      const existingIndex = localImages.findIndex(img => img.imageUrl === newImageUrl);
      
      if (existingIndex >= 0) {
        setActiveIndex(existingIndex);
      } else {
        // Add it to the front of the list
        setLocalImages([{ imageUrl: newImageUrl, altText: 'Variant Image' }, ...localImages]);
        setActiveIndex(0);
      }
    };

    window.addEventListener('variantImageChanged', handleVariantImageChange);
    return () => window.removeEventListener('variantImageChanged', handleVariantImageChange);
  }, [localImages]);

  if (!localImages || localImages.length === 0) {
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
        <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#f8fafc" }}>
          {/* Empty state placeholder */}
        </div>
      </div>
    );
  }

  return (
    <div className="pdp-sticky-gallery" style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
      
      {/* Main Large Image */}
      <div className="card animate-fade-up" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: '24px', position: 'relative', width: '100%' }}>
        <div style={{ position: "relative", aspectRatio: "1 / 1", background: "#f8fafc", width: '100%' }} className="gallery-image-hover">
          <Image 
            src={localImages[activeIndex]?.imageUrl || localImages[0].imageUrl} 
            alt={localImages[activeIndex]?.altText || `Product image ${activeIndex + 1}`} 
            fill 
            priority 
            sizes="(max-width: 900px) 100vw, 50vw" 
            style={{ objectFit: "contain", padding: "20px", transition: 'opacity 0.3s ease-in-out' }} 
            key={localImages[activeIndex]?.imageUrl || activeIndex} // Force re-render on index change for smooth transition if needed
            loader={shopifyLoader}
          />
        </div>
      </div>

      {/* Thumbnails Slider/Row */}
      {localImages.length > 1 && (
        <div className="animate-fade-up delay-1 custom-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', width: '100%', minWidth: 0, scrollSnapType: 'x mandatory' }}>
          {localImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{
                position: 'relative',
                flex: '0 0 80px',
                minWidth: '60px',
                aspectRatio: '1 / 1',
                borderRadius: '12px',
                overflow: 'hidden',
                border: activeIndex === idx ? '2px solid #D63062' : '2px solid transparent',
                padding: 0,
                background: '#f8fafc',
                cursor: 'pointer',
                opacity: activeIndex === idx ? 1 : 0.6,
                transition: 'all 0.2s ease',
                scrollSnapAlign: 'start'
              }}
            >
              <Image 
                src={img.imageUrl} 
                alt={img.altText || `Thumbnail ${idx + 1}`} 
                fill 
                sizes="(max-width: 768px) 60px, 80px" 
                style={{ objectFit: "contain" }} 
                loader={shopifyLoader}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
