'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerLogin } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await customerLogin(formData);

    if (result.success) {
      const safeRedirect = callbackUrl.startsWith('/') ? callbackUrl : '/account';
      router.push(safeRedirect);
      router.refresh();
    } else {
      setError(result.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Email Input */}
      <div>
        <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="auth-input"
          placeholder="you@example.com"
          required
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="auth-input"
            placeholder="••••••••"
            required
            style={{ paddingRight: '50px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--brand-primary)',
              fontSize: '12px',
              fontWeight: '700',
              padding: '6px'
            }}
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            style={{ width: '16px', height: '16px', accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
          />
          <label htmlFor="rememberMe" style={{ fontSize: '14px', color: 'var(--muted)', cursor: 'pointer' }}>
            Remember me
          </label>
        </div>
        <Link href="/forgot-password" style={{ fontSize: '14px', color: 'var(--brand-primary)', fontWeight: '600' }}>
          Forgot password?
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="auth-button"
        disabled={loading}
      >
        {loading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            Signing in...
          </span>
        ) : 'Sign In to Your Account'}
      </button>


    </form>
  );
}

export default function CustomerLoginPage() {
  return (
    <main className="auth-wrapper">
      <style dangerouslySetInnerHTML={{__html: "@keyframes spin { 100% { transform: rotate(360deg); } }"}} />
      
      <div className="auth-bg-glow"></div>
      <div className="auth-shape-1"></div>
      <div className="auth-shape-2"></div>

      <div className="auth-card">
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="Rany.uk" style={{ maxHeight: '60px', width: 'auto' }} />
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-black)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Sign in to access your orders, saved items, and personalized recommendations.
          </p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading securely...</div>}>
          <LoginForm />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--muted)' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--brand-primary)', fontWeight: '700', textDecoration: 'none' }}>
            Create one now
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
            By signing in, you confirm you meet the <strong>minimum legal age</strong> required for purchasing adult products.<br/>
            Your connection is secure and private.
          </p>
          <div style={{ marginTop: '12px' }}>
            <Link href="/" style={{ color: 'var(--brand-black)', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Return to Store
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
