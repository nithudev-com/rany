import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProfileForm } from './components/ProfileForm';
import { SecurityForm } from './components/SecurityForm';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const customerIdStr = cookieStore.get('customer_auth')?.value;
  
  if (!customerIdStr) {
    redirect('/login');
  }
  const customerId = String(customerIdStr);

  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  });

  if (!customer) {
    redirect('/login');
  }

  // Ensure we NEVER send the raw password hash down to the client component
  const { passwordHash, ...safeCustomer } = customer;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="dashboard-card" style={{ padding: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#111111', marginBottom: '8px' }}>Profile Settings</h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 32px 0' }}>Manage your personal details and contact preferences.</p>
        
        <ProfileForm customer={safeCustomer} />
      </div>

      <div className="dashboard-card" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111111', marginBottom: '8px' }}>Email & Password Security</h2>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 32px 0' }}>Update your authentication credentials securely.</p>
        
        <SecurityForm currentEmail={safeCustomer.email} />
      </div>

      {/* Two-Factor Authentication Mock UI */}
      <div className="dashboard-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#111111', marginBottom: '8px' }}>Two-Factor Authentication (2FA)</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Add an extra layer of security to your account.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Status: <span style={{ color: '#ef4444' }}>Disabled</span></span>
            
            {/* CSS-only Toggle Switch (Mock) */}
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
              <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: '#cbd5e1', transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '18px', width: '18px', left: '4px', bottom: '4px',
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                }}></span>
              </span>
            </label>

          </div>
        </div>
      </div>

    </div>
  );
}
