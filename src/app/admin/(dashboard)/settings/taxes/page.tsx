'use client';

import { useState, useEffect } from 'react';
import { getTaxSettings, saveTaxConfiguration } from './actions';

export const dynamic = 'force-dynamic';

export default function TaxesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxIncludedInPrices, setTaxIncludedInPrices] = useState(false);
  const [taxRate, setTaxRate] = useState('0.00');

  useEffect(() => {
    async function loadSettings() {
      const settings = await getTaxSettings();
      setTaxEnabled(settings.taxEnabled);
      setTaxIncludedInPrices(settings.taxIncludedInPrices);
      setTaxRate((settings.taxRate * 100).toFixed(2)); // Stored as 0.20, show as 20.00
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Convert percentage string back to decimal (e.g. "20.00" -> 0.20)
    const decimalRate = parseFloat(taxRate) / 100;
    
    const res = await saveTaxConfiguration({
      taxEnabled,
      taxIncludedInPrices,
      taxRate: decimalRate
    });

    setSaving(false);
    if (res.success) {
      alert("Tax settings saved successfully!");
    } else {
      alert("Error saving settings: " + res.error);
    }
  };

  if (loading) {
    return <div>Loading tax configuration...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '800', color: '#111111' }}>Tax Configuration</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>Manage how taxes are calculated and displayed on your storefront.</p>
      
      <div className="card" style={{ padding: '32px', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Enable Tax Calculation</label>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Turn on to apply taxes during checkout.</p>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={taxEnabled}
                onChange={e => setTaxEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#111111' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>Prices Include Tax</label>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>If enabled, prices shown on the store will already include tax (Common in EU). Otherwise, tax is added at checkout (Common in US).</p>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={taxIncludedInPrices}
                onChange={e => setTaxIncludedInPrices(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: '#111111' }}
              />
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '8px' }}>Global Tax Rate (%)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                className="input" 
                value={taxRate} 
                onChange={e => setTaxRate(e.target.value)} 
                style={{ maxWidth: '200px', fontSize: '15px', padding: '12px 16px' }}
                disabled={!taxEnabled}
              />
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>%</span>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>Enter the percentage rate (e.g. 20 for 20% VAT). This applies to all taxable products.</p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <button 
              type="submit" 
              className="button" 
              disabled={saving}
              style={{ padding: '12px 24px', fontSize: '15px', background: '#111111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
