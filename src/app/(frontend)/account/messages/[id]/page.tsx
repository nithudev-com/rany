import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { CustomerReplyForm } from './components/CustomerReplyForm';

export default async function ConversationThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) redirect('/login');
  const customerId = String(customerIdStr);

  const conversation = await prisma.contactConversation.findUnique({
    where: { conversationId: id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  if (!conversation || conversation.customerId !== customerId) {
    notFound();
  }

  // Mark as read by customer if they view it
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <Link href="/account/messages" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '600', fontSize: '14px', alignSelf: 'flex-start' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back to Messages
      </Link>

      <div className="dashboard-card" style={{ padding: '40px' }}>
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
            const isCustomer = msg.senderType === 'CUSTOMER' || msg.senderType === 'GUEST';
            return (
              <div key={msg.id.toString()} style={{ display: 'flex', flexDirection: 'column', alignItems: isCustomer ? 'flex-end' : 'flex-start' }}>
                <div style={{ 
                  maxWidth: '80%', 
                  background: isCustomer ? '#D63062' : '#f1f5f9', 
                  color: isCustomer ? '#fff' : '#111111',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isCustomer ? '4px' : '16px',
                  borderBottomLeftRadius: !isCustomer ? '4px' : '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: isCustomer ? '#fbcfe8' : '#64748b' }}>
                    {isCustomer ? 'You' : 'Support Team'} • {new Date(msg.createdAt).toLocaleString()}
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
          <CustomerReplyForm conversationId={conversation.conversationId} />
        )}
        
        {(conversation.status === 'CLOSED' || conversation.status === 'RESOLVED') && (
          <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '12px', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>
            This conversation is marked as {conversation.status.replace('_', ' ')}. You cannot reply to this thread.
          </div>
        )}
      </div>
    </div>
  );
}
