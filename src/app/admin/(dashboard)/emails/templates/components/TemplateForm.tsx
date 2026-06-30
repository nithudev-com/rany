'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveTemplate } from '../actions';
import { EmailChannel } from '@prisma/client';

export function TemplateForm({ template }: { template?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await saveTemplate(formData);
    
    if (result.success) {
      router.push('/admin/emails/templates');
    } else {
      setError(result.error || 'Failed to save template');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: '500' }}>
          {error}
        </div>
      )}
      
      {template?.id && <input type="hidden" name="id" value={template.id.toString()} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Template Name (Unique)</label>
          <input 
            name="name" 
            defaultValue={template?.name || ''} 
            required 
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Channel</label>
          <select 
            name="channel" 
            defaultValue={template?.channel || EmailChannel.TRANSACTIONAL}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
          >
            <option value="TRANSACTIONAL">Transactional</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTOMATION">Automation</option>
            <option value="ADMIN">Admin Notification</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Email Subject</label>
        <input 
          name="subject" 
          defaultValue={template?.subject || ''} 
          required 
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>You can use {'{{variables}}'} inside the subject line.</div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>HTML Body</label>
        <textarea 
          name="htmlBody" 
          defaultValue={template?.htmlBody || ''} 
          required 
          rows={10}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
        />
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Content will be safely sanitized before saving.</div>
      </div>
      
      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1e293b' }}>Plain Text Body (Optional fallback)</label>
        <textarea 
          name="textBody" 
          defaultValue={template?.textBody || ''} 
          rows={5}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button 
          type="button" 
          onClick={() => router.push('/admin/emails/templates')}
          style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
}
