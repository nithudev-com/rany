'use client';

import { useState } from 'react';

export default function InlineBrandActiveToggle({ brandId, initialShowOnHome }: { brandId: string, initialShowOnHome: boolean }) {
  const [isActive, setIsActive] = useState(initialShowOnHome);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const newStatus = !isActive;
      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showOnHome: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update brand status');
      }

      setIsActive(newStatus);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to update brand status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      title={isActive ? "Hide from Homepage Marquee" : "Show on Homepage Marquee"}
      style={{
        background: isActive ? '#10b981' : '#cbd5e1',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'background 0.2s',
        display: 'inline-block',
        minWidth: '40px',
        textAlign: 'center'
      }}
    >
      {isActive ? 'ON' : 'OFF'}
    </button>
  );
}
