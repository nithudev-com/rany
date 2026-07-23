import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { NewMessageButton } from './components/NewMessageButton';

export default async function CustomerMessagesPage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) redirect('/login');
  const customerId = String(customerIdStr);

  const conversations = await prisma.contactConversation.findMany({
    where: { customerId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 }
    }
  });

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

  return (
    <div className="dashboard-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div className="dashboard-flex-header" style={{ padding: '32px', borderBottom: '1px solid #F0DDE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111111', marginBottom: '8px' }}>Messages & Support</h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>View your support history and active conversations.</p>
        </div>
        <NewMessageButton />
      </div>

      {conversations.length === 0 ? (
        <div style={{ padding: '48px 32px', textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111111', margin: '0 0 8px 0' }}>No messages yet</h3>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>If you need help, feel free to send us a message!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #F0DDE5' }}>
                <th style={{ padding: '16px 32px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
                <th style={{ padding: '16px 32px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 32px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Message</th>
                <th style={{ padding: '16px 32px' }}></th>
              </tr>
            </thead>
            <tbody>
              {conversations.map(conv => {
                const statusStyle = getStatusColor(conv.status);
                const isUnread = !conv.isReadByCustomer;
                return (
                  <tr key={conv.conversationId} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', background: isUnread ? '#fffbfa' : 'transparent' }}>
                    <td style={{ padding: '20px 32px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D63062' }}></span>}
                        <div style={{ fontWeight: isUnread ? '800' : '700', color: '#111111', fontSize: '15px' }}>{conv.subject}</div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{conv.category} {conv.orderId ? `• Order: ${conv.orderId}` : ''}</div>
                    </td>
                    <td style={{ padding: '20px 32px' }}>
                      <span style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        background: statusStyle.bg, 
                        color: statusStyle.color,
                        display: 'inline-block'
                      }}>
                        {conv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '20px 32px', fontSize: '14px', color: '#475569' }}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                      <Link href={`/account/messages/${conv.conversationId}`} style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid #F0DDE5',
                        background: '#fff',
                        color: '#730C63',
                        fontSize: '13px',
                        fontWeight: '700',
                        textDecoration: 'none',
                        transition: '0.2s'
                      }}>
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
