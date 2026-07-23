'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from './actions';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f1f5f9' }}>
      <div className="form-card" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Admin Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Username</label>
            <input
              name="username"
              type="text"
              className="input"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
            <input
              name="password"
              type="password"
              className="input"
              required
            />
          </div>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit" className="button secondary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
