'use client';

import { useState, useEffect } from 'react';
import { getProductsListForAI, saveProductDataForAI } from '@/app/admin/(dashboard)/products/actions';
import { executeAITask } from '@/actions/gemini';

interface ProductSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  faq: any;
  details: any;
  images?: any;
  focusKeyword?: string | null;
  isPublished: boolean;
  generatedByAI?: boolean;
}

interface QueueItem {
  id: string;
  title: string;
  product: ProductSummary;
  status: 'waiting' | 'generating' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  completedFields: string[];
  failedFields: string[];
  error?: string;
}

export default function BulkAIGeneratorPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'generated' | 'new'>('all');
  const [taskType, setTaskType] = useState<'full' | 'details' | 'faqs' | 'titles' | 'descriptions'>('full');
  
  // Queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const list = await getProductsListForAI();
    setProducts(list as any);
  }

  function toggleSelect(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === displayedProducts.length && displayedProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedProducts.map(p => p.id));
    }
  }

  const totalProducts = products.length;
  const generatedProducts = products.filter(p => p.generatedByAI).length;
  const newProducts = totalProducts - generatedProducts;

  const displayedProducts = products.filter(p => {
    if (filter === 'generated') return p.generatedByAI;
    if (filter === 'new') return !p.generatedByAI;
    return true;
  });

  async function startBulkAutomation() {
    if (selectedIds.length === 0) {
      alert('Please select at least one product to run bulk automation.');
      return;
    }

    const items: QueueItem[] = selectedIds.map(id => {
      const product = products.find(p => p.id === id)!;
      return {
        id,
        title: product.title,
        product,
        status: 'waiting',
        currentStep: 'Waiting in Queue',
        completedFields: [],
        failedFields: []
      };
    });

    setQueue(items);
    setIsProcessing(true);
  }

  // Loop processing items sequentially
  useEffect(() => {
    if (!isProcessing || queue.length === 0) return;
    
    // CRITICAL FIX: Prevent parallel execution runaway loop causing client-side exceptions
    const isAlreadyGenerating = queue.some(item => item.status === 'generating');
    if (isAlreadyGenerating) return; 

    const nextItem = queue.find(item => item.status === 'waiting');
    if (!nextItem) {
      setIsProcessing(false);
      setActiveItemId(null);
      alert('Bulk AI Automation queue has finished processing!');
      loadProducts(); // Reload updated content
      return;
    }

    setActiveItemId(nextItem.id);
    processQueueItem(nextItem);

  }, [isProcessing, queue]);

  async function processQueueItem(item: QueueItem) {
    // Helper to update state of active queue item
    const updateItemState = (updater: Partial<QueueItem>) => {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, ...updater } : q));
    };

    updateItemState({ status: 'generating', currentStep: 'Analyzing Content' });

    const variables = {
      article_title: item.product.title,
      article_content: item.product.description || item.product.title,
      product_name: item.product.title,
      product_category: 'Catalog',
      focus_keyword: item.product.title,
      language: 'English',
      country: 'Global',
      brand_name: 'SpeedCommerce',
      existing_faqs: JSON.stringify(item.product.faq || []),
      existing_seo_title: item.product.seoTitle || '',
      existing_seo_description: item.product.seoDescription || '',
      faq_count: '5'
    };

    try {
      const completed: string[] = [];
      const failed: string[] = [];
      const updateData: any = {};

      // Step 1: Product Details (if full or details selected)
      if (taskType === 'full' || taskType === 'details') {
        updateItemState({ currentStep: 'Generating Product Details' });
        const res = await executeAITask('productDetails', variables);
        if (res.success && res.data) {
          completed.push('Product Details');
          
          // Map AI JSON format into the UI Array Format so it renders correctly
          const formattedDetails: {key: string, value: string}[] = [];
          if (res.data.summary) formattedDetails.push({ key: 'Summary', value: res.data.summary });
          if (Array.isArray(res.data.features)) {
            res.data.features.forEach((f: string, i: number) => formattedDetails.push({ key: `Feature ${i+1}`, value: f }));
          }
          if (Array.isArray(res.data.benefits)) {
            res.data.benefits.forEach((b: string, i: number) => formattedDetails.push({ key: `Benefit ${i+1}`, value: b }));
          }
          
          updateData.details = formattedDetails;
          if (res.data.html && (!item.product.description || item.product.description.length < 10)) {
            updateData.description = res.data.html;
          }
          if (res.data.tags && Array.isArray(res.data.tags)) {
            updateData.tags = res.data.tags;
          }
          if (res.data.shortDescription) {
            updateData.shortDescription = res.data.shortDescription;
          }
        } else {
          failed.push('Product Details');
        }
      }

      // Step 2: FAQs (if full or faqs selected)
      if (taskType === 'full' || taskType === 'faqs') {
        updateItemState({ currentStep: 'Generating FAQ Block' });
        const res = await executeAITask('faqs', variables);
        if (res.success && Array.isArray(res.data)) {
          completed.push('FAQs');
          updateData.faq = res.data;
        } else {
          failed.push('FAQs');
        }
      }

      // Step 3: SEO Title (if full or titles selected)
      if (taskType === 'full' || taskType === 'titles') {
        updateItemState({ currentStep: 'Optimizing SEO Titles' });
        const res = await executeAITask('seoTitles', variables);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          completed.push('SEO Title');
          updateData.seoTitle = res.data[0].title;
        } else {
          failed.push('SEO Title');
        }
      }

      // Step 4: SEO Description (if full or descriptions selected)
      if (taskType === 'full' || taskType === 'descriptions') {
        updateItemState({ currentStep: 'Optimizing SEO Description' });
        const res = await executeAITask('seoDescriptions', variables);
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          completed.push('SEO Description');
          updateData.seoDescription = res.data[0].description;
        } else {
          failed.push('SEO Description');
        }
      }

      // Step 5: Advanced SEO Focus Keyword & Image Alts AI Generation
      if (taskType === 'full' || taskType === 'details' || taskType === 'titles') {
         updateItemState({ currentStep: 'Generating Focus Keyword & Image Alts' });
         
         const imageCount = item.product.images ? item.product.images.length : 0;
         
         const kwVars = {
            product_name: item.product.title,
            product_category: 'Catalog',
            image_count: imageCount.toString()
         };
         
         const res = await executeAITask('seoKeywordsAndAlts', kwVars);
         
         if (res.success && res.data) {
           // Always apply the new, optimized focus keyword
           if (res.data.focusKeyword) {
             updateData.focusKeyword = res.data.focusKeyword;
             if (!completed.includes('Focus Keyword')) completed.push('Focus Keyword');
           }
           
           // Force apply the best alt text to EVERY image, overriding old/empty ones
           if (imageCount > 0 && Array.isArray(res.data.imageAlts)) {
             const newImages = [...item.product.images];
             let updatedImages = false;
             
             newImages.forEach((img, idx) => {
                 // Use the unique AI generated alt text, fallback to a smart generic one if AI missed one
                 img.altText = res.data.imageAlts[idx] || `${res.data.focusKeyword || item.product.title} - View ${idx + 1}`;
                 updatedImages = true;
             });
             
             if (updatedImages) {
                 updateData.images = newImages;
                 if (!completed.includes('Image Alts')) completed.push('Image Alts');
             }
           }
         } else {
           failed.push('Keywords & Alts');
         }
      }

      // Save database entry
      if (Object.keys(updateData).length > 0) {
        const saveRes = await saveProductDataForAI(item.id, updateData);
        if (!saveRes.success) {
          failed.push('Database Save');
          throw new Error(saveRes.error || 'Failed to save product AI data');
        }
      }

      updateItemState({
        status: failed.length === 0 ? 'completed' : 'failed',
        currentStep: failed.length === 0 ? 'Finished' : 'Partial completion',
        completedFields: completed,
        failedFields: failed
      });

    } catch (err: any) {
      updateItemState({
        status: 'failed',
        currentStep: 'Failed to complete',
        error: err.message || 'AI engine runtime error'
      });
    }
  }

  function handleCancelItem(id: string) {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status: 'cancelled', currentStep: 'Cancelled by User' } : q));
  }

  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Bulk AI Generator Queue</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Select multiple products and run automated generation steps in a rate-limited queue to improve missing product data.</p>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Products</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalProducts}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', borderBottom: '4px solid #10b981' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Already Generated</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{generatedProducts}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', borderBottom: '4px solid #E0A96D' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Not Generated (New)</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#E0A96D', marginTop: '4px' }}>{newProducts}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
        <button 
          onClick={() => { setFilter('all'); setSelectedIds([]); }} 
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', background: filter === 'all' ? '#1e293b' : '#f1f5f9', color: filter === 'all' ? '#fff' : '#475569' }}
        >
          All Products
        </button>
        <button 
          onClick={() => { setFilter('new'); setSelectedIds([]); }} 
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', background: filter === 'new' ? '#E0A96D' : '#f1f5f9', color: filter === 'new' ? '#fff' : '#475569' }}
        >
          Not Generated ({newProducts})
        </button>
        <button 
          onClick={() => { setFilter('generated'); setSelectedIds([]); }} 
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', background: filter === 'generated' ? '#10b981' : '#f1f5f9', color: filter === 'generated' ? '#fff' : '#475569' }}
        >
          Already Generated ({generatedProducts})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Select Products */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
            <span>Select Products ({selectedIds.length} chosen)</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => {
                  const next50 = displayedProducts.slice(0, 50).map(p => p.id);
                  setSelectedIds(next50);
                }} 
                style={{ fontSize: '12px', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Select Next 50
              </button>
              <button onClick={toggleSelectAll} style={{ fontSize: '12px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                {selectedIds.length === displayedProducts.length && displayedProducts.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </h2>

          <div style={{ maxHeight: '480px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            {displayedProducts.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No products found in this list.</div>
            )}
            {displayedProducts.map((product) => (
              <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {product.title}
                    {product.generatedByAI && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '10px' }}>AI Generated</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>slug: /{product.slug}</div>
                </div>
                <span style={{ fontSize: '11px', background: product.isPublished ? '#d1fae5' : '#f1f5f9', color: product.isPublished ? '#065f46' : '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                  {product.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trigger Panel */}
        <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Bulk Automation Panel</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Select AI Tasks</label>
              <select 
                value={taskType} 
                onChange={(e: any) => setTaskType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
              >
                <option value="full">Run Complete AI Automation (All fields)</option>
                <option value="details">Generate missing Product Details</option>
                <option value="faqs">Generate FAQ sections only</option>
                <option value="titles">Optimize SEO Titles only</option>
                <option value="descriptions">Optimize SEO Descriptions only</option>
              </select>
            </div>

            <button 
              onClick={startBulkAutomation}
              disabled={isProcessing || selectedIds.length === 0}
              style={{
                width: '100%',
                background: '#E0A96D',
                color: '#180d15',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
                opacity: selectedIds.length === 0 ? 0.6 : 1,
                boxShadow: '0 4px 6px -1px rgba(224, 169, 109, 0.2)'
              }}
            >
              {isProcessing ? 'Processing Queue...' : `Start Bulk AI (${selectedIds.length})`}
            </button>
          </div>

        </div>

      </div>

      {/* Queue Progress Monitor */}
      {queue.length > 0 && (
        <div style={{ marginTop: '40px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Live Automation Process Logs</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {queue.map((item) => (
              <div key={item.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifySelf: 'space-between', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9', background: activeItemId === item.id ? 'rgba(224, 169, 109, 0.05)' : '#ffffff' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Status: <span style={{ 
                      fontWeight: 'bold', 
                      color: item.status === 'completed' ? '#10b981' : item.status === 'failed' ? '#ef4444' : item.status === 'generating' ? '#E0A96D' : '#64748b' 
                    }}>{item.status.toUpperCase()}</span> — {item.currentStep}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {item.completedFields.length > 0 && (
                    <span style={{ fontSize: '11px', background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Completed: {item.completedFields.join(', ')}
                    </span>
                  )}
                  {item.failedFields.length > 0 && (
                    <span style={{ fontSize: '11px', background: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Failed: {item.failedFields.join(', ')}
                    </span>
                  )}
                  {item.error && (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>({item.error})</span>
                  )}
                  {item.status === 'generating' && (
                    <button onClick={() => handleCancelItem(item.id)} style={{ border: 'none', background: '#cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
