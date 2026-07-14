import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteBrandButton from "./DeleteBrandButton";
import InlineBrandLogoUpload from "./InlineBrandLogoUpload";
import InlineBrandActiveToggle from "./InlineBrandActiveToggle";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1>Brands</h1>
        <Link href="/admin/brands/new" className="button secondary">Add Brand</Link>
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '12px 0' }}>Name</th>
              <th>Logo</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id.toString()} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 0' }}>{b.name}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <InlineBrandLogoUpload brandId={b.id.toString()} initialLogo={b.logo} />
                    <InlineBrandActiveToggle brandId={b.id.toString()} initialShowOnHome={b.showOnHome} />
                  </div>
                </td>
                <td>{b.slug}</td>
                <td>{b._count.products}</td>
                <td>
                  <Link href={`/admin/brands/${b.id.toString()}/edit`} style={{ color: 'var(--accent)', marginRight: '12px' }}>Edit</Link>
                  <DeleteBrandButton id={b.id.toString()} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
