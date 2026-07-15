import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/money";
import { WishlistButton } from "@/app/(frontend)/product/components/WishlistButton";
import { AddToCartButton } from "@/components/AddToCartButton";

type ProductCardProps = {
  id?: string;
  title: string;
  slug: string;
  image?: string | null;
  price: number | string;
  salePrice?: number | string | null;
  category?: string | null;
  brand?: string | null;
  variantsCount?: number;
  stockQuantity?: number;
  // Pre-fetched review stats from the parent page (avoids N+1 DB queries)
  avgRating?: number;
  reviewCount?: number;
};

/**
 * ProductCard is now a pure Server Component — no DB calls.
 * All review stats must be passed in as props (fetched once in bulk by the parent).
 * All navigation uses Next.js <Link> for automatic prefetching.
 */
export async function ProductCard({
  id,
  title,
  slug,
  image,
  price,
  salePrice,
  category,
  brand,
  variantsCount = 0,
  stockQuantity = 1,
  avgRating = 0,
  reviewCount = 0,
}: ProductCardProps) {
  const isOutOfStock = stockQuantity <= 0;

  let discountPercentage = 0;
  if (salePrice && price) {
    const p = Number(price);
    const sp = Number(salePrice);
    if (p > 0 && sp < p) {
      discountPercentage = Math.round(((p - sp) / p) * 100);
    }
  }

  return (
    <div
      className="premium-product-card"
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {id && (
        <div className="premium-wishlist-pos">
          <WishlistButton productId={id} mini={true} />
        </div>
      )}

      {isOutOfStock ? (
        <div
          style={{
            position: "absolute", top: "12px", left: "12px",
            background: "rgba(239, 68, 68, 0.9)", color: "#fff",
            fontSize: "11px", fontWeight: 800, padding: "4px 8px",
            borderRadius: "4px", zIndex: 10,
          }}
        >
          OUT OF STOCK
        </div>
      ) : discountPercentage > 0 ? (
        <div
          style={{
            position: "absolute", top: "12px", left: "12px",
            background: "#ffffff", color: "#e01a70", border: "1px solid #e01a70",
            fontSize: "11px", fontWeight: 700, padding: "2px 8px",
            borderRadius: "16px", zIndex: 10, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {discountPercentage}% OFF
        </div>
      ) : null}

      {/* Use Next.js Link for prefetching on hover */}
      <Link className="premium-card-image-link" href={`/product/${slug}`} prefetch={true}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "center", height: "100%", color: "#cbd5e1",
            }}
          >
            No Image
          </div>
        )}
      </Link>

      <div className="premium-card-body">
        <Link
          href={`/product/${slug}`}
          prefetch={true}
          style={{ textDecoration: "none", color: "inherit", flexGrow: 1, display: "block" }}
        >
          {brand && <div className="premium-card-brand">{brand}</div>}
          <h3 className="premium-card-title">{title}</h3>

          {reviewCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <div style={{ display: "flex", color: "#FBBF24", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="12"
                    height="12"
                    fill={star <= Math.round(avgRating) ? "currentColor" : "#e2e8f0"}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </Link>

        <div className="premium-card-price-row">
          <div>
            <span className="premium-card-price">
              {await formatPrice(salePrice || price)}
            </span>
            {salePrice && (
              <span className="premium-card-old-price">
                {await formatPrice(price)}
              </span>
            )}
          </div>
          {id && (
            <div style={{ pointerEvents: "auto" }}>
              {variantsCount > 0 ? (
                <Link
                  href={`/product/${slug}`}
                  prefetch={true}
                  title="Select Options"
                  style={{
                    background: "#0f172a", color: "#fff", border: "none",
                    width: "32px", height: "32px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    textDecoration: "none",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </Link>
              ) : (
                <AddToCartButton productId={id} outOfStock={isOutOfStock} mini={true} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
