import { prisma } from '@/lib/prisma';
import { AdminInbox } from './components/AdminInbox';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const conversations = await prisma.contactConversation.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } }
    }
  });

  return (
    <div style={{ height: 'calc(100vh - 80px)', margin: '-40px', display: 'flex', background: '#f1f5f9' }}>
      <AdminInbox initialConversations={conversations} />
    </div>
  );
}
