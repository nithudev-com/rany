'use client';

import { useState, useEffect } from 'react';
import { getProductsListForAI, saveGeneratedBlog } from '@/app/admin/(dashboard)/products/actions';
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
  hasBlog?: boolean;
  existingBlog?: { id: string, title: string, isPublished: boolean } | null;
}

interface QueueItem {
  id: string;
  title: string;
  product: ProductSummary;
  status: 'waiting' | 'generating' | 'completed' | 'failed' | 'cancelled' | 'skipped';
  currentStep: string;
  error?: string;
  generatedBlogId?: string;
}

export default function BulkProductBlogGeneratorPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'no-blog' | 'has-blog'>('all');
  
  // Generation Settings
  const [articleType, setArticleType] = useState('Product Guide');
  const [tone, setTone] = useState('Professional');
  const [contentLength, setContentLength] = useState('Detailed');
  const [skipExisting, setSkipExisting] = useState(true);
  
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
  const withBlog = products.filter(p => p.hasBlog).length;
  const withoutBlog = totalProducts - withBlog;

  const displayedProducts = products.filter(p => {
    if (filter === 'has-blog') return p.hasBlog;
    if (filter === 'no-blog') return !p.hasBlog;
    return true;
  });

  async function startBulkAutomation() {
    if (selectedIds.length === 0) {
      alert('Please select at least one product to generate blogs for.');
      return;
    }

    const items: QueueItem[] = selectedIds.map(id => {
      const product = products.find(p => p.id === id)!;
      return {
        id,
        title: product.title,
        product,
        status: 'waiting',
        currentStep: 'Waiting in Queue'
      };
    });

    setQueue(items);
    setIsProcessing(true);
  }

  // Loop processing items sequentially
  useEffect(() => {
    if (!isProcessing || queue.length === 0) return;
    
    const isAlreadyGenerating = queue.some(item => item.status === 'generating');
    if (isAlreadyGenerating) return; 

    const nextItem = queue.find(item => item.status === 'waiting');
    if (!nextItem) {
      setIsProcessing(false);
      setActiveItemId(null);
      alert('Bulk Product Blog Generator queue has finished processing!');
      loadProducts();
      return;
    }

    setActiveItemId(nextItem.id);
    processQueueItem(nextItem);

  }, [isProcessing, queue]);

  async function processQueueItem(item: QueueItem) {
    const updateItemState = (updater: Partial<QueueItem>) => {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, ...updater } : q));
    };

    if (skipExisting && item.product.hasBlog) {
      updateItemState({ status: 'skipped', currentStep: 'Skipped (Blog exists)' });
      return;
    }

    updateItemState({ status: 'generating', currentStep: 'Generating Blog Content' });

    const variables = {
      product_title: item.product.title,
      product_description: item.product.description || item.product.title,
      product_details: JSON.stringify(item.product.details || {}),
      focus_keyword: item.product.focusKeyword || item.product.title,
      article_type: articleType,
      tone: tone,
      content_length: contentLength,
      language: 'English'
    };

    try {
      const res = await executeAITask('productBlogGenerator', variables);
      
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Invalid API response from Gemini');
      }

      updateItemState({ currentStep: 'Saving Blog Draft' });
      
      const aiData = res.data;
      
      // Strict Validation: DO NOT save if the AI failed to return the required core content
      if (!aiData.article || !aiData.article.title || !aiData.article.contentHtml || aiData.article.contentHtml.length < 50) {
        throw new Error('AI API Error: Incomplete or empty blog content returned. Aborting save.');
      }
      
      // Randomly select a product image as cover image for variety across multiple articles
      let coverImageUrl = '';
      if (item.product.images && item.product.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * item.product.images.length);
        const selectedImg = item.product.images[randomIndex];
        coverImageUrl = selectedImg.secureUrl || selectedImg.imageUrl || selectedImg.url || '';
      }

      const saveRes = await saveGeneratedBlog(item.id, {
        title: aiData.article.title,
        slug: aiData.article.slug || `blog-${item.product.slug}`,
        excerpt: aiData.article.excerpt || '',
        contentHtml: aiData.article.contentHtml,
        seoTitle: aiData.seo?.seoTitle,
        seoDescription: aiData.seo?.seoDescription,
        focusKeyword: aiData.seo?.focusKeyword,
        secondaryKeywords: aiData.seo?.secondaryKeywords,
        faqs: aiData.faqs,
        coverImage: coverImageUrl,
        isPublished: true // Auto Publish
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || 'Database save failed');
      }

      updateItemState({
        status: 'completed',
        currentStep: 'Finished',
        generatedBlogId: saveRes.blogId
      });

    } catch (err: any) {
      updateItemState({
        status: 'failed',
        currentStep: 'Generation failed',
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
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Bulk Product Blog Generator</h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Select multiple products to automatically generate unique, SEO-optimized blog articles based on product data.</p>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Total Products</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>{totalProducts}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', borderBottom: '4px solid #10b981' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Has Linked Blog</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>{withBlog}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', borderBottom: '4px solid #E0A96D' }}>
          <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Needs Blog</div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#E0A96D', marginTop: '4px' }}>{withoutBlog}</div>
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
          onClick={() => { setFilter('no-blog'); setSelectedIds([]); }} 
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', background: filter === 'no-blog' ? '#E0A96D' : '#f1f5f9', color: filter === 'no-blog' ? '#fff' : '#475569' }}
        >
          No Blog ({withoutBlog})
        </button>
        <button 
          onClick={() => { setFilter('has-blog'); setSelectedIds([]); }} 
          style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', border: 'none', background: filter === 'has-blog' ? '#10b981' : '#f1f5f9', color: filter === 'has-blog' ? '#fff' : '#475569' }}
        >
          Has Blog ({withBlog})
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
                    {product.hasBlog && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '10px' }}>Blog Exists</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>slug: /{product.slug}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trigger Panel */}
        <div style={{ position: 'sticky', top: '120px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 16px 0' }}>Generation Settings</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Article Type</label>
              <select 
                value={articleType} 
                onChange={(e) => setArticleType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
              >
                <option value="Product Guide">Product Guide</option>
                <option value="Product Overview">Product Overview</option>
                <option value="Product Benefits Article">Product Benefits Article</option>
                <option value="How-to-use Article">How-to-use Article</option>
                <option value="Buying Guide">Buying Guide</option>
                <option value="Product Comparison">Product Comparison</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Writing Tone</label>
              <select 
                value={tone} 
                onChange={(e) => setTone(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Informative">Informative</option>
                <option value="Premium">Premium</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Content Length</label>
              <select 
                value={contentLength} 
                onChange={(e) => setContentLength(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', background: '#fff' }}
              >
                <option value="Short">Short</option>
                <option value="Standard">Standard</option>
                <option value="Detailed">Detailed</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={skipExisting} 
                  onChange={(e) => setSkipExisting(e.target.checked)}
                />
                Skip products that already have blogs
              </label>
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
              {isProcessing ? 'Processing Queue...' : `Generate Product Blogs`}
            </button>
          </div>

        </div>

      </div>

      {/* Queue Progress Monitor */}
      {queue.length > 0 && (
        <div style={{ marginTop: '40px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 20px 0' }}>Live Generation Queue</h2>
          
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
                  {item.error && (
                    <span style={{ fontSize: '11px', color: '#ef4444', fontStyle: 'italic' }}>({item.error})</span>
                  )}
                  {item.status === 'generating' && (
                    <button onClick={() => handleCancelItem(item.id)} style={{ border: 'none', background: '#cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel</button>
                  )}
                  {item.status === 'completed' && item.generatedBlogId && (
                    <a href={`/admin/blog/${item.generatedBlogId}/edit`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' }}>Review Draft ↗</a>
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
