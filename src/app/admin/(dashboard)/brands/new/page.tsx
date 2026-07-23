'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalImageUrl = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Image upload failed');
        const uploadResult = await uploadResponse.json();
        
        const originalUrl = uploadResult.secure_url;
        const urlParts = originalUrl.split('/upload/');
        finalImageUrl = urlParts.length === 2 
          ? `${urlParts[0]}/upload/f_auto,q_auto/${urlParts[1]}` 
          : originalUrl;
      }

      const formElements = e.currentTarget.elements as any;
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formElements.name.value,
          slug: formElements.slug.value,
          seoDescription: formElements.description?.value || '',
          logo: finalImageUrl,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }

      alert('Brand saved successfully!');
      router.push('/admin/brands');
      router.refresh();
      
    } catch (error: any) {
      console.error('Error during submission:', error);
      alert(error.message || 'Error saving brand. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '32px' }}>Add New Brand</h1>
      <form onSubmit={handleSubmit} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Brand Name</label>
          <input type="text" name="name" className="input" required />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Brand Logo</label>
          <input 
            type="file" 
            accept="image/*" 
            className="input" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
            Logo will be automatically optimized via Cloudinary
          </small>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Slug</label>
          <input type="text" name="slug" className="input" placeholder="leave blank to auto-generate" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description (SEO)</label>
          <textarea name="description" className="input" style={{ minHeight: '100px' }}></textarea>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="button secondary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Brand'}
          </button>
          <button type="button" className="button" onClick={() => router.back()} style={{ background: '#e2e8f0', color: '#1e293b' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
