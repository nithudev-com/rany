'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AIProductResponse } from '@/services/ai';

export const dynamic = 'force-dynamic';

export default function AIProductManager() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<AIProductResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error('Generation failed');
      
      const data = await res.json();
      setAiData(data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate product');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Here we would call a server action or API route to save to Prisma
    alert('Product Draft Saved Successfully (Simulation)');
    router.push('/admin/products');
  };

  return (
    <div style={{ maxWidth: '1000px', paddingBottom: '60px' }}>
      <h1 style={{ marginBottom: '8px' }}>AI Product Manager</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Quickly generate SEO-optimized product content using AI.</p>

      {!aiData ? (
        <form onSubmit={handleGenerate} className="card" style={{ padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Quick Product Generation</h2>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Enter basic product details</label>
          <textarea
            className="input"
            style={{ minHeight: '120px', marginBottom: '16px', width: '100%', padding: '12px' }}
            placeholder="e.g., A wireless gaming mouse with RGB lighting, 16000 DPI, and a 50-hour battery life. $49.99."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button type="submit" className="button secondary" disabled={loading} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            {loading ? 'Generating 100% Accurate Draft...' : '✨ Generate AI Draft'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <h2 style={{ color: '#166534', margin: '0 0 16px 0' }}>AI Draft Generated!</h2>
            <p style={{ color: '#15803d', margin: 0 }}>Review the suggested fields below. You can edit any field before saving.</p>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>Customer Product Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Customer Title</label>
                <input type="text" className="input" defaultValue={aiData.product.title} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Product Type</label>
                  <input type="text" className="input" defaultValue={aiData.product.productType} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Brand</label>
                  <input type="text" className="input" defaultValue={aiData.product.brand} style={{ width: '100%', padding: '8px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Short Description</label>
                <textarea className="input" defaultValue={aiData.product.shortDescription} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ border: '1px solid #e2e8f0', padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px' }}>SEO & Metadata</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>SEO Title</label>
                <input type="text" className="input" defaultValue={aiData.seo.seoTitle} style={{ width: '100%', padding: '8px' }} />
                <small style={{ color: '#64748b' }}>Suggested length: 50-60 chars</small>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Meta Description</label>
                <textarea className="input" defaultValue={aiData.seo.metaDescription} style={{ width: '100%', padding: '8px', minHeight: '80px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>URL Slug</label>
                <input type="text" className="input" defaultValue={aiData.seo.slug} style={{ width: '100%', padding: '8px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <button onClick={handleSaveDraft} className="button secondary" style={{ padding: '12px 24px', cursor: 'pointer', background: '#0f172a', color: 'white' }}>
              Save AI Product Draft
            </button>
            <button onClick={() => setAiData(null)} className="button" style={{ padding: '12px 24px', cursor: 'pointer', background: '#e2e8f0' }}>
              Discard & Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
