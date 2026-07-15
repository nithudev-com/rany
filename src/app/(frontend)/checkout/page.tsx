'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { processCheckout, CheckoutActionState, getCustomerAddresses } from './actions';
import { useCart } from '@/hooks/useCart';
import { revalidateCartTotals, RevalidatedCart, getShippingOptions, ShippingOption } from './cart-actions';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  const [formState, setFormState] = useState<CheckoutActionState>({ success: false });

  // Legal Checkbox Refs & State
  const termsRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const [legalErrors, setLegalErrors] = useState({ terms: false, privacy: false, age: false });

  // Shipping & Coupon State
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const [couponLoading, setCouponLoading] = useState(false);

  // Cart State
  const cart = useCart();
  const [validatedCart, setValidatedCart] = useState<RevalidatedCart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    getCustomerAddresses().then(addresses => {
      setSavedAddresses(addresses);
      if (addresses.length > 0) {
        setSelectedAddressId(addresses[0].id);
      }
    });

    getShippingOptions().then(options => {
      setShippingOptions(options);
      if (options.length > 0) {
        setSelectedShippingId(options[0].id);
      }
    });
  }, []);

  // Sync and Revalidate Cart
  useEffect(() => {
    if (!cart.isLoaded) return;
    
    const revalidate = async () => {
      setCartLoading(true);
      const result = await revalidateCartTotals(cart.items, selectedShippingId, appliedCoupon);
      setValidatedCart(result);
      setCartLoading(false);
    };

    revalidate();
  }, [cart.items, cart.isLoaded, selectedShippingId, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    
    // Test the coupon against the server
    const result = await revalidateCartTotals(cart.items, selectedShippingId, couponInput.trim());
    
    if (result.error && result.error.toLowerCase().includes('coupon')) {
      toast.error(result.error, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1e293b',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
          fontSize: '15px'
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff',
        },
      }); // Show error for invalid coupon
      setAppliedCoupon(undefined);
    } else {
      setAppliedCoupon(couponInput.trim());
      setCouponInput('');
    }
    
    setValidatedCart(result);
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponInput('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      toast.error("Your cart is empty.", {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1e293b',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
          fontSize: '15px'
        }
      });
      return;
    }
    if (!selectedShippingId) {
      toast.error("Please select a shipping method.", {
        duration: 3000,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1e293b',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          borderRadius: '16px',
          padding: '16px 20px',
          fontWeight: 500,
          fontSize: '15px'
        }
      });
      return;
    }

    const form = e.currentTarget;
    const terms = (form.elements.namedItem('acceptTerms') as HTMLInputElement).checked;
    const privacy = (form.elements.namedItem('acceptPrivacy') as HTMLInputElement).checked;
    const age = (form.elements.namedItem('confirmAge') as HTMLInputElement).checked;

    setLegalErrors({ terms: !terms, privacy: !privacy, age: !age });

    if (!terms || !privacy || !age) {
      if (!terms) termsRef.current?.focus();
      else if (!privacy) privacyRef.current?.focus();
      else if (!age) ageRef.current?.focus();
      return;
    }
    
    setLoading(true);
    setFormState({ success: false });

    const formData = new FormData(e.currentTarget);
    const result = await processCheckout(
      { success: false }, 
      formData, 
      JSON.stringify(cart.items), 
      selectedShippingId, 
      appliedCoupon
    );
    
    if (!result.success) {
      setFormState(result);
      setLoading(false);
      return;
    }

    const { orderNumber, amount, currency, merchantId, signature, token } = result.data;
    
    // Redirect to simulated Monirize checkout page
    const params = new URLSearchParams({
      merchantId,
      orderRef: orderNumber,
      amount: amount.toString(),
      currency,
      signature,
      token
    });

    window.location.href = `/monirize/mock?${params.toString()}`;
  };

  const getError = (field: string) => {
    if (!formState.errors) return null;
    return formState.errors[field] ? (
      <span style={{ color: '#E71C25', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: '600' }}>
        {formState.errors[field]}
      </span>
    ) : null;
  };

  const renderAddressFields = (prefix: 'shipping' | 'billing') => (
    <div className="checkout-grid" style={{ marginTop: '16px' }}>
      <div className="checkout-input-group">
        <label className="checkout-label">First Name *</label>
        <input name={`${prefix}_firstName`} type="text" className="checkout-input" autoComplete="given-name" />
        {getError(`${prefix}Address_firstName`)}
      </div>
      <div className="checkout-input-group">
        <label className="checkout-label">Last Name *</label>
        <input name={`${prefix}_lastName`} type="text" className="checkout-input" autoComplete="family-name" />
        {getError(`${prefix}Address_lastName`)}
      </div>
      <div className="checkout-input-group full" style={{ gridColumn: '1 / -1' }}>
        <label className="checkout-label">Address Line 1 *</label>
        <input name={`${prefix}_addressLine1`} type="text" className="checkout-input" autoComplete="address-line1" placeholder="Street address" />
        {getError(`${prefix}Address_addressLine1`)}
      </div>
      <div className="checkout-input-group">
        <label className="checkout-label">City *</label>
        <input name={`${prefix}_city`} type="text" className="checkout-input" autoComplete="address-level2" />
        {getError(`${prefix}Address_city`)}
      </div>
      <div className="checkout-input-group">
        <label className="checkout-label">State / Province *</label>
        <input name={`${prefix}_state`} type="text" className="checkout-input" autoComplete="address-level1" />
        {getError(`${prefix}Address_state`)}
      </div>
      <div className="checkout-input-group">
        <label className="checkout-label">Postal Code *</label>
        <input name={`${prefix}_postalCode`} type="text" className="checkout-input" autoComplete="postal-code" />
        {getError(`${prefix}Address_postalCode`)}
      </div>
      <div className="checkout-input-group">
        <label className="checkout-label">Country *</label>
        <select name={`${prefix}_country`} className="checkout-input" autoComplete="country-name" defaultValue="US">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="GB">United Kingdom</option>
        </select>
        {getError(`${prefix}Address_country`)}
      </div>
    </div>
  );

  return (
    <div className="checkout-container">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --co-pink: #D63062;
          --co-red: #E71C25;
          --co-plum: #730C63;
          --co-black: #111111;
          --co-white: #FFFFFF;
          --co-blush: #FFF4F7;
          --co-border: #F0DDE5;
        }

        .checkout-container { min-height: 100vh; background-color: var(--co-blush); font-family: inherit; color: var(--co-black); }
        .checkout-header { padding: 24px; text-align: center; border-bottom: 1px solid var(--co-border); background: var(--co-white); position: sticky; top: 0; z-index: 50; }
        .checkout-header-logo { font-size: 24px; font-weight: 900; color: var(--co-plum); text-decoration: none; letter-spacing: -1px; }
        
        .checkout-layout { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: row; gap: 32px; padding: 32px 24px; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .checkout-main { flex: 1.5; }
        .checkout-sidebar { flex: 1; position: sticky; top: 100px; align-self: flex-start; }

        .checkout-card { background: var(--co-white); border-radius: 16px; border: 1px solid var(--co-border); box-shadow: 0 10px 30px -10px rgba(115, 12, 99, 0.08); padding: 32px; margin-bottom: 24px; }
        .checkout-title { font-size: 20px; font-weight: 800; margin-bottom: 24px; color: var(--co-plum); display: flex; align-items: center; gap: 8px; }
        
        .checkout-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .checkout-grid.full { grid-template-columns: 1fr; }
        .checkout-input-group { display: flex; flex-direction: column; gap: 6px; }
        .checkout-label { font-size: 13px; font-weight: 600; color: var(--co-black); }
        .checkout-input { padding: 14px 16px; border-radius: 10px; border: 1px solid var(--co-border); font-size: 15px; transition: all 0.3s ease; background: #FAFAFA; }
        .checkout-input:focus { outline: none; border-color: var(--co-pink); background: var(--co-white); box-shadow: 0 0 0 4px rgba(214, 48, 98, 0.1); }
        select.checkout-input { appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L7 7L13 1" stroke="%23111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'); background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px; }

        .checkout-button { width: 100%; padding: 18px; border-radius: 12px; border: none; background: var(--co-pink); color: var(--co-white); font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(214, 48, 98, 0.25); display: flex; justify-content: center; align-items: center; gap: 10px; }
        .checkout-button:hover:not(:disabled) { background: var(--co-red); transform: translateY(-2px); box-shadow: 0 8px 16px rgba(231, 28, 37, 0.3); }
        .checkout-button:disabled { opacity: 0.7; cursor: not-allowed; }

        .summary-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid var(--co-border); }
        .summary-item:last-child { border-bottom: none; }
        .summary-img { width: 72px; height: 72px; background: var(--co-blush); border-radius: 8px; border: 1px solid var(--co-border); object-fit: cover; }
        .summary-total { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 2px solid var(--co-border); font-size: 20px; font-weight: 800; }

        .qty-controls { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .qty-btn { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; color: #475569; }
        .qty-btn:hover { background: #e2e8f0; }

        .remove-link { color: #94a3b8; font-size: 12px; text-decoration: underline; cursor: pointer; margin-left: auto; }
        .remove-link:hover { color: var(--co-red); }

        .shipping-option { display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid var(--co-border); border-radius: 12px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 12px; background: #fafafa; }
        .shipping-option:hover { border-color: var(--co-pink); }
        .shipping-option.selected { border-color: var(--co-pink); background: var(--co-blush); box-shadow: 0 0 0 1px var(--co-pink); }

        .coupon-group { display: flex; gap: 8px; margin-top: 16px; }
        .coupon-btn { padding: 0 20px; border-radius: 8px; border: none; background: var(--co-black); color: white; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .coupon-btn:hover:not(:disabled) { background: var(--co-plum); }
        .coupon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .coupon-badge { display: inline-flex; align-items: center; gap: 8px; background: #ecfdf5; border: 1px solid #10b981; color: #059669; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-top: 16px; }
        .coupon-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 18px; line-height: 1; padding: 0; display: flex; }

        .mobile-summary-toggle { display: none; width: 100%; background: var(--co-white); border-top: 1px solid var(--co-border); border-bottom: 1px solid var(--co-border); padding: 16px 24px; justify-content: space-between; align-items: center; font-weight: 600; color: var(--co-pink); cursor: pointer; }

        .billing-section { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease-out; }
        .billing-section.expanded { grid-template-rows: 1fr; }
        .billing-content { overflow: hidden; }

        @keyframes slideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes spinner { to { transform: rotate(360deg); } }
        .spinner-icon { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: var(--co-white); border-radius: 50%; animation: spinner 0.8s linear infinite; }
        .loader-ring { width: 30px; height: 30px; border: 3px solid var(--co-border); border-top-color: var(--co-pink); border-radius: 50%; animation: spinner 0.8s linear infinite; margin: 20px auto; }

        @media (max-width: 900px) {
          .checkout-layout { flex-direction: column-reverse; padding: 0; gap: 0; }
          .checkout-sidebar { position: relative; top: 0; display: none; margin: 0; border-radius: 0; border-left: none; border-right: none; box-shadow: none; }
          .checkout-sidebar.open { display: block; }
          .checkout-card { border-radius: 0; border-left: none; border-right: none; box-shadow: none; margin-bottom: 0; border-bottom: 8px solid var(--co-blush); }
          .mobile-summary-toggle { display: flex; }
          .checkout-grid { grid-template-columns: 1fr; }
        }
      ` }} />

      <header className="checkout-header">
        <Link href="/" className="checkout-header-logo">SexToys Lovers</Link>
      </header>

      {/* Mobile Toggle */}
      <div className="mobile-summary-toggle" onClick={() => setSummaryOpen(!summaryOpen)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {summaryOpen ? 'Hide order summary' : 'Show order summary'}
        </span>
        <span style={{ color: 'var(--co-black)', fontWeight: '800' }}>
          ${validatedCart?.totals.grandTotal.toFixed(2) || '0.00'}
        </span>
      </div>

      <main className="checkout-layout">
        {/* Left Side: Form */}
        <div className="checkout-main">
          <form onSubmit={handleSubmit} noValidate>
            
            {formState.message && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', color: '#ef4444', fontSize: '15px', marginBottom: '24px', fontWeight: '600' }}>
                {formState.message}
              </div>
            )}

            <div className="checkout-card">
              <h2 className="checkout-title">
                <span style={{ width: '28px', height: '28px', background: 'var(--co-pink)', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</span>
                Contact Information
              </h2>
              <div className="checkout-grid full">
                <div className="checkout-input-group">
                  <label className="checkout-label">Email Address *</label>
                  <input name="email" type="email" className="checkout-input" placeholder="you@example.com" autoComplete="email" />
                  {getError('email')}
                </div>
                <div className="checkout-input-group">
                  <label className="checkout-label">Phone Number *</label>
                  <input name="phone" type="tel" className="checkout-input" placeholder="(555) 123-4567" autoComplete="tel" />
                  {getError('phone')}
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <h2 className="checkout-title">
                <span style={{ width: '28px', height: '28px', background: 'var(--co-pink)', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</span>
                Shipping Details
              </h2>
              
              {savedAddresses.length > 0 && (
                <div className="checkout-input-group full" style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--co-border)' }}>
                  <label className="checkout-label">Use Saved Address</label>
                  <select 
                    className="checkout-input" 
                    value={selectedAddressId} 
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <option value="">-- Enter a new address --</option>
                    {savedAddresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.firstName} {addr.lastName}, {addr.addressLine1}, {addr.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {renderAddressFields('shipping')}
              
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--co-black)' }}>Shipping Method</h3>
                {shippingOptions.length === 0 ? (
                  <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px', color: '#64748b' }}>Loading shipping options...</div>
                ) : (
                  shippingOptions.map(option => (
                    <label key={option.id} className={`shipping-option ${selectedShippingId === option.id ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="shippingMethodId" 
                        value={option.id}
                        checked={selectedShippingId === option.id}
                        onChange={(e) => setSelectedShippingId(e.target.value)}
                        style={{ accentColor: 'var(--co-pink)', width: '18px', height: '18px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: 'var(--co-black)', fontSize: '15px' }}>{option.name}</div>
                        {option.estimatedDays && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{option.estimatedDays}</div>}
                      </div>
                      <div style={{ fontWeight: '700', color: 'var(--co-black)' }}>
                        {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                      </div>
                    </label>
                  ))
                )}
              </div>

            </div>

            <div className="checkout-card">
              <h2 className="checkout-title">
                <span style={{ width: '28px', height: '28px', background: 'var(--co-pink)', color: 'white', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</span>
                Payment & Billing
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
                All transactions are secure and encrypted. (Monirize Integration)
              </p>
              
              <div style={{ background: '#fafafa', border: '1px solid var(--co-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ padding: '20px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8' }}>
                  Monirize Payment Element
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Billing Address</h3>
                <div style={{ border: '1px solid var(--co-border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: billingSameAsShipping ? '#f8fafc' : 'white', cursor: 'pointer', borderBottom: billingSameAsShipping ? 'none' : '1px solid var(--co-border)' }}>
                    <input 
                      type="checkbox" 
                      name="billingSameAsShipping"
                      checked={billingSameAsShipping}
                      onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--co-pink)', cursor: 'pointer' }}
                    />
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>Same as shipping address</span>
                  </label>
                  <div className={`billing-section ${!billingSameAsShipping ? 'expanded' : ''}`}>
                    <div className="billing-content">
                      <div style={{ padding: '24px', background: '#fafafa' }}>
                        {renderAddressFields('billing')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafafa', padding: '24px', borderRadius: '12px', border: '1px solid var(--co-border)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Legal & Agreements</h3>
                
                <div style={{ paddingBottom: '16px', marginBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (termsRef.current) termsRef.current.checked = checked;
                        if (privacyRef.current) privacyRef.current.checked = checked;
                        if (ageRef.current) ageRef.current.checked = checked;
                      }}
                      style={{ marginTop: '4px', accentColor: 'var(--co-pink)', width: '16px', height: '16px' }} 
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--co-pink)' }}>Select all required legal agreements</span>
                    </div>
                  </label>
                </div>
                
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="acceptTerms" ref={termsRef} style={{ marginTop: '4px', accentColor: 'var(--co-pink)', width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>I accept the Terms and Conditions *</span>
                    {legalErrors.terms && <div style={{ color: 'var(--co-red)', fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>Please accept the terms to continue.</div>}
                  </div>
                </label>

                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="acceptPrivacy" ref={privacyRef} style={{ marginTop: '4px', accentColor: 'var(--co-pink)', width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>I accept the Privacy Policy *</span>
                    {legalErrors.privacy && <div style={{ color: 'var(--co-red)', fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>Please accept the privacy policy to continue.</div>}
                  </div>
                </label>

                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" name="confirmAge" ref={ageRef} style={{ marginTop: '4px', accentColor: 'var(--co-pink)', width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>I confirm that I meet the minimum legal age required to purchase products from this store. *</span>
                    {legalErrors.age && <div style={{ color: 'var(--co-red)', fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>Legal age confirmation is required.</div>}
                  </div>
                </label>

                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <input type="checkbox" name="marketingConsent" style={{ marginTop: '4px', accentColor: 'var(--co-pink)', width: '16px', height: '16px' }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Send me news and offers (Optional)</span>
                  </div>
                </label>
              </div>

              <div style={{ marginTop: '32px' }}>
                <button type="submit" className="checkout-button" disabled={loading || cartLoading || cart.items.length === 0}>
                  {loading ? (
                    <>
                      <div className="spinner-icon"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Pay ${validatedCart?.totals.grandTotal.toFixed(2) || '0.00'}
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className={`checkout-sidebar ${summaryOpen ? 'open' : ''}`}>
          <div className="checkout-card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--co-black)' }}>Order Summary</h3>
              <Link href="/cart" style={{ color: 'var(--co-pink)', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Edit Cart</Link>
            </div>
            
            {cartLoading && !validatedCart ? (
              <div className="loader-ring"></div>
            ) : validatedCart?.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.5 }}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <p>Your cart is empty.</p>
              </div>
            ) : (
              <>
                {validatedCart?.error && (
                  <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {validatedCart.error}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {validatedCart?.items.map(item => (
                    <div key={`${item.productId}-${item.variantId}`} className="summary-item">
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <img src={item.imageUrl} alt={item.title} className="summary-img" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '15px' }}>{item.title}</div>
                          {item.variantTitle && <div style={{ color: '#64748b', fontSize: '13px' }}>{item.variantTitle}</div>}
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                            <div className="qty-controls">
                              <button type="button" className="qty-btn" onClick={() => cart.updateQuantity(item.productId, item.quantity - 1, item.variantId)}>-</button>
                              <span style={{ fontSize: '14px', fontWeight: '600', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                              <button type="button" className="qty-btn" onClick={() => cart.updateQuantity(item.productId, item.quantity + 1, item.variantId)}>+</button>
                            </div>
                            <span 
                              className="remove-link" 
                              onClick={() => cart.removeItem(item.productId, item.variantId)}
                            >
                              Remove
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                        <div style={{ fontWeight: '600' }}>${item.totalPrice.toFixed(2)}</div>
                        {item.originalPrice && (
                          <div style={{ color: '#94a3b8', fontSize: '12px', textDecoration: 'line-through' }}>
                            ${(item.originalPrice * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', borderTop: '1px solid var(--co-border)', paddingTop: '24px' }}>
                  {appliedCoupon ? (
                    <div className="coupon-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      {validatedCart?.couponMessage || `Code applied: ${appliedCoupon}`}
                      <button className="coupon-remove" onClick={handleRemoveCoupon} aria-label="Remove coupon">×</button>
                    </div>
                  ) : (
                    <>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>Gift card or discount code</h4>
                      <div className="coupon-group">
                        <input 
                          type="text" 
                          className="checkout-input" 
                          style={{ flex: 1 }} 
                          placeholder="Enter code"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        />
                        <button 
                          type="button" 
                          className="coupon-btn" 
                          onClick={handleApplyCoupon}
                          disabled={!couponInput || couponLoading || cartLoading}
                        >
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#475569' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: '600', color: 'var(--co-black)' }}>${validatedCart?.totals.subtotal.toFixed(2)}</span>
                  </div>
                  {validatedCart?.totals.discount && validatedCart.totals.discount > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                      <span>Discount</span>
                      <span style={{ fontWeight: '600' }}>-${validatedCart.totals.discount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping</span>
                    <span style={{ fontWeight: '600', color: 'var(--co-black)' }}>
                      {validatedCart?.totals.shipping === 0 ? 'Free' : `$${validatedCart?.totals.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax</span>
                    <span style={{ fontWeight: '600', color: 'var(--co-black)' }}>${validatedCart?.totals.tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span style={{ color: 'var(--co-pink)' }}>
                    {validatedCart?.totals.currency === 'CAD' ? 'CA$' : '$'}{validatedCart?.totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* Overlay if revalidating */}
            {cartLoading && validatedCart && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '16px' }}>
                <div className="loader-ring"></div>
              </div>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
