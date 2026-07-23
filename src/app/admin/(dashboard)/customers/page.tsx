import { prisma } from '@/lib/prisma';
import { CustomerListClient } from './components/CustomerListClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const formattedCustomers = customers.map(c => ({
    ...c,
    id: c.id.toString(),
  }));

  return <CustomerListClient initialCustomers={formattedCustomers} />;
}
