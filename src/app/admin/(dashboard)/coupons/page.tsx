'use client';

import { useState, useEffect } from 'react';
import { getCoupons, saveCoupon, deleteCoupon } from './actions';

export const dynamic = 'force-dynamic';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCouponsList = async () => {
    setLoading(true);
    const res = await getCoupons();
    if (res.success) {
      setCoupons(res.coupons || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCouponsList();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue('');
    setMinOrderValue('');
    setUsageLimit('');
    setExpiresAt('');
    setIsActive(true);
  };

  const handleEdit = (curr: any) => {
    setEditingId(curr.id);
    setCode(curr.code);
    setDiscountType(curr.discountType);
    setDiscountValue(curr.discountValue);
    setMinOrderValue(curr.minOrderValue || '');
    setUsageLimit(curr.usageLimit ? curr.usageLimit.toString() : '');
    setExpiresAt(curr.expiresAt ? new Date(curr.expiresAt).toISOString().slice(0, 16) : '');
    setIsActive(curr.isActive);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    const res = await deleteCoupon(id);
    if (res.success) {
      fetchCouponsList();
    } else {
      alert('Error deleting coupon: ' + res.error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      id: editingId || undefined,
      code,
      discountType,
      discountValue,
      minOrderValue,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      expiresAt,
      isActive,
    };

    const res = await saveCoupon(payload);
    
    if (res.success) {
      resetForm();
      fetchCouponsList();
    } else {
      alert('Error: ' + res.error);
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '800', color: '#111111' }}>Coupons & Discounts</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        
        {/* TABLE */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Active Coupons</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: '700' }}>Code</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: '700' }}>Value</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: '700' }}>Usage</th>
                <th style={{ padding: '12px 8px', color: '#64748b', fontWeight: '700' }}>Expires</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: '#64748b', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No coupons found. Create your first discount code.</td></tr>
              ) : (
                coupons.map(curr => {
                  const isExpired = curr.expiresAt && new Date(curr.expiresAt) < new Date();
                  
                  return (
                  <tr key={curr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 8px', fontWeight: '800', color: '#D63062' }}>
                      {curr.code}
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: '600', color: '#0f172a' }}>
                      {curr.discountType === 'PERCENTAGE' ? `${curr.discountValue}%` : `$${curr.discountValue}`}
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      {isExpired ? (
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 8px', background: '#fee2e2', color: '#ef4444', borderRadius: '4px' }}>EXPIRED</span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 8px', background: curr.isActive ? '#dcfce7' : '#f1f5f9', color: curr.isActive ? '#16a34a' : '#64748b', borderRadius: '4px' }}>
                          {curr.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#64748b' }}>
                      {curr.usageCount} {curr.usageLimit ? `/ ${curr.usageLimit}` : ''}
                    </td>
                    <td style={{ padding: '16px 8px', color: '#64748b', fontSize: '12px' }}>
                      {curr.expiresAt ? new Date(curr.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(curr)} style={{ padding: '6px 12px', fontSize: '12px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(curr.id)} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#ef4444', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>

        {/* FORM */}
        <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#fff', alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a' }}>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Coupon Code</label>
              <input type="text" className="input" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Type</label>
                <select className="input" value={discountType} onChange={e => setDiscountType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Value</label>
                <input type="number" step="0.01" className="input" value={discountValue} onChange={e => setDiscountValue(e.target.value)} required placeholder="e.g. 20" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Minimum Order Value ($)</label>
              <input type="number" step="0.01" className="input" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)} placeholder="Optional" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Usage Limit</label>
              <input type="number" className="input" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="Leave blank for unlimited" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: '#475569' }}>Expires At</label>
              <input type="datetime-local" className="input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569' }} />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#111111' }} />
              <label htmlFor="isActive" style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>Active Status</label>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={{ flex: 1, padding: '12px', background: '#111111', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>{editingId ? 'Update Coupon' : 'Create Coupon'}</button>
              {editingId && <button type="button" onClick={resetForm} style={{ padding: '12px', background: '#f1f5f9', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
