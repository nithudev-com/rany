'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditBrandForm({ brand }: { brand: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [name, setName] = useState(brand.name || '');
  const [slug, setSlug] = useState(brand.slug || '');
  const [description, setDescription] = useState(brand.seoDescription || '');
  
  // Safe parsing for faqs in case it comes from DB as a string or array
  const initialFaqs = Array.isArray(brand.faqs) ? brand.faqs : (typeof brand.faqs === 'string' ? JSON.parse(brand.faqs) : []);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>(initialFaqs);

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index: number) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };

  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalImageUrl = brand.logo;
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

      const res = await fetch(`/api/brands/${brand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          seoDescription: description,
          logo: finalImageUrl,
          faqs,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update brand');
      }

      alert('Brand updated successfully!');
      router.push('/admin/brands');
      router.refresh();
      
    } catch (error: any) {
      console.error('Error during submission:', error);
      alert(error.message || 'Error updating brand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={{ marginBottom: '32px' }}>Edit Brand: {brand.name}</h1>
      <form onSubmit={handleSubmit} className="form-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Brand Name</label>
          <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Update Brand Logo</label>
          {brand.logo && !imageFile && (
            <div style={{ marginBottom: '8px' }}>
              <img src={brand.logo} alt="Current" style={{ height: '100px', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
            </div>
          )}
          <input 
            type="file" 
            accept="image/*" 
            className="input" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Slug</label>
          <input type="text" className="input" value={slug} onChange={e => setSlug(e.target.value)} required />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description (SEO)</label>
          <textarea className="input" style={{ minHeight: '100px' }} value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold' }}>Frequently Asked Questions</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {faqs.map((faq, index) => (
              <div key={index} style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#475569' }}>FAQ #{index + 1}</span>
                  <button type="button" onClick={() => handleRemoveFaq(index)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                    Remove
                  </button>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#334155' }}>Question</label>
                  <input type="text" className="input" value={faq.question} onChange={e => handleFaqChange(index, 'question', e.target.value)} placeholder="e.g. Are these products safe?" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#334155' }}>Answer</label>
                  <textarea className="input" style={{ minHeight: '80px' }} value={faq.answer} onChange={e => handleFaqChange(index, 'answer', e.target.value)} placeholder="Answer goes here..." required></textarea>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={handleAddFaq} className="button" style={{ marginTop: '16px', background: '#f1f5f9', color: '#0f172a', border: '1px dashed #cbd5e1', width: '100%' }}>
            + Add New FAQ
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="button secondary" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Changes'}
          </button>
          <button type="button" className="button" onClick={() => router.back()} style={{ background: '#e2e8f0', color: '#1e293b' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
