'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function MonirizeMockContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const merchantId = searchParams.get('merchantId');
  const orderRef = searchParams.get('orderRef');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const signature = searchParams.get('signature');
  const token = searchParams.get('token');

  // Verify parameters
  if (!merchantId || !orderRef || !amount || !currency || !signature || !token) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ color: 'red' }}>Error</h1>
        <p>Missing required parameters for Monirize checkout simulation.</p>
        <Link href="/checkout">Back to checkout</Link>
      </div>
    );
  }

  const handleSimulatePayment = async (resultStatus: 'SUCCESS' | 'FAILED') => {
    setLoading(true);
    setStatus('Processing...');
    
    // Simulate latency
    await new Promise(r => setTimeout(r, 1500));

    try {
      // Hit the webhook endpoint
      const response = await fetch('/api/webhooks/monirize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature,
          merchantId,
          orderRef,
          transactionRef: `MNZ-${Date.now()}`,
          amount,
          currency,
          status: resultStatus
        })
      });

      if (response.ok) {
        setStatus(`Webhook sent successfully. Result: ${resultStatus}`);
        if (resultStatus === 'SUCCESS') {
          setTimeout(() => {
            window.location.href = `/checkout/success?token=${token}`;
          }, 1500);
        } else {
          setTimeout(() => {
            window.location.href = `/checkout/failure?token=${token}`;
          }, 1500);
        }
      } else {
        const errorData = await response.json();
        setStatus(`Webhook failed: ${errorData.error}`);
        setLoading(false);
      }
    } catch (err) {
      setStatus(`Network error hitting webhook.`);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#0f172a' }}>Monirize Payment Gateway Simulator</h1>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '12px' }}>Order Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
            <span style={{ color: '#64748b' }}>Order Ref:</span>
            <span style={{ fontWeight: '500' }}>{orderRef}</span>
            <span style={{ color: '#64748b' }}>Amount:</span>
            <span style={{ fontWeight: 'bold', color: '#10b981' }}>{currency} {Number(amount).toFixed(2)}</span>
            <span style={{ color: '#64748b' }}>Merchant ID:</span>
            <span style={{ fontWeight: '500' }}>{merchantId}</span>
          </div>
        </div>

        {status && (
          <div style={{ padding: '16px', background: '#eff6ff', color: '#1e40af', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' }}>
            {status}
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => handleSimulatePayment('SUCCESS')}
            disabled={loading}
            style={{ flex: 1, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Simulate SUCCESS
          </button>
          <button 
            onClick={() => handleSimulatePayment('FAILED')}
            disabled={loading}
            style={{ flex: 1, padding: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            Simulate FAILED
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MonirizeMockPage() {
  return (
    <Suspense fallback={<div>Loading simulated gateway...</div>}>
      <MonirizeMockContent />
    </Suspense>
  );
}
