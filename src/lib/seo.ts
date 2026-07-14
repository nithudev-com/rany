import type { Product, Category, Brand } from "@prisma/client";

export function siteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  
  if (!base && process.env.NODE_ENV !== "development") {
    throw new Error("Missing NEXT_PUBLIC_SITE_URL configuration for production");
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

export function productJsonLd(product: Product & { brand?: Brand | null }) {
  const price = product.salePrice ?? product.basePrice;

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.mainImage ? [product.mainImage] : [],
    description: product.shortDescription || product.description || product.title,
    sku: product.sku,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand.name
        }
      : undefined,
    offers: {
      "@type": "Offer",
      url: siteUrl(`/product/${product.slug}`),
      priceCurrency: "INR", // Adjust currency if needed
      price: Number(price),
      availability:
        product.stockStatus === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
    }
  };

  if ((product as any).videoUrl) {
    schema.subjectOf = {
      "@type": "VideoObject",
      name: `${product.title} Video`,
      description: `Watch a video about ${product.title}`,
      thumbnailUrl: product.mainImage ? [product.mainImage] : [],
      uploadDate: product.createdAt ? new Date(product.createdAt).toISOString() : new Date().toISOString(),
      contentUrl: (product as any).videoUrl
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

export function faqJsonLd(faqs: any) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
      name: "SEXTOYS LOVERS",
      url: siteUrl()
    },
    publisher: {
      "@type": "Organization",
      name: "SEXTOYS LOVERS",
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
