import { prisma } from '@/lib/prisma';
import { OrderListClient } from './components/OrderListClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const formattedOrders = orders.map(o => ({
    ...o,
    id: o.id.toString(),
    customerId: o.customerId?.toString(),
    totalAmount: Number(o.totalAmount),
  }));

  return <OrderListClient initialOrders={formattedOrders} />;
}
