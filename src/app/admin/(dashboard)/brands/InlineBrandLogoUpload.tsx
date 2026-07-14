'use client';

import { useState, useRef } from 'react';

export default function InlineBrandLogoUpload({ brandId, initialLogo }: { brandId: string, initialLogo: string | null }) {
  const [logo, setLogo] = useState(initialLogo);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        throw new Error(errorData?.error || 'Image upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      
      const originalUrl = uploadResult.secure_url;
      const urlParts = originalUrl.split('/upload/');
      const finalImageUrl = urlParts.length === 2 
        ? `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}` 
        : originalUrl;

      const updateResponse = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo: finalImageUrl }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update brand logo');
      }

      setLogo(finalImageUrl);
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {logo ? (
        <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border)' }} />
      ) : (
        <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#94a3b8' }}>None</div>
      )}
      
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleUpload}
      />
      
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        title="Quick Update Logo"
        style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#475569', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' }}
      >
        {loading ? '...' : 'Upload'}
      </button>
    </div>
  );
}
