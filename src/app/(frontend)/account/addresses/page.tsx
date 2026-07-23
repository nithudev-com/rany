import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AddressManager } from './components/AddressManager';

export const dynamic = 'force-dynamic';

export default async function AccountAddressesPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }

  const customerId = String(customerIdStr);

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [
      { isDefaultShipping: 'desc' },
      { isDefaultBilling: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return (
    <div className="card" style={{ padding: '32px' }}>
      <AddressManager addresses={addresses} />
    </div>
  );
}
