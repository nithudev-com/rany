'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';

export default function CurrencyManagerPage() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [exchangeRate, setExchangeRate] = useState('1.0000');
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const fetchCurrencies = async () => {
    try {
      const res = await fetch('/api/currencies');
      if (!res.ok) throw new Error('Failed to fetch currencies');
      const data = await res.json();
      setCurrencies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setSymbol('');
    setExchangeRate('1.0000');
    setIsDefault(false);
    setIsActive(true);
  };

  const handleEdit = (curr: any) => {
    setEditingId(curr.id);
    setCode(curr.code);
    setName(curr.name);
    setSymbol(curr.symbol);
    setExchangeRate(curr.exchangeRate);
    setIsDefault(curr.isDefault);
    setIsActive(curr.isActive);
  };

  const handleDelete = async (id: string, isDefaultCurr: boolean) => {
    if (isDefaultCurr) {
      alert('You cannot delete the default currency.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this currency?')) return;
    
    try {
      const res = await fetch(`/api/currencies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      fetchCurrencies();
    } catch (error) {
      alert('Error deleting currency');
    }
  };

  const handleSetDefault = async (curr: any) => {
    if (curr.isDefault) return;
    try {
      const res = await fetch(`/api/currencies/${curr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...curr, isDefault: true }),
      });
      if (!res.ok) throw new Error();
      fetchCurrencies();
    } catch (error) {
      alert('Failed to update default currency.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      code: code.toUpperCase(),
      name,
      symbol,
      exchangeRate: Number(exchangeRate),
      isDefault,
      isActive,
    };

    try {
      const url = editingId ? `/api/currencies/${editingId}` : '/api/currencies';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }
      
      resetForm();
      fetchCurrencies();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px' }}>Currency Manager</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        
        {/* TABLE */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Active Currencies</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px' }}>Currency</th>
                <th style={{ padding: '12px 8px' }}>Code</th>
                <th style={{ padding: '12px 8px' }}>Symbol</th>
                <th style={{ padding: '12px 8px' }}>Exchange Rate</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>No currencies found. Add your base currency first.</td></tr>
              ) : (
                currencies.map(curr => (
                  <tr key={curr.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                      {curr.name}
                      {curr.isDefault && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>DEFAULT</span>}
                    </td>
                    <td style={{ padding: '12px 8px' }}>{curr.code}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{curr.symbol}</td>
                    <td style={{ padding: '12px 8px' }}>{Number(curr.exchangeRate).toFixed(4)}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ color: curr.isActive ? '#16a34a' : '#ef4444' }}>{curr.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!curr.isDefault && (
                          <button onClick={() => handleSetDefault(curr)} className="button" style={{ padding: '4px 8px', fontSize: '12px' }}>Make Default</button>
                        )}
                        <button onClick={() => handleEdit(curr)} className="button" style={{ padding: '4px 8px', fontSize: '12px', background: '#e2e8f0', color: '#1e293b' }}>Edit</button>
                        <button onClick={() => handleDelete(curr.id, curr.isDefault)} className="button" style={{ padding: '4px 8px', fontSize: '12px', background: '#fee2e2', color: '#ef4444' }} disabled={curr.isDefault}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingId ? 'Edit Currency' : 'Add Currency'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Currency Code</label>
              <input type="text" className="input" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. USD" required maxLength={3} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Name</label>
              <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. US Dollar" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Symbol</label>
              <input type="text" className="input" value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="e.g. $" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Exchange Rate</label>
              <input type="number" step="0.0001" className="input" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} required />
              <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>Multiplier relative to your base currency. Set 1.0000 for your default.</small>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} />
              <label htmlFor="isDefault" style={{ cursor: 'pointer', fontSize: '14px' }}>Set as Default Currency</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              <label htmlFor="isActive" style={{ cursor: 'pointer', fontSize: '14px' }}>Active</label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button type="submit" className="button secondary" style={{ flex: 1 }}>{editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" onClick={resetForm} className="button" style={{ background: '#e2e8f0', color: '#1e293b' }}>Cancel</button>}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
