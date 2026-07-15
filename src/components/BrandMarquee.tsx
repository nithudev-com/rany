'use client';

import Link from "next/link";
import React from "react";
import Image from "next/image";

export function BrandMarquee({ brands }: { brands: any[] }) {
  if (!brands || brands.length === 0) return null;

  // We duplicate the array to create a seamless infinite loop
  const duplicatedBrands = [...brands, ...brands];

  return (
    <div className="brand-marquee-container">
      
      <div className="brand-marquee-viewport">
        <div className="brand-marquee-track">
          {duplicatedBrands.map((brand, index) => (
            <Link 
              key={`${brand.id}-${index}`} 
              href={`/brand/${brand.slug}`} 
              className="brand-marquee-item"
            >
              <div className="brand-logo-wrapper" style={{ position: 'relative' }}>
                {brand.logo ? (
                  <Image src={brand.logo} alt="" fill style={{ objectFit: 'contain' }} className="brand-logo-img" sizes="120px" />
                ) : (
                  <div className="brand-logo-placeholder">{brand.name.charAt(0)}</div>
                )}
              </div>
              <span className="brand-name">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
