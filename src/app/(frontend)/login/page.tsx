'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerLogin } from './actions';
import Link from 'next/link';

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

      <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        <span style={{ padding: '0 12px', fontSize: '12px', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase' }}>Or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button type="button" className="auth-social-button">
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
          Google
        </button>
        <button type="button" className="auth-social-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.62 1.54-1.35 3-2.53 4.08z"/><path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.02 4.5-3.74 4.25z"/></svg>
          Apple
        </button>
      </div>

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
