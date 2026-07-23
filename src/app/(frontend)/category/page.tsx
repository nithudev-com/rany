import { prisma } from '@/lib/prisma';
import { CategoryGrid } from '@/components/CategoryGrid';
import type { Metadata } from 'next';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Collections | Premium Store',
  description: 'Discover our world-class collections and premium categories.',
  alternates: {
    canonical: siteUrl('/category')
  }
};

export default async function GlobalCategoryPage() {
  // Fetch all categories
  const allCategories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    take: 64
  });

  return (
    <main style={{ minHeight: '80vh', padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: '#111111' }}>
          Explore All Categories
        </h1>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '48px' }}>
          Discover our complete selection of products across all categories.
        </p>
      </div>

      <CategoryGrid categories={allCategories} />
    </main>
  );
}
