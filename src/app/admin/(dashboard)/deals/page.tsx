'use client';

import { useState, useEffect } from 'react';
import { getAdminProductsForDeals, updateProductDeal } from './actions';

export default function DealsManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await getAdminProductsForDeals();
    if (res.success) {
      setProducts(res.products || []);
    }
    setLoading(false);
  };

  const handleSaveDeal = async (productId: string, currentSalePrice: string, currentSaleEndDate: string) => {
    setSavingId(productId);
    const res = await updateProductDeal(productId, currentSalePrice, currentSaleEndDate);
    if (!res.success) {
      alert("Error saving deal: " + res.error);
    }
    setSavingId(null);
  };

  const handleFieldChange = (id: string, field: string, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading products...</div>;
  }

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111111', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Deals Management</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Quickly set sale prices to automatically feature products on the Today's Deals page.</p>
        </div>
        <div>
          <input 
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontSize: '14px',
              width: '250px'
            }}
          />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Product</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Base Price</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Sale Price (Deal)</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Deal Ends At</th>
              <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#475569', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              const isDealActive = parseFloat(product.salePrice) > 0;
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9', background: isDealActive ? '#fdf8fb' : 'transparent' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                        {product.mainImage && <img src={product.mainImage} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ fontWeight: '600', color: '#111111', fontSize: '14px' }}>{product.title}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', background: product.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9', color: product.status === 'ACTIVE' ? '#10b981' : '#64748b' }}>
                      {product.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500', color: '#64748b' }}>
                    ${parseFloat(product.basePrice).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#94a3b8', fontWeight: '600' }}>£</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={product.salePrice}
                        onChange={(e) => handleFieldChange(product.id, 'salePrice', e.target.value)}
                        placeholder="0.00"
                        style={{ 
                          width: '100px', 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid #cbd5e1', 
                          outline: 'none', 
                          fontSize: '14px',
                          fontWeight: '600',
                        color: '#D63062'
                      }} 
                    />
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <input 
                    type="datetime-local" 
                    value={product.saleEndDate ? product.saleEndDate.slice(0, 16) : ''}
                    onChange={(e) => handleFieldChange(product.id, 'saleEndDate', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      border: '1px solid #cbd5e1', 
                      outline: 'none', 
                      fontSize: '13px',
                      color: '#475569'
                    }} 
                  />
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <button 
                    onClick={() => handleSaveDeal(product.id, product.salePrice, product.saleEndDate)}
                    disabled={savingId === product.id}
                      style={{
                        background: '#111111',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        opacity: savingId === product.id ? 0.5 : 1
                      }}
                    >
                      {savingId === product.id ? 'Saving...' : 'Save Deal'}
                    </button>
                    {isDealActive && (
                      <button 
                        onClick={() => {
                          handleFieldChange(product.id, 'salePrice', '');
                          handleFieldChange(product.id, 'saleEndDate', '');
                          handleSaveDeal(product.id, '', '');
                        }}
                        style={{
                          background: 'transparent',
                          color: '#E71C25',
                          border: 'none',
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        Remove Deal
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
