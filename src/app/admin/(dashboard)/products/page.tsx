import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/money";
import { ProductListClient } from "./ProductListClient";

export const dynamic = 'force-dynamic';


export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const formattedProducts = await Promise.all(products.map(async (p) => ({
    id: p.id.toString(),
    title: p.title,
    sku: p.sku,
    categoryName: p.category?.name || 'N/A',
    formattedPrice: await formatPrice(Number(p.basePrice)),
    stockQuantity: p.stockQuantity,
    status: p.status
  })));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Products</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/products/bulk-ai" className="button" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', border: 'none' }}>✨ Bulk AI Generator</Link>
          <Link href="/admin/products/bulk-blog" className="button" style={{ background: 'linear-gradient(135deg, #E0A96D 0%, #b88655 100%)', color: '#fff', border: 'none' }}>✨ Bulk Product Blog Generator</Link>
          <Link href="/admin/products/new" className="button secondary">Add Product</Link>
        </div>
      </div>

      <ProductListClient initialProducts={formattedProducts} />
    </div>
  );
}
