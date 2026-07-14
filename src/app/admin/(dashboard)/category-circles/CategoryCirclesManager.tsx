'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface CategoryCircleData {
  id: string;
  name: string;
  image: string;
  url: string;
  sortOrder: number;
}

export default function CategoryCirclesManager({ initialItems }: { initialItems: CategoryCircleData[] }) {
  const router = useRouter();
  const [items, setItems] = useState<CategoryCircleData[]>(initialItems);
  const [editingItem, setEditingItem] = useState<CategoryCircleData | null>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const startEdit = (item: CategoryCircleData) => {
    setEditingItem(item);
    setName(item.name);
    setImage(item.image);
    setUrl(item.url);
    setSortOrder(item.sortOrder.toString());
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setName('');
    setImage('');
    setUrl('');
    setSortOrder('0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image || !url) {
      alert('Please fill out all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/category-circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem?.id,
          name,
          image,
          url,
          sortOrder: parseInt(sortOrder) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      const responseData = await res.json();
      
      if (editingItem) {
        setItems(prev => prev.map(item => item.id === editingItem.id ? responseData.item : item).sort((a,b) => a.sortOrder - b.sortOrder));
      } else {
        setItems(prev => [...prev, responseData.item].sort((a,b) => a.sortOrder - b.sortOrder));
      }
      
      cancelEdit();
      alert('Saved successfully!');
      router.refresh();
    } catch (err) {
      alert('Error saving category circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/category-circles?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      
      setItems(prev => prev.filter(item => item.id !== id));
      alert('Deleted successfully!');
      router.refresh();
    } catch (err) {
      alert('Error deleting item');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Category Circles Management</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        
        {/* Left Column: Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
            {editingItem ? '✍️ Edit Category Circle' : '➕ Add Category Circle'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Vibrators"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Image URL</label>
              <input 
                type="text" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Redirect URL / Path</label>
              <input 
                type="text" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                placeholder="e.g. /category/vibrators"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Sort Order</label>
              <input 
                type="number" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                style={{ 
                  flex: 1, 
                  background: '#ff3e7e', 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              {editingItem && (
                <button 
                  type="button" 
                  onClick={cancelEdit} 
                  style={{ 
                    background: '#64748b', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontWeight: '600', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Listing Table */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Current Circles</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#475569' }}>Preview</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#475569' }}>Name</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#475569' }}>URL</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#475569' }}>Sort Order</th>
                <th style={{ padding: '12px 8px', fontSize: '14px', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(224, 204, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(224, 204, 255, 0.4)', padding: '4px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{item.name}</td>
                  <td style={{ padding: '12px 8px', color: '#64748b', fontSize: '14px' }}>{item.url}</td>
                  <td style={{ padding: '12px 8px', fontWeight: '500', color: '#334155' }}>{item.sortOrder}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <button 
                      onClick={() => startEdit(item)} 
                      style={{ marginRight: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      disabled={isDeletingId === item.id}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      {isDeletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No Category Circles added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
