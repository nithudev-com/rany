import { prisma } from '@/lib/prisma';
import { SubscriberListClient } from './SubscriberListClient';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  const preferences = await prisma.emailPreference.findMany({
    include: { customer: true },
    orderBy: { updatedAt: 'desc' }
  });

  const serialized = preferences.map(p => ({
    ...p,
    id: p.id.toString(),
    customerId: p.customerId.toString(),
    customerName: `${p.customer.firstName || ''} ${p.customer.lastName || ''}`.trim() || 'Unknown',
    customerEmail: p.customer.email
  }));

  return <SubscriberListClient initialSubscribers={serialized} />;
}
