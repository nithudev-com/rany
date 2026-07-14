'use client';
import { useState } from 'react';
import Link from 'next/link';
import DeleteButton from './DeleteButton';
import { bulkUpdateInventory, bulkUpdatePricePercentage } from './actions';

export function ProductListClient({ initialProducts }: { initialProducts: any[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Bulk Action States
  const [showBulkInventory, setShowBulkInventory] = useState(false);
  const [inventoryValue, setInventoryValue] = useState<string>('');
  
  const [showBulkPrice, setShowBulkPrice] = useState(false);
  const [pricePercentValue, setPricePercentValue] = useState<string>('');

  const toggleSelectAll = () => {
    if (selectedIds.size === initialProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(initialProducts.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkInventorySubmit = async () => {
    const val = parseInt(inventoryValue, 10);
    if (isNaN(val) || val < 0) {
      alert("Please enter a valid stock quantity (0 or greater).");
      return;
    }
    
    setIsUpdating(true);
    const res = await bulkUpdateInventory(Array.from(selectedIds), val);
    setIsUpdating(false);
    
    if (res.success) {
      alert("Inventory updated successfully!");
      setShowBulkInventory(false);
      setInventoryValue('');
      setSelectedIds(new Set());
    } else {
      alert(res.error || "Update failed");
    }
  };

  const handleBulkPriceSubmit = async () => {
    const val = parseFloat(pricePercentValue);
    if (isNaN(val)) {
      alert("Please enter a valid percentage number (e.g. 10 for +10%, -10 for -10%).");
      return;
    }
    
    setIsUpdating(true);
    const res = await bulkUpdatePricePercentage(Array.from(selectedIds), val);
    setIsUpdating(false);
    
    if (res.success) {
      alert("Prices updated successfully!");
      setShowBulkPrice(false);
      setPricePercentValue('');
      setSelectedIds(new Set());
    } else {
      alert(res.error || "Update failed");
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      
      {selectedIds.size > 0 && (
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: '600', color: '#0f172a' }}>
            {selectedIds.size} products selected
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* INVENTORY BULK TOOL */}
            {showBulkInventory ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  min="0"
                  placeholder="New Stock Qty"
                  value={inventoryValue}
                  onChange={e => setInventoryValue(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <button disabled={isUpdating} onClick={handleBulkInventorySubmit} style={{ background: '#10b981', color: 'white', padding: '6px 16px', borderRadius: '6px', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Apply</button>
                <button onClick={() => setShowBulkInventory(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : showBulkPrice ? null : (
              <button onClick={() => setShowBulkInventory(true)} style={{ background: 'white', color: '#0f172a', padding: '6px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: '500', cursor: 'pointer' }}>
                Bulk Edit Inventory
              </button>
            )}

            {/* PRICE BULK TOOL */}
            {showBulkPrice ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="% (e.g. 10 or -10)"
                  value={pricePercentValue}
                  onChange={e => setPricePercentValue(e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '150px' }}
                />
                <button disabled={isUpdating} onClick={handleBulkPriceSubmit} style={{ background: '#10b981', color: 'white', padding: '6px 16px', borderRadius: '6px', border: 'none', fontWeight: '500', cursor: 'pointer' }}>Apply</button>
                <button onClick={() => setShowBulkPrice(false)} style={{ background: 'transparent', color: '#64748b', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>
            ) : showBulkInventory ? null : (
              <button onClick={() => setShowBulkPrice(true)} style={{ background: 'white', color: '#0f172a', padding: '6px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: '500', cursor: 'pointer' }}>
                Bulk Edit Price (%)
              </button>
            )}
          </div>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '12px 16px', width: '40px' }}>
              <input 
                type="checkbox" 
                checked={selectedIds.size === initialProducts.length && initialProducts.length > 0}
                onChange={toggleSelectAll}
                style={{ cursor: 'pointer' }}
              />
            </th>
            <th style={{ padding: '12px 0' }}>Product</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody style={{ opacity: isUpdating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {initialProducts.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '12px 16px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  style={{ cursor: 'pointer' }}
                />
              </td>
              <td style={{ padding: '12px 0' }}>{p.title}</td>
              <td>{p.sku}</td>
              <td>{p.categoryName}</td>
              <td>{p.formattedPrice}</td>
              <td>{p.stockQuantity}</td>
              <td>{p.status}</td>
              <td>
                <Link href={`/admin/products/${p.id}/edit`} style={{ color: 'var(--accent)', marginRight: '12px' }}>Edit</Link>
                <DeleteButton id={p.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {initialProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
          No products found. Add one to get started.
        </div>
      )}
    </div>
  );
}
