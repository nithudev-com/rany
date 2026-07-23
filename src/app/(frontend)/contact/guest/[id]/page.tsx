import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { GuestReplyForm } from './components/GuestReplyForm';

export const dynamic = 'force-dynamic';

export default async function GuestThreadPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ token?: string }> }) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) notFound();

  const conversation = await prisma.contactConversation.findUnique({
    where: { conversationId: id, guestToken: token },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!conversation) {
    notFound();
  }

  // Mark as read by customer (guest in this case) if they view it
  if (!conversation.isReadByCustomer) {
    await prisma.contactConversation.update({
      where: { id: conversation.id },
      data: { isReadByCustomer: true }
    });
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'OPEN': return { bg: '#eff6ff', color: '#3b82f6' };
      case 'AWAITING_CUSTOMER': return { bg: '#fef3c7', color: '#d97706' };
      case 'AWAITING_ADMIN': return { bg: '#fce7f3', color: '#db2777' };
      case 'RESOLVED': return { bg: '#ecfdf5', color: '#10b981' };
      case 'CLOSED': 
      case 'SPAM': return { bg: '#f1f5f9', color: '#64748b' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const statusStyle = getStatusColor(conversation.status);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '64px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 20px 40px rgba(115,12,99,0.06)', border: '1px solid #F0DDE5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #F0DDE5', paddingBottom: '24px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', margin: 0 }}>{conversation.subject}</h1>
                <span style={{ 
                  padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', 
                  background: statusStyle.bg, color: statusStyle.color
                }}>
                  {conversation.status.replace('_', ' ')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                <span><strong>ID:</strong> {conversation.conversationId}</span>
                <span><strong>Category:</strong> {conversation.category}</span>
                {conversation.orderId && <span><strong>Order:</strong> {conversation.orderId}</span>}
                <span><strong>Opened:</strong> {new Date(conversation.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            {conversation.messages.map(msg => {
              const isGuest = msg.senderType === 'GUEST';
              return (
                <div key={msg.id.toString()} style={{ display: 'flex', flexDirection: 'column', alignItems: isGuest ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    maxWidth: '80%', 
                    background: isGuest ? '#D63062' : '#f1f5f9', 
                    color: isGuest ? '#fff' : '#111111',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    borderBottomRightRadius: isGuest ? '4px' : '16px',
                    borderBottomLeftRadius: !isGuest ? '4px' : '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: isGuest ? '#fbcfe8' : '#64748b' }}>
                      {isGuest ? 'You' : 'Support Team'} • {new Date(msg.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '15px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {msg.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {conversation.status !== 'CLOSED' && conversation.status !== 'RESOLVED' && (
            <GuestReplyForm conversationId={conversation.conversationId} guestToken={token} />
          )}
          
          {(conversation.status === 'CLOSED' || conversation.status === 'RESOLVED') && (
            <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>
              This conversation is marked as {conversation.status.replace('_', ' ')}. You cannot reply to this thread.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
