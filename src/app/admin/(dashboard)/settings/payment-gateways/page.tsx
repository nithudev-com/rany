'use client';

import { useState, useEffect } from 'react';
import { getMonirizeGateway, updateMonirizeGateway } from './actions';

export const dynamic = 'force-dynamic';

export default function PaymentGatewaysPage() {
  const [gateway, setGateway] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMonirizeGateway().then(data => {
      setGateway(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const formData = new FormData(e.currentTarget);
    await updateMonirizeGateway(formData);
    
    setMessage('Monirize configuration saved successfully.');
    
    // Refresh data
    const updated = await getMonirizeGateway();
    setGateway(updated);
    setSaving(false);
    
    // Clear secret key input
    const form = e.target as HTMLFormElement;
    form.secretKey.value = '';
  };

  if (loading) return <div>Loading payment gateways...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Payment Gateways</h1>
      
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: gateway.isActive ? '#10b981' : '#ef4444' }}></div>
          Monirize Integration
        </h2>
        
        {message && (
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '600' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Merchant ID</label>
              <input 
                name="merchantId" 
                defaultValue={gateway.merchantId} 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>Public Key</label>
              <input 
                name="publicKey" 
                defaultValue={gateway.publicKey} 
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1' }}>
              <label style={{ fontWeight: '600', fontSize: '14px' }}>
                Secret Key
                {gateway.hasSecretKey && <span style={{ color: '#10b981', marginLeft: '8px', fontSize: '12px' }}>(Saved securely)</span>}
              </label>
              <input 
                name="secretKey" 
                type="password" 
                placeholder={gateway.hasSecretKey ? "•••••••••••••••• (Leave blank to keep current)" : "Enter secret key"}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
              />
            </div>

          </div>

          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" defaultChecked={gateway.isActive} style={{ width: '18px', height: '18px' }} />
              Enable Monirize
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
              <input type="checkbox" name="isTestMode" defaultChecked={gateway.isTestMode} style={{ width: '18px', height: '18px' }} />
              Test Mode
            </label>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              background: '#0f172a', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '8px', 
              fontWeight: '600',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </form>
      </div>
    </div>
  );
}
