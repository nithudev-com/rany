import { prisma } from '@/lib/prisma';
import { ShippingListClient } from './components/ShippingListClient';

export const dynamic = 'force-dynamic';

export default async function ShippingZonesPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Serialize BigInt and Decimal
  const formattedMethods = methods.map(m => ({
    ...m,
    id: m.id.toString(),
    price: Number(m.price),
  }));

  return <ShippingListClient methods={formattedMethods} />;
}
