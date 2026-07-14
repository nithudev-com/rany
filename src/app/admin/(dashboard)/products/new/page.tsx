'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { executeAITask } from '@/actions/gemini';

export default function NewProductPage() {
  const router = useRouter();
  
  // --- Form State ---
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  // Taxonomy Data
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  
  // Right Column Controls
  const [status, setStatus] = useState('DRAFT');
  const [productType, setProductType] = useState('SIMPLE');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [tags, setTags] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Gallery & Media
  const [images, setImages] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');

  // Inventory & Shipping
  const [sku, setSku] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockLimit, setLowStockLimit] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [shippingClass, setShippingClass] = useState('');

  // Complex Arrays
  const [details, setDetails] = useState<{key: string, value: string}[]>([]);
  const [faqs, setFaqs] = useState<{question: string, answer: string}[]>([]);
  
  // Variants
  const [variantAttributes, setVariantAttributes] = useState<{name: string, options: string}[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState('');

  // --- Effects ---
  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories).catch(console.error);
    fetch('/api/brands').then(res => res.json()).then(setBrands).catch(console.error);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Mark changes
  const handleChange = (setter: any, val: any) => {
    setHasUnsavedChanges(true);
    setter(val);
  };

  // --- Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadProgress(10);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error('Upload failed');
        const result = await uploadResponse.json();
        
        const isFirst = newImages.length === 0;
        newImages.push({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          isPrimary: isFirst,
          altText: '',
          sortOrder: newImages.length,
        });
      } catch (err) {
        console.error(err);
      }
      setUploadProgress(10 + Math.floor(((i + 1) / files.length) * 90));
    }
    
    setImages(newImages);
    setUploadProgress(0);
    setHasUnsavedChanges(true);
  };

  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const removeImage = (index: number) => {
    if (!window.confirm('Remove this image?')) return;
    const newImages = images.filter((_, i) => i !== index);
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    setImages(newImages);
  };

  // Variants Generator
  const generateVariants = () => {
    if (variantAttributes.length === 0) return;
    
    const parsedAttrs = variantAttributes
      .filter(a => a.name.trim() && a.options.trim())
      .map(a => ({
        name: a.name.trim(),
        values: a.options.split(',').map(s => s.trim()).filter(Boolean)
      }));
      
    if (parsedAttrs.length === 0) return;

    const combine = (attrs: any[], idx: number = 0, current: any = {}): any[] => {
      if (idx === attrs.length) return [current];
      const attr = attrs[idx];
      let results: any[] = [];
      for (const val of attr.values) {
        results = results.concat(combine(attrs, idx + 1, { ...current, [attr.name]: val }));
      }
      return results;
    };

    const combinations = combine(parsedAttrs);
    
    const newVariants = combinations.map(combo => {
      const existing = variants.find(v => Object.entries(combo).every(([k, val]) => v.attributes?.[k] === val));
      const variantNameStr = Object.values(combo).join('-');

      return {
        sku: existing?.sku || `${sku || 'SKU'}-${variantNameStr}`.toUpperCase(),
        price: existing?.price || basePrice,
        salePrice: existing?.salePrice || '',
        stockQuantity: existing?.stockQuantity || 0,
        image: existing?.image || null,
        isEnabled: existing?.isEnabled !== undefined ? existing.isEnabled : true,
        attributes: combo
      };
    });
    
    setVariants(newVariants);
    setHasUnsavedChanges(true);
  };

  const uploadVariantImage = async (index: number, file: File | null) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      const uploadResult = await res.json();
      
      const newVariants = [...variants];
      newVariants[index].image = uploadResult.secure_url;
      setVariants(newVariants);
    } catch (error) {
      alert('Failed to upload variant image.');
    }
  };

  // Readiness Checklist
  const readinessCheck = {
    title: !!title.trim(),
    price: !!basePrice,
    image: images.length > 0,
    category: !!categoryId,
    description: !!description.trim(),
    sku: !!sku,
    variants: productType === 'VARIABLE' ? variants.length > 0 : true,
  };
  const readinessScore = Math.round((Object.values(readinessCheck).filter(Boolean).length / Object.keys(readinessCheck).length) * 100);

  // Submit
  const handleSubmit = async (submitStatus: string) => {
    setErrorMessages([]);
    
    // Validation
    const errors = [];
    if (!title) errors.push("Title is required.");
    if (!basePrice) errors.push("Base Price is required.");
    if (!sku) errors.push("SKU is required.");
    if (images.length === 0) errors.push("At least one product image is required.");
    if (salePrice && Number(salePrice) > Number(basePrice)) errors.push("Sale price cannot exceed base price.");
    if (productType === 'VARIABLE' && variants.length === 0) errors.push("Variable products must have at least one generated variant.");

    if (errors.length > 0) {
      setErrorMessages(errors);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);

    try {
      const mainImageObj = images.find(img => img.isPrimary) || images[0];
      const mainImage = mainImageObj ? mainImageObj.secureUrl : null;

      const payload = {
        title,
        slug,
        sku,
        basePrice: Number(basePrice),
        salePrice: salePrice ? Number(salePrice) : null,
        shortDescription,
        description,
        status: submitStatus,
        productType,
        categoryId: categoryId || null,
        brandId: brandId || null,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        isFeatured,
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
        lowStockLimit: lowStockLimit ? Number(lowStockLimit) : null,
        weight: weight ? Number(weight) : null,
        length: length ? Number(length) : null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        shippingInfo: { class: shippingClass },
        mainImage,
        videoUrl,
        images,
        faq: faqs,
        details,
        seoTitle,
        seoDescription,
        focusKeyword,
        canonicalUrl,
        variants: productType === 'VARIABLE' ? variants : [],
        readinessScore,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      setHasUnsavedChanges(false);
      alert('Product saved successfully!');
      router.push('/admin/products');
      router.refresh();

    } catch (err: any) {
      setErrorMessages([err.message || 'Server error saving product.']);
      window.scrollTo(0, 0);
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!title) {
      alert("Please enter a product title first so Gemini knows what to generate.");
      return;
    }
    setAiLoading(true);
    setAiProgress('Starting AI generation...');
    
    try {
      const variables = {
        article_title: title,
        article_content: description || title,
        product_name: title,
        product_category: 'Catalog',
        focus_keyword: focusKeyword || title,
        language: 'English',
        country: 'Global',
        brand_name: 'SexToys Lovers',
        existing_faqs: JSON.stringify(faqs || []),
        existing_seo_title: seoTitle || '',
        existing_seo_description: seoDescription || '',
        faq_count: '5'
      };

      // 1. Product Details
      setAiProgress('Product Details — Generating...');
      const resDetails = await executeAITask('productDetails', variables);
      if (resDetails.success && resDetails.data) {
        setAiProgress('Product Details — Completed');
        const newDetails = [];
        if (resDetails.data.summary) newDetails.push({ key: 'Summary', value: resDetails.data.summary });
        if (Array.isArray(resDetails.data.features)) {
          resDetails.data.features.forEach((f: string, i: number) => newDetails.push({ key: `Feature ${i+1}`, value: f }));
        }
        if (Array.isArray(resDetails.data.benefits)) {
          resDetails.data.benefits.forEach((b: string, i: number) => newDetails.push({ key: `Benefit ${i+1}`, value: b }));
        }
        handleChange(setDetails, newDetails);
        
        if (resDetails.data.html && !description) {
           handleChange(setDescription, resDetails.data.html);
        }
      } else {
        setAiProgress('Product Details — Failed');
      }

      // 2. FAQs
      setAiProgress('Frequently Asked Questions — Generating...');
      const resFaqs = await executeAITask('faqs', variables);
      if (resFaqs.success && Array.isArray(resFaqs.data)) {
        setAiProgress('Frequently Asked Questions — Completed');
        handleChange(setFaqs, resFaqs.data);
      } else {
        setAiProgress('Frequently Asked Questions — Failed');
      }

      // 3. SEO Title
      setAiProgress('SEO Title — Generating...');
      const resTitle = await executeAITask('seoTitles', variables);
      if (resTitle.success && Array.isArray(resTitle.data) && resTitle.data.length > 0) {
        setAiProgress('SEO Title — Completed');
        handleChange(setSeoTitle, resTitle.data[0].title);
      } else {
        setAiProgress('SEO Title — Failed');
      }

      // 4. SEO Description
      setAiProgress('SEO Description — Generating...');
      const resDesc = await executeAITask('seoDescriptions', variables);
      if (resDesc.success && Array.isArray(resDesc.data) && resDesc.data.length > 0) {
        setAiProgress('SEO Description — Completed');
        handleChange(setSeoDescription, resDesc.data[0].description);
      } else {
        setAiProgress('SEO Description — Failed');
      }

      // 5. Zero-Credit Optimizations
      setAiProgress('Applying Zero-Credit Optimizations...');
      if (!focusKeyword) {
        handleChange(setFocusKeyword, title.split(' - ')[0].trim());
      }
      if (images.length > 0) {
        const newImages = [...images];
        let changed = false;
        newImages.forEach((img, idx) => {
          if (!img.altText) {
            img.altText = `${title} - Product Image ${idx + 1}`;
            changed = true;
          }
        });
        if (changed) handleChange(setImages, newImages);
      }

      setAiProgress('All AI tasks completed successfully!');
      setTimeout(() => setAiProgress(''), 4000);

    } catch (err: any) {
      console.error(err);
      setAiProgress(`Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
            Add New Product
            <button 
              type="button"
              onClick={handleGenerateAI} 
              disabled={aiLoading}
              style={{ 
                background: 'linear-gradient(135deg, #E0A96D 0%, #b88655 100%)',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: aiLoading ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(224, 169, 109, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {aiLoading ? '✨ Generating...' : '✨ Generate All with Gemini AI'}
            </button>
          </h1>
          {hasUnsavedChanges && <span style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>Unsaved Changes</span>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="button" style={{ background: '#e2e8f0' }} onClick={() => router.back()}>Cancel</button>
          <button className="button" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }} onClick={() => handleSubmit('DRAFT')} disabled={loading}>Save Draft</button>
          <button className="button secondary" onClick={() => handleSubmit('ACTIVE')} disabled={loading}>{loading ? 'Saving...' : 'Publish Product'}</button>
        </div>
      </div>

      {aiProgress && (
        <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {aiLoading ? <div style={{ width: '16px', height: '16px', border: '2px solid #E0A96D', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> : '✅ '} 
          {aiProgress}
        </div>
      )}

      {errorMessages.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h4 style={{ color: '#b91c1c', margin: '0 0 8px 0' }}>Please fix the following errors:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#b91c1c' }}>
            {errorMessages.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Basic Info */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Basic Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="input" value={title} onChange={e => handleChange(setTitle, e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Slug</label>
                  <input type="text" className="input" value={slug} onChange={e => handleChange(setSlug, e.target.value)} placeholder="Auto-generated if empty" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Short Description</label>
                  <input type="text" className="input" value={shortDescription} onChange={e => handleChange(setShortDescription, e.target.value)} placeholder="Excerpt for grid views" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Description</label>
                <textarea className="input" style={{ minHeight: '200px' }} value={description} onChange={e => handleChange(setDescription, e.target.value)}></textarea>
              </div>
            </div>
          </div>

          {/* Media Gallery */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Product Gallery <span style={{color: 'red'}}>*</span></h3>
            
            <div style={{ border: '2px dashed #cbd5e1', padding: '32px', textAlign: 'center', borderRadius: '8px', background: '#f8fafc', marginBottom: '16px' }}>
              <input type="file" multiple accept="image/*" id="galleryUpload" style={{ display: 'none' }} onChange={handleImageUpload} />
              <label htmlFor="galleryUpload" style={{ cursor: 'pointer', display: 'inline-block', background: '#1e293b', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
                Click to Upload Images
              </label>
              <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>Images will be optimized by Cloudinary.</p>
              {uploadProgress > 0 && <div style={{ marginTop: '16px', background: '#e2e8f0', height: '6px', borderRadius: '3px' }}><div style={{ background: '#3b82f6', height: '100%', width: `${uploadProgress}%`, transition: 'width 0.2s' }}></div></div>}
            </div>

            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ border: `2px solid ${img.isPrimary ? '#3b82f6' : '#e2e8f0'}`, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <img src={img.secureUrl} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} alt="Gallery" />
                    {img.isPrimary && <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#3b82f6', color: 'white', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>PRIMARY</div>}
                    <div style={{ padding: '8px', background: 'white', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input type="text" className="input" placeholder="ALT Text" value={img.altText} onChange={e => {
                        const newImgs = [...images]; newImgs[i].altText = e.target.value; handleChange(setImages, newImgs);
                      }} style={{ padding: '4px', fontSize: '12px' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        {!img.isPrimary && <button type="button" onClick={() => setPrimaryImage(i)} style={{ fontSize: '12px', border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}>Set Primary</button>}
                        <button type="button" onClick={() => removeImage(i)} style={{ fontSize: '12px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: 'auto' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Video URL</label>
              <input type="text" className="input" value={videoUrl} onChange={e => handleChange(setVideoUrl, e.target.value)} placeholder="e.g. YouTube, Vimeo, or MP4 link" />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Pricing & Inventory</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>SKU <span style={{color: 'red'}}>*</span></label>
                <input type="text" className="input" value={sku} onChange={e => handleChange(setSku, e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Stock Quantity</label>
                <input type="number" className="input" value={stockQuantity} onChange={e => handleChange(setStockQuantity, e.target.value)} />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Regular Price ($) <span style={{color: 'red'}}>*</span></label>
                <input type="number" step="0.01" className="input" value={basePrice} onChange={e => handleChange(setBasePrice, e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Sale Price ($)</label>
                <input type="number" step="0.01" className="input" value={salePrice} onChange={e => handleChange(setSalePrice, e.target.value)} />
              </div>
            </div>

            <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Shipping Dimensions</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Weight (kg)</label>
                <input type="number" step="0.01" className="input" value={weight} onChange={e => handleChange(setWeight, e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Length (cm)</label>
                <input type="number" step="0.01" className="input" value={length} onChange={e => handleChange(setLength, e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Width (cm)</label>
                <input type="number" step="0.01" className="input" value={width} onChange={e => handleChange(setWidth, e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Height (cm)</label>
                <input type="number" step="0.01" className="input" value={height} onChange={e => handleChange(setHeight, e.target.value)} />
              </div>
            </div>
          </div>

          {/* Variants */}
          {productType === 'VARIABLE' && (
            <div className="card" style={{ padding: '24px', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: '#1e40af' }}>Variable Product Configuration</h3>
                <button type="button" className="button" onClick={() => handleChange(setVariantAttributes, [...variantAttributes, {name: '', options: ''}])} style={{ padding: '6px 12px', fontSize: '14px' }}>+ Add Attribute</button>
              </div>
              
              {variantAttributes.map((attr, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '12px', marginBottom: '12px' }}>
                  <input type="text" className="input" placeholder="e.g. Size or Color" value={attr.name} onChange={(e) => {
                    const newAttrs = [...variantAttributes]; newAttrs[index].name = e.target.value; handleChange(setVariantAttributes, newAttrs);
                  }} />
                  <input type="text" className="input" placeholder="e.g. Small, Medium (comma separated)" value={attr.options} onChange={(e) => {
                    const newAttrs = [...variantAttributes]; newAttrs[index].options = e.target.value; handleChange(setVariantAttributes, newAttrs);
                  }} />
                  <button type="button" className="button" onClick={() => handleChange(setVariantAttributes, variantAttributes.filter((_, i) => i !== index))} style={{ background: '#fee2e2', color: '#b91c1c' }}>X</button>
                </div>
              ))}

              {variantAttributes.length > 0 && (
                <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                  <button type="button" className="button secondary" onClick={generateVariants} style={{ background: '#1e40af' }}>⚡ Generate Combinations</button>
                </div>
              )}

              {variants.length > 0 && (
                <div style={{ overflowX: 'auto', background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #93c5fd' }}>
                        <th style={{ padding: '8px', textAlign: 'left', width: '50px' }}>Img</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Variant</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Color Hex</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>SKU</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Price</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Stock</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => {
                        const colorAttrKey = Object.keys(v.attributes || {}).find(k => k.toLowerCase().includes('color'));
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #bfdbfe', background: v.isEnabled ? '#ffffff' : '#f1f5f9', opacity: v.isEnabled ? 1 : 0.6 }}>
                            <td style={{ padding: '8px' }}>
                              <div style={{ position: 'relative', width: '40px', height: '40px', background: '#f8fafc', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                                {v.image ? <img src={v.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Var" /> : <span style={{fontSize: '10px', padding: '4px'}}>Upload</span>}
                                <input type="file" accept="image/*" onChange={(e) => {handleChange(setHasUnsavedChanges, true); uploadVariantImage(i, e.target.files?.[0] || null)}} style={{ position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', height: '100%' }} />
                              </div>
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold' }}>{Object.values(v.attributes || {}).join(' / ')}</td>
                            <td style={{ padding: '8px' }}>
                              {colorAttrKey ? (
                                <input type="color" value={v.attributes[`${colorAttrKey}Hex`] || '#000000'} onChange={e => {
                                  const nv = [...variants]; nv[i].attributes[`${colorAttrKey}Hex`] = e.target.value; handleChange(setVariants, nv);
                                }} style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer' }} />
                              ) : <span style={{color: '#94a3b8'}}>-</span>}
                            </td>
                            <td style={{ padding: '8px' }}><input type="text" className="input" style={{ width: '100px', padding: '4px' }} value={v.sku} onChange={e => {const nv=[...variants]; nv[i].sku=e.target.value; handleChange(setVariants,nv)}} /></td>
                            <td style={{ padding: '8px' }}><input type="number" className="input" style={{ width: '80px', padding: '4px' }} value={v.price} onChange={e => {const nv=[...variants]; nv[i].price=e.target.value; handleChange(setVariants,nv)}} /></td>
                            <td style={{ padding: '8px' }}><input type="number" className="input" style={{ width: '60px', padding: '4px' }} value={v.stockQuantity} onChange={e => {const nv=[...variants]; nv[i].stockQuantity=e.target.value; handleChange(setVariants,nv)}} /></td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <input type="checkbox" checked={v.isEnabled !== false} onChange={e => {const nv=[...variants]; nv[i].isEnabled=e.target.checked; handleChange(setVariants,nv)}} style={{ cursor: 'pointer' }} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Details & FAQs */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Additional Information</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Product Details</h4>
                <button type="button" onClick={() => handleChange(setDetails, [...details, {key:'', value:''}])} className="button" style={{ padding: '4px 8px', fontSize: '12px' }}>+ Detail</button>
              </div>
              {details.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input type="text" className="input" placeholder="Name" value={d.key} onChange={e => {const nd=[...details]; nd[i].key=e.target.value; handleChange(setDetails,nd)}} />
                  <input type="text" className="input" placeholder="Value" value={d.value} onChange={e => {const nd=[...details]; nd[i].value=e.target.value; handleChange(setDetails,nd)}} />
                  <button type="button" onClick={() => handleChange(setDetails, details.filter((_, idx)=>idx!==i))} className="button" style={{ background: '#fee2e2', color: '#b91c1c' }}>X</button>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>FAQs</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => alert('Simulating AI FAQ generation...')} className="button" style={{ padding: '4px 8px', fontSize: '12px', background: '#f3e8ff', color: '#7e22ce' }}>✨ Auto Generate</button>
                  <button type="button" onClick={() => handleChange(setFaqs, [...faqs, {question:'', answer:''}])} className="button" style={{ padding: '4px 8px', fontSize: '12px' }}>+ FAQ</button>
                </div>
              </div>
              {faqs.map((f, i) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '6px', marginBottom: '8px', background: '#f8fafc' }}>
                  <input type="text" className="input" placeholder="Question" value={f.question} onChange={e => {const nf=[...faqs]; nf[i].question=e.target.value; handleChange(setFaqs,nf)}} style={{ marginBottom: '8px' }} />
                  <textarea className="input" placeholder="Answer" value={f.answer} onChange={e => {const nf=[...faqs]; nf[i].answer=e.target.value; handleChange(setFaqs,nf)}} style={{ minHeight: '60px', marginBottom: '8px' }}></textarea>
                  <button type="button" onClick={() => handleChange(setFaqs, faqs.filter((_, idx)=>idx!==i))} style={{ fontSize: '12px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>Remove FAQ</button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Section */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Search Engine Optimization</h3>
              <button type="button" onClick={() => alert('Simulating AI SEO generation based on Title...')} className="button" style={{ padding: '4px 12px', fontSize: '12px', background: '#f3e8ff', color: '#7e22ce' }}>✨ Auto Generate SEO</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Focus Keyword</label>
                <input type="text" className="input" value={focusKeyword} onChange={e => handleChange(setFocusKeyword, e.target.value)} placeholder="e.g. leather wallet" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 'bold' }}>SEO Title</label>
                  <span style={{ fontSize: '12px', color: seoTitle.length > 60 ? '#ef4444' : '#64748b' }}>{seoTitle.length} / 60</span>
                </div>
                <input type="text" className="input" value={seoTitle} onChange={e => handleChange(setSeoTitle, e.target.value)} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 'bold' }}>SEO Description</label>
                  <span style={{ fontSize: '12px', color: seoDescription.length > 160 ? '#ef4444' : '#64748b' }}>{seoDescription.length} / 160</span>
                </div>
                <textarea className="input" style={{ minHeight: '80px' }} value={seoDescription} onChange={e => handleChange(setSeoDescription, e.target.value)}></textarea>
              </div>

              {/* Google Preview */}
              <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Google Search Preview</p>
                <div style={{ color: '#1a0dab', fontSize: '20px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {seoTitle || title || 'Product Title Placeholder'}
                </div>
                <div style={{ color: '#006621', fontSize: '14px', margin: '2px 0' }}>
                  https://yourstore.com/products/{slug || 'product-slug'}
                </div>
                <div style={{ color: '#545454', fontSize: '14px', lineHeight: '1.4' }}>
                  {seoDescription || description.substring(0, 150) || 'Write a compelling meta description to encourage shoppers to click your link in search results.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '16px' }}>Status & Visibility</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Product Status</label>
                <select className="input" value={status} onChange={e => handleChange(setStatus, e.target.value)}>
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Product Type</label>
                <select className="input" value={productType} onChange={e => handleChange(setProductType, e.target.value)}>
                  <option value="SIMPLE">Simple Product</option>
                  <option value="VARIABLE">Variable Product</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="checkbox" id="featured" checked={isFeatured} onChange={e => handleChange(setIsFeatured, e.target.checked)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                <label htmlFor="featured" style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Featured Product</label>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '16px' }}>Organization</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Category</label>
                <select className="input" value={categoryId} onChange={e => handleChange(setCategoryId, e.target.value)}>
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Brand</label>
                <select className="input" value={brandId} onChange={e => handleChange(setBrandId, e.target.value)}>
                  <option value="">Select Brand...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Tags</label>
                <input type="text" className="input" value={tags} onChange={e => handleChange(setTags, e.target.value)} placeholder="summer, casual, men" />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>Comma separated</small>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0 }}>Product Readiness</h4>
              <span style={{ fontWeight: 'bold', color: readinessScore === 100 ? '#16a34a' : '#f59e0b' }}>{readinessScore}%</span>
            </div>
            
            <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ background: readinessScore === 100 ? '#16a34a' : '#3b82f6', height: '100%', width: `${readinessScore}%`, transition: 'width 0.3s' }}></div>
            </div>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ color: readinessCheck.title ? '#16a34a' : '#94a3b8' }}>{readinessCheck.title ? '✓' : '○'} Title added</li>
              <li style={{ color: readinessCheck.price ? '#16a34a' : '#94a3b8' }}>{readinessCheck.price ? '✓' : '○'} Base Price set</li>
              <li style={{ color: readinessCheck.image ? '#16a34a' : '#94a3b8' }}>{readinessCheck.image ? '✓' : '○'} Image uploaded</li>
              <li style={{ color: readinessCheck.sku ? '#16a34a' : '#94a3b8' }}>{readinessCheck.sku ? '✓' : '○'} SKU added</li>
              <li style={{ color: readinessCheck.category ? '#16a34a' : '#94a3b8' }}>{readinessCheck.category ? '✓' : '○'} Category selected</li>
              <li style={{ color: readinessCheck.description ? '#16a34a' : '#94a3b8' }}>{readinessCheck.description ? '✓' : '○'} Description written</li>
              {productType === 'VARIABLE' && (
                <li style={{ color: readinessCheck.variants ? '#16a34a' : '#ef4444' }}>{readinessCheck.variants ? '✓' : '✗'} Variants generated</li>
              )}
            </ul>
          </div>
          
        </div>
      </div>
    </div>
  );
}
