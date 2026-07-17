import type { Product, Category, Brand } from "@prisma/client";

export function siteUrl(path = "") {
  let base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  
  if (!base) {
    console.warn("Warning: Missing NEXT_PUBLIC_SITE_URL configuration. Falling back to https://rany.uk");
    base = "https://rany.uk";
  }

  // Ensure path starts with a slash if provided
  const safePath = path && !path.startsWith('/') ? `/${path}` : path;
  return `${base}${safePath}`;
}

export function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/Â/g, "")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function productJsonLd(product: any) {
  const price = product.salePrice ?? product.basePrice;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.mainImage ? [product.mainImage] : [],
    description: cleanText(product.shortDescription || product.description || product.title),
    sku: product.sku,
    mpn: product.sku,
    gtin14: product.barcode || undefined,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name,
          url: siteUrl(`/brand/${product.brand.slug}`)
        }
      : undefined,
    category: product.category ? product.category.name : undefined,
    offers: {
      "@type": "Offer",
      url: siteUrl(`/product/${product.slug}`),
      priceCurrency: "CAD",
      price: Number(price),
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stockStatus === "IN_STOCK" || (product.stockQuantity && product.stockQuantity > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Rany.uk"
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "CA",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn"
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "GBP"
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "CA"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 5,
            unitCode: "d"
          }
        }
      }
    }
  };

  if (product.reviews && product.reviews.length > 0) {
    const approvedReviews = product.reviews.filter((r: any) => r.approved !== false);
    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      const avgRating = (totalRating / approvedReviews.length).toFixed(1);
      
      schema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: approvedReviews.length,
        bestRating: "5",
        worstRating: "1"
      };

      schema.review = approvedReviews.map((review: any) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: "5"
        },
        author: {
          "@type": "Person",
          name: review.author || "Anonymous"
        },
        datePublished: review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : undefined,
        reviewBody: cleanText(review.body),
        name: cleanText(review.title)
      }));
    }
  }

  if (product.videoUrl) {
    schema.subjectOf = {
      "@type": "VideoObject",
      name: `${product.title} Video`,
      description: `Watch a video about ${product.title}`,
      thumbnailUrl: product.mainImage ? [product.mainImage] : [],
      uploadDate: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      contentUrl: product.videoUrl
    };
  }

  return schema;
}

export function categoryJsonLd(category: Category) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    url: siteUrl(`/category/${category.slug}`),
    description: category.seoDescription || `Shop ${category.name}`
  };
}

export function faqJsonLd(faqs: any, pageUrl?: string) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": pageUrl ? `${pageUrl}#faq` : `${siteUrl()}/#faq`,
    mainEntity: faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function articleJsonLd(post: any, sourceProduct?: any) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl(`/blog/${post.slug}`)
    },
    headline: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Rany.uk",
      url: siteUrl()
    },
    publisher: {
      "@type": "Organization",
      name: "Rany.uk",
      logo: {
        "@type": "ImageObject",
        url: siteUrl('/logo.png')
      }
    }
  };

  // Advanced SEO: Pass SEO authority from the blog to the product it reviews
  if (sourceProduct) {
    schema.about = {
      "@type": "Product",
      name: sourceProduct.title,
      url: siteUrl(`/product/${sourceProduct.slug}`),
      image: sourceProduct.mainImage ? [sourceProduct.mainImage] : []
    };
  }

  return schema;
}

export function breadcrumbJsonLd(items: { name: string, url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.url)
    }))
  };
}
