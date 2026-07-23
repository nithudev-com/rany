'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerRegister, sendRegistrationOtp } from '../login/actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Simple password strength calculation
function calculatePasswordStrength(password: string) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '#e2e8f0' };
  
  if (password.length > 7) score += 1;
  if (password.length > 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score < 4) return { score, label: 'Good', color: '#f59e0b' };
  return { score, label: 'Strong', color: '#10b981' };
}

function RegisterForm() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  
  const strength = calculatePasswordStrength(password);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';

  // Inline Validation: Check if passwords match
  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [password, confirmPassword]);

  const sendOtp = async () => {
    setLoading(true);
    setError('');
    const formElement = document.getElementById('registerForm') as HTMLFormElement;
    const formData = new FormData(formElement);
    const email = formData.get('email') as string;
    const firstName = formData.get('firstName') as string;
    
    if (!email || !firstName) {
      setError('First name and email are required to send OTP.');
      setLoading(false);
      return;
    }

    const res = await sendRegistrationOtp(email, firstName);
    setLoading(false);
    
    if (res.success) {
      setOtpSent(true);
      setStep(4);
    } else {
      setError(res.error || 'Failed to send OTP.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (otp.join('').length !== 4) {
      setError('Please enter the valid 4-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');

    // If e is a form event, get formData, else we must construct it from state/DOM
    const formElement = document.getElementById('registerForm') as HTMLFormElement;
    const formData = new FormData(formElement);
    formData.append('otp', otp.join(''));
    
    const result = await customerRegister(formData);

    if (result.success) {
      const safeRedirect = callbackUrl.startsWith('/') ? callbackUrl : '/account';
      router.push(safeRedirect);
      router.refresh();
    } else {
      setError(result.error || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Only 1 char
    if (!/^\d*$/.test(value)) return; // Only numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <form id="registerForm" onSubmit={(e) => { e.preventDefault(); if (step === 4) handleSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Progress Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '13px',
              background: step >= i ? 'var(--brand-primary)' : 'var(--border)',
              color: step >= i ? 'white' : 'var(--muted)',
              transition: 'all 0.3s ease',
              boxShadow: step === i ? '0 0 0 4px rgba(214, 48, 98, 0.2)' : 'none'
            }}>
              {i}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: step >= i ? 'var(--brand-primary)' : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {i === 1 ? 'Details' : i === 2 ? 'Security' : i === 3 ? 'Legal' : 'Verify'}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: '2px', background: 'var(--border)', marginTop: '-34px', marginBottom: '32px', position: 'relative', zIndex: -1, width: 'calc(100% - 25%)', marginLeft: '12.5%' }}>
        <div style={{ height: '100%', background: 'var(--brand-primary)', width: (((step - 1) / 3) * 100) + '%', transition: 'all 0.3s ease' }}></div>
      </div>

      {/* Step 1: Personal Info */}
      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="firstName" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>First Name *</label>
            <input id="firstName" name="firstName" type="text" className="auth-input" required={step === 1} />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="lastName" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>Last Name</label>
            <input id="lastName" name="lastName" type="text" className="auth-input" />
          </div>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>Email Address *</label>
          <input id="email" name="email" type="email" className="auth-input" required={step === 1} />
        </div>
        <div>
          <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>Phone Number (Optional)</label>
          <input id="phone" name="phone" type="tel" className="auth-input" />
        </div>
        <button type="button" onClick={nextStep} className="auth-button" style={{ marginTop: '24px' }}>Continue</button>
      </div>

      {/* Step 2: Security */}
      <div style={{ display: step === 2 ? 'block' : 'none' }}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>Password *</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password" name="password" type={showPassword ? "text" : "password"} className="auth-input"
              required={step === 2} minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: '50px' }}
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-primary)', fontSize: '12px', fontWeight: '700', padding: '4px' }}
            >
              {showPassword ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          {/* Password Strength Meter */}
          {password && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', width: ((strength.score / 5) * 100) + '%', background: strength.color, transition: 'all 0.3s' }}></div>
              </div>
              <span style={{ fontSize: '12px', color: strength.color, fontWeight: '700', width: '45px', textAlign: 'right' }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: 'var(--brand-black)' }}>Confirm Password *</label>
          <input
            id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} className="auth-input"
            required={step === 2} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ borderColor: passwordMatch === false ? '#ef4444' : passwordMatch === true ? '#10b981' : undefined }}
          />
          {passwordMatch === false && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Passwords do not match</p>}
          {passwordMatch === true && <p style={{ color: '#10b981', fontSize: '13px', marginTop: '8px', fontWeight: '600' }}>Passwords match!</p>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prevStep} className="auth-button" style={{ background: 'var(--muted)', flex: 1 }}>Back</button>
          <button type="button" onClick={nextStep} className="auth-button" style={{ flex: 2 }} disabled={!password || passwordMatch === false}>Continue</button>
        </div>
      </div>

      {/* Step 3: Consent */}
      <div style={{ display: step === 3 ? 'block' : 'none' }}>
        
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', color: 'var(--brand-black)' }}>Legal & Verification</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Age Confirmation */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input type="checkbox" id="ageConfirmed" name="ageConfirmed" required={step === 3} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-primary)', cursor: 'pointer', marginTop: '2px' }} />
              <label htmlFor="ageConfirmed" style={{ fontSize: '14px', color: 'var(--brand-black)', lineHeight: '1.5', fontWeight: '500' }}>
                I confirm that I meet the <strong>minimum legal age</strong> required to purchase adult products in my jurisdiction. *
              </label>
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input type="checkbox" id="acceptTerms" name="acceptTerms" required={step === 3} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-primary)', cursor: 'pointer', marginTop: '2px' }} />
              <label htmlFor="acceptTerms" style={{ fontSize: '14px', color: 'var(--brand-black)', lineHeight: '1.5' }}>
                I agree to the <Link href="/terms" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>Terms of Service</Link> and <Link href="/privacy" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>Privacy Policy</Link>. *
              </label>
            </div>

            {/* Marketing */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
              <input type="checkbox" id="marketingConsent" name="marketingConsent" style={{ width: '20px', height: '20px', accentColor: 'var(--brand-primary)', cursor: 'pointer', marginTop: '2px' }} />
              <label htmlFor="marketingConsent" style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Send me discreet emails about exclusive offers and new arrivals. (Optional)
              </label>
            </div>
          </div>
        </div>

        {error && step === 3 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', color: '#ef4444', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prevStep} className="auth-button" style={{ background: 'var(--muted)', flex: 1 }}>Back</button>
          <button type="button" onClick={sendOtp} className="auth-button" disabled={loading} style={{ flex: 2 }}>
            {loading ? 'Sending OTP...' : 'Send OTP Code'}
          </button>
        </div>
      </div>

      {/* Step 4: OTP Verification */}
      <div style={{ display: step === 4 ? 'block' : 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fdf2f8', color: '#D63062', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--brand-black)', marginBottom: '8px' }}>Verify Your Email</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
            We've sent a secure 4-digit One Time Password (OTP) to your email address.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              style={{
                width: '45px', height: '55px', fontSize: '24px', fontWeight: '800', textAlign: 'center',
                border: digit ? '2px solid var(--brand-primary)' : '2px solid var(--border)',
                borderRadius: '12px', background: '#fff', color: 'var(--brand-black)',
                transition: 'all 0.2s ease', outline: 'none', boxShadow: digit ? '0 4px 12px rgba(214, 48, 98, 0.1)' : 'none'
              }}
            />
          ))}
        </div>

        {error && step === 4 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', color: '#ef4444', fontSize: '14px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" onClick={prevStep} className="auth-button" style={{ background: '#fff', color: 'var(--brand-black)', border: '2px solid var(--border)', flex: 1 }}>Edit Info</button>
          <button type="button" onClick={handleSubmit} className="auth-button" disabled={loading || otp.join('').length !== 4} style={{ flex: 2, background: otp.join('').length === 4 ? 'var(--brand-primary)' : 'var(--muted)' }}>
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </div>
      </div>

      {/* Sign In Link */}
      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: '700', textDecoration: 'none' }}>
          Sign in securely
        </Link>
      </div>
    </form>
  );
}

export default function CustomerRegisterPage() {
  return (
    <main className="auth-wrapper">
      <style dangerouslySetInnerHTML={{__html: "@keyframes spin { 100% { transform: rotate(360deg); } }"}} />

      <div className="auth-bg-glow"></div>
      <div className="auth-shape-1"></div>
      <div className="auth-shape-2"></div>

      <div className="auth-card wide">
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="/logo.png" alt="Rany.uk" style={{ maxHeight: '60px', width: 'auto' }} />
          </div>
          
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--brand-black)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Join Rany.uk
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '15px' }}>
            Create a secure account for faster checkout and exclusive adult-store access.
          </p>
        </div>

        <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>Loading securely...</div>}>
          <RegisterForm />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
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
