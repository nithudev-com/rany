'use client';

import { createBlogPost, updateBlogPost } from '@/actions/blog';
import { executeAITask } from '@/actions/gemini';
import { useTransition, useState, useEffect } from 'react';
import Link from 'next/link';

interface Block {
  id: string;
  type: string; // 'paragraph' | 'h2' | 'h3' | 'h4' | 'quote' | 'code' | 'callout' | 'button' | 'image' | 'youtube' | 'faq'
  content: string;
  meta?: any;
  faqItems?: { question: string; answer: string }[];
}

interface Toast {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function BlogForm({ post }: { post?: any }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [toast, setToast] = useState<Toast | null>(null);

  // Core fields
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [isPublished, setIsPublished] = useState(post?.isPublished || false);
  const [isDirty, setIsDirty] = useState(false);

  // Sidebar Settings
  const [status, setStatus] = useState(post?.isPublished ? 'published' : 'draft');
  const [visibility, setVisibility] = useState('public');
  const [password, setPassword] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [author, setAuthor] = useState('Nithu');

  // Categories & Tags
  const [categories, setCategories] = useState(['Wellness', 'Pleasure Guides', 'Reviews', 'Intimacy & Love']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Wellness']);
  const [newCatInput, setNewCatInput] = useState('');
  const [tags, setTags] = useState(['vibrators', 'wellness', 'couples', 'tips', 'guide']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // SEO & Keyword Panel
  const [focusKeyword, setFocusKeyword] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [metaRobots, setMetaRobots] = useState('index, follow');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');

  // Social & Schema
  const [activePreviewTab, setActivePreviewTab] = useState<'google' | 'social'>('google');
  const [googleDevice, setGoogleDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [socialPlatform, setSocialPlatform] = useState<'facebook' | 'twitter' | 'linkedin'>('facebook');
  const [schemaType, setSchemaType] = useState('BlogPosting');

  // Cover Image Meta
  const [coverAlt, setCoverAlt] = useState(post?.title ? `Cover for ${post.title}` : '');
  const [coverCaption, setCoverCaption] = useState('');
  const [coverCredit, setCoverCredit] = useState('');

  // Visual Editor State
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [htmlContent, setHtmlContent] = useState('');

  // AI Assistant Collapsible and Source Details
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(true);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Wellness');
  const [productBrand, setProductBrand] = useState('Rany.uk');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [productLength, setProductLength] = useState<'short' | 'standard' | 'detailed'>('standard');
  const [productTone, setProductTone] = useState<'professional' | 'friendly' | 'premium' | 'informative' | 'persuasive' | 'simple'>('premium');
  const [faqCount, setFaqCount] = useState('5');
  const [targetAudience, setTargetAudience] = useState('Wellness and Pleasure Seekers');
  const [countryFocus, setCountryFocus] = useState('Global');

  // Sequential AI Progress Queue States
  const [aiStatus, setAiStatus] = useState<'idle' | 'generating' | 'completed' | 'failed' | 'cancelled'>('idle');
  const [aiStepsProgress, setAiStepsProgress] = useState<Record<string, 'waiting' | 'generating' | 'completed' | 'failed'>>({
    analyze: 'waiting',
    details: 'waiting',
    faqs: 'waiting',
    titles: 'waiting',
    descriptions: 'waiting',
    seoScore: 'waiting'
  });
  const [activeStepText, setActiveStepText] = useState('');

  // AI Output Selection Matrices
  const [generatedTitles, setGeneratedTitles] = useState<{ title: string; score: number; reason: string }[]>([]);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<{ description: string; score: number; reason: string }[]>([]);
  const [aiHistoryList, setAiHistoryList] = useState<any[]>([]);

  // Recovery & Autosave
  const [hasBackup, setHasBackup] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [createdDateStr, setCreatedDateStr] = useState('2026-07-02T00:00:00.000Z');

  // Backup state for Undo
  const [historyBackup, setHistoryBackup] = useState<{
    blocks: Block[];
    title: string;
    excerpt: string;
    coverImage: string;
    seoTitle: string;
    metaDesc: string;
  } | null>(null);

  // Initialize Blocks & Metadata on load
  useEffect(() => {
    setCreatedDateStr(post?.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString());

    if (post?.content) {
      const parsed = parseHtmlToBlocks(post.content);
      setBlocks(parsed);
      setHtmlContent(post.content);

      // Extract JSON metadata (Legacy fallback for old posts)
      const match = post.content.match(/<script type="application\/json" id="post-ai-metadata">([\s\S]*?)<\/script>/);
      if (match) {
        try {
          const meta = JSON.parse(match[1]);
          setSeoTitle(post.seoTitle || meta.seoTitle || '');
          setMetaDesc(post.seoDescription || meta.seoDescription || '');
          setFocusKeyword(post.focusKeyword || meta.focusKeyword || '');
          setSecondaryKeywords(post.secondaryKeywords || meta.secondaryKeywords || '');
          setProductName(meta.productName || '');
          setProductCategory(meta.productCategory || '');
          setProductBrand(meta.productBrand || '');
          setTargetAudience(meta.targetAudience || 'Wellness and Pleasure Seekers');
          setCountryFocus(meta.countryFocus || 'Global');
          setAiHistoryList(meta.aiHistory || []);
        } catch {}
      } else {
        setSeoTitle(post.seoTitle || '');
        setMetaDesc(post.seoDescription || '');
        setFocusKeyword(post.focusKeyword || '');
        setSecondaryKeywords(post.secondaryKeywords ? JSON.stringify(post.secondaryKeywords) : '');
      }
    } else {
      setBlocks([
        { id: 'b1', type: 'paragraph', content: 'Start writing your premium article here. Highlight text or use the controls to design layout blocks...' }
      ]);
    }

    const backupKey = `blog_draft_${post?.id || 'new'}`;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      setHasBackup(true);
    }
  }, []);

  // Sync dirty state
  useEffect(() => {
    setIsDirty(true);
  }, [title, slug, excerpt, coverImage, blocks, htmlContent]);

  // Autosave
  useEffect(() => {
    const timer = setInterval(() => {
      const draftData = {
        title,
        slug,
        excerpt,
        coverImage,
        blocks,
        htmlContent,
        savedAt: new Date().toLocaleTimeString()
      };
      localStorage.setItem(`blog_draft_${post?.id || 'new'}`, JSON.stringify(draftData));
      setLastSaved(new Date().toLocaleTimeString());
    }, 15000);

    return () => clearInterval(timer);
  }, [title, slug, excerpt, coverImage, blocks, htmlContent]);

  // Unsaved changes warning
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Helper: HTML parser to blocks
  function parseHtmlToBlocks(html: string): Block[] {
    if (typeof window === 'undefined') return [];
    const div = document.createElement('div');
    div.innerHTML = html;
    const items: Block[] = [];
    
    Array.from(div.children).forEach((child, idx) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style') return; // CRITICAL FIX: skip scripts
      
      let type = 'paragraph';
      let meta: any = {};
      let faqItems: any[] = [];

      if (tag.startsWith('h')) {
        type = tag;
      } else if (tag === 'blockquote') {
        type = 'quote';
      } else if (tag === 'pre') {
        type = 'code';
      } else if (tag === 'figure' && child.querySelector('img')) {
        type = 'image';
        const img = child.querySelector('img');
        meta = {
          src: img?.getAttribute('src') || '',
          alt: img?.getAttribute('alt') || '',
          caption: child.querySelector('figcaption')?.textContent || ''
        };
      } else if (child.classList.contains('callout-box')) {
        type = 'callout';
      } else if (child.classList.contains('cta-button')) {
        type = 'button';
        meta = { href: child.getAttribute('href') || '#' };
      } else if (child.querySelector('iframe')) {
        type = 'youtube';
        meta = { url: child.querySelector('iframe')?.getAttribute('src') || '' };
      } else if (child.classList.contains('faq-section')) {
        type = 'faq';
        const jsonStr = child.getAttribute('data-faq-json') || '[]';
        try {
          faqItems = JSON.parse(jsonStr);
        } catch {
          faqItems = [];
        }
      }

      items.push({
        id: `parsed-${idx}`,
        type,
        content: child.textContent || '',
        meta,
        faqItems
      });
    });

    // Remove metadata elements from blocks lists (including those accidentally saved as paragraphs)
    return items.filter(
      item => 
        !item.content.includes('"@context": "https://schema.org"') && 
        !item.content.includes('post-ai-metadata') &&
        !item.content.includes('"seoTitle":')
    );
  }

  // Helper: Blocks serializer to HTML
  function serializeBlocksToHtml(blocksList: Block[]): string {
    const rawHtml = blocksList.map(b => {
      switch (b.type) {
        case 'h2': return `<h2>${b.content}</h2>`;
        case 'h3': return `<h3>${b.content}</h3>`;
        case 'h4': return `<h4>${b.content}</h4>`;
        case 'quote': return `<blockquote>${b.content}</blockquote>`;
        case 'code': return `<pre><code>${b.content}</code></pre>`;
        case 'callout': return `<div class="callout-box" style="padding: 18px; background: rgba(224, 169, 109, 0.08); border-left: 4px solid #E0A96D; border-radius: 6px; margin: 18px 0;">${b.content}</div>`;
        case 'button': return `<a href="${b.meta?.href || '#'}" class="cta-button" style="display: inline-block; padding: 12px 24px; background: #E0A96D; color: #180d15; font-weight: 700; text-decoration: none; border-radius: 4px;">${b.content}</a>`;
        case 'image': return `<figure style="margin: 20px 0;"><img src="${b.meta?.src || ''}" alt="${b.meta?.alt || ''}" style="width:100%; border-radius: 8px;" /><figcaption style="font-size: 13px; color: #64748b; margin-top: 6px; text-align: center;">${b.meta?.caption || ''}</figcaption></figure>`;
        case 'youtube': {
          const embedId = b.meta?.url ? extractYoutubeId(b.meta.url) : '';
          return `<div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:12px; margin:20px 0;"><iframe src="https://www.youtube.com/embed/${embedId}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen></iframe></div>`;
        }
        case 'faq': {
          const faqItemsHtml = (b.faqItems || []).map(item => `
            <div class="faq-item" style="border-bottom: 1px solid #f1f5f9; padding: 16px 0;">
              <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 16px; font-weight: bold;">Q: ${item.question}</h4>
              <p style="margin: 0; color: #475569; font-size: 14px;">A: ${item.answer}</p>
            </div>
          `).join('');

          return `
            <div class="faq-section" data-faq-json='${JSON.stringify(b.faqItems || [])}' style="margin: 28px 0; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; background: #ffffff;">
              <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800; border-bottom: 2px solid #E0A96D; padding-bottom: 8px;">Frequently Asked Questions</h3>
              ${faqItemsHtml}
            </div>
          `;
        }
        default: return `<p>${b.content}</p>`;
      }
    }).join('\n');

    // Build schemas automatically
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "headline": title || 'Untitled',
      "description": excerpt || '',
      "image": coverImage || undefined,
      "author": {
        "@type": "Person",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "Rany.uk",
        "logo": {
          "@type": "ImageObject",
          "url": "https://rany.uk/logo.png"
        }
      },
      "datePublished": createdDateStr,
      "mainEntityOfPage": `https://rany.uk/blog/${slug}`
    };

    const faqBlock = blocksList.find(b => b.type === 'faq');
    let faqSchema = null;
    if (faqBlock && faqBlock.faqItems && faqBlock.faqItems.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqBlock.faqItems.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
    }

    const articleScript = `<script type="application/ld+json">\n${JSON.stringify(articleSchema, null, 2)}\n</script>`;
    const faqScript = faqSchema ? `\n<script type="application/ld+json">\n${JSON.stringify(faqSchema, null, 2)}\n</script>` : '';

    // Append metadata JSON script
    const metaObj = {
      seoTitle,
      seoDescription: metaDesc,
      focusKeyword,
      secondaryKeywords,
      productName,
      productCategory,
      productBrand,
      targetAudience,
      countryFocus,
      aiHistory: aiHistoryList
    };
    const metaScript = `\n<script type="application/json" id="post-ai-metadata">\n${JSON.stringify(metaObj, null, 2)}\n</script>`;

    return rawHtml + '\n' + articleScript + faqScript + metaScript;
  }

  function extractYoutubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!post?.id) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generated);
    }
  }

  function handleSlugChange(val: string) {
    const formatted = val
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(formatted);
  }

  function restoreBackup() {
    const backupKey = `blog_draft_${post?.id || 'new'}`;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      const data = JSON.parse(backup);
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt);
      setCoverImage(data.coverImage);
      setBlocks(data.blocks);
      setHtmlContent(data.htmlContent);
      setHasBackup(false);
      showToast('success', 'Backup restored successfully');
    }
  }

  // Backup current state before changes
  const backupCurrentState = () => {
    setHistoryBackup({
      blocks: JSON.parse(JSON.stringify(blocks)),
      title,
      excerpt,
      coverImage,
      seoTitle,
      metaDesc
    });
  };

  // Undo AI changes
  const handleUndoAI = () => {
    if (historyBackup) {
      setBlocks(historyBackup.blocks);
      setTitle(historyBackup.title);
      setExcerpt(historyBackup.excerpt);
      setCoverImage(historyBackup.coverImage);
      setSeoTitle(historyBackup.seoTitle);
      setMetaDesc(historyBackup.metaDesc);
      setHistoryBackup(null);
      showToast('success', 'AI actions rolled back successfully.');
    }
  };

  function showToast(type: 'success' | 'error' | 'info', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // Add block manually
  function addBlock(type: string) {
    const newBlock: Block = {
      id: `b-${Date.now()}`,
      type,
      content: type === 'paragraph' ? 'Click here to edit text...' : `New ${type.toUpperCase()} content...`,
      meta: type === 'image' ? { src: '', alt: '', caption: '' } : type === 'button' ? { href: '#' } : type === 'youtube' ? { url: '' } : {},
      faqItems: type === 'faq' ? [{ question: 'Sample Question?', answer: 'Sample Answer text...' }] : undefined
    };
    setBlocks([...blocks, newBlock]);
  }

  function updateBlockContent(id: string, text: string) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: text } : b));
  }

  function updateBlockMeta(id: string, key: string, val: string) {
    setBlocks(blocks.map(b => b.id === id ? { ...b, meta: { ...b.meta, [key]: val } } : b));
  }

  function deleteBlock(id: string) {
    if (blocks.length <= 1) return;
    setBlocks(blocks.filter(b => b.id !== id));
  }

  // FAQ block methods
  function updateFaqRow(blockId: string, idx: number, field: 'question' | 'answer', val: string) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      const updatedItems = (b.faqItems || []).map((item, i) => i === idx ? { ...item, [field]: val } : item);
      return { ...b, faqItems: updatedItems };
    }));
  }

  function addFaqRow(blockId: string) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      return { ...b, faqItems: [...(b.faqItems || []), { question: 'New Question?', answer: 'New Answer...' }] };
    }));
  }

  function removeFaqRow(blockId: string, idx: number) {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId) return b;
      return { ...b, faqItems: (b.faqItems || []).filter((_, i) => i !== idx) };
    }));
  }

  function reorderFaq(blockId: string, index: number, direction: 'up' | 'down') {
    setBlocks(blocks.map(b => {
      if (b.id !== blockId || !b.faqItems) return b;
      const list = [...b.faqItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return b;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...b, faqItems: list };
    }));
  }

  // Sequential AI Automation Callouts
  async function handleSequentialAI() {
    backupCurrentState();
    setAiStatus('generating');
    setAiStepsProgress({
      analyze: 'generating',
      details: 'waiting',
      faqs: 'waiting',
      titles: 'waiting',
      descriptions: 'waiting',
      seoScore: 'waiting'
    });
    setActiveStepText('Step 1: Analyzing Article Content Structure...');

    const variables = {
      article_title: title,
      article_content: blocks.map(b => b.content).join('\n'),
      product_name: productName || title.split('Review')[0].trim() || 'product',
      product_category: productCategory,
      brand_name: productBrand,
      focus_keyword: focusKeyword,
      secondary_keywords: secondaryKeywords,
      target_audience: targetAudience,
      country: countryFocus,
      language: 'English',
      faq_count: faqCount
    };

    await new Promise(r => setTimeout(r, 1000));
    setAiStepsProgress(p => ({ ...p, analyze: 'completed', details: 'generating' }));
    setActiveStepText('Step 2: Generating Product Details...');

    // Details AI
    const detailsRes = await executeAITask('productDetails', variables);
    if (detailsRes.success && detailsRes.data?.html) {
      const detailsBlock: Block = {
        id: `details-${Date.now()}`,
        type: 'callout',
        content: `📦 PRODUCT DETAILS: ${productName || 'Product'}\n\n${detailsRes.data.html.replace(/<[^>]*>/g, '')}`
      };
      setBlocks(prev => [detailsBlock, ...prev]);
      setAiStepsProgress(p => ({ ...p, details: 'completed', faqs: 'generating' }));
    } else {
      setAiStepsProgress(p => ({ ...p, details: 'failed', faqs: 'generating' }));
    }

    setActiveStepText('Step 3: Generating Frequently Asked Questions...');
    
    // FAQ AI
    const faqRes = await executeAITask('faqs', variables);
    if (faqRes.success && Array.isArray(faqRes.data)) {
      const faqBlock: Block = {
        id: `faq-${Date.now()}`,
        type: 'faq',
        content: 'FAQs Section',
        faqItems: faqRes.data
      };
      setBlocks(prev => [...prev, faqBlock]);
      setAiStepsProgress(p => ({ ...p, faqs: 'completed', titles: 'generating' }));
    } else {
      setAiStepsProgress(p => ({ ...p, faqs: 'failed', titles: 'generating' }));
    }

    setActiveStepText('Step 4: Suggesting SEO Titles...');

    // Titles AI
    const titleRes = await executeAITask('seoTitles', variables);
    if (titleRes.success && Array.isArray(titleRes.data)) {
      setGeneratedTitles(titleRes.data);
      setAiStepsProgress(p => ({ ...p, titles: 'completed', descriptions: 'generating' }));
    } else {
      setAiStepsProgress(p => ({ ...p, titles: 'failed', descriptions: 'generating' }));
    }

    setActiveStepText('Step 5: Optimizing SEO Descriptions...');

    // Description AI
    const descRes = await executeAITask('seoDescriptions', variables);
    if (descRes.success && Array.isArray(descRes.data)) {
      setGeneratedDescriptions(descRes.data);
      setAiStepsProgress(p => ({ ...p, descriptions: 'completed', seoScore: 'completed' }));
      setAiStatus('completed');
      setActiveStepText('Gemini AI sequential workflow has completed successfully.');
    } else {
      setAiStepsProgress(p => ({ ...p, descriptions: 'failed', seoScore: 'failed' }));
      setAiStatus('failed');
      setActiveStepText('Automation finished with errors. Review log details.');
    }

    // Add History
    const logItem = {
      timestamp: new Date().toLocaleString(),
      action: 'Full AI Generation Sequence',
      model: 'gemini-1.5-flash',
      section: 'All fields',
      status: 'completed',
      oldContent: 'Previous state backed up',
      newContent: 'Generated product details, FAQs, and SEO tags',
      user: 'Nithu'
    };
    setAiHistoryList(prev => [logItem, ...prev]);
  }

  // Individual generators
  async function triggerDetailsAI() {
    backupCurrentState();
    const variables = {
      product_name: productName || title.split('Review')[0].trim() || 'product',
      product_category: productCategory,
      brand_name: productBrand,
      focus_keyword: focusKeyword,
      target_audience: targetAudience,
      country: countryFocus,
      language: 'English'
    };
    showToast('info', 'Generating product details details...');
    const res = await executeAITask('productDetails', variables);
    if (res.success && res.data?.html) {
      const detailsBlock: Block = {
        id: `details-${Date.now()}`,
        type: 'callout',
        content: `📦 PRODUCT DETAILS: ${productName || 'Product'}\n\n${res.data.html.replace(/<[^>]*>/g, '')}`
      };
      setBlocks([detailsBlock, ...blocks]);
      showToast('success', 'Details generated successfully!');
    } else {
      showToast('error', res.error || 'Failed to generate');
    }
  }

  async function triggerFaqsAI() {
    backupCurrentState();
    const variables = {
      product_name: productName || title.split('Review')[0].trim() || 'product',
      article_content: blocks.map(b => b.content).join('\n'),
      focus_keyword: focusKeyword,
      faq_count: faqCount
    };
    showToast('info', 'Generating FAQ lists...');
    const res = await executeAITask('faqs', variables);
    if (res.success && Array.isArray(res.data)) {
      const faqBlock: Block = {
        id: `faq-${Date.now()}`,
        type: 'faq',
        content: 'FAQs Section',
        faqItems: res.data
      };
      setBlocks([...blocks, faqBlock]);
      showToast('success', 'FAQs generated successfully!');
    } else {
      showToast('error', res.error || 'Failed to generate FAQs');
    }
  }

  async function triggerTitlesAI() {
    const variables = {
      article_title: title,
      product_name: productName || title.split('Review')[0].trim() || 'product',
      focus_keyword: focusKeyword
    };
    showToast('info', 'Generating SEO title suggestions...');
    const res = await executeAITask('seoTitles', variables);
    if (res.success && Array.isArray(res.data)) {
      setGeneratedTitles(res.data);
      showToast('success', 'Suggestions loaded!');
    } else {
      showToast('error', res.error || 'Failed to suggest titles');
    }
  }

  async function triggerDescriptionsAI() {
    const variables = {
      article_title: title,
      product_details: blocks.map(b => b.content).join('\n'),
      focus_keyword: focusKeyword
    };
    showToast('info', 'Generating SEO description suggestions...');
    const res = await executeAITask('seoDescriptions', variables);
    if (res.success && Array.isArray(res.data)) {
      setGeneratedDescriptions(res.data);
      showToast('success', 'Suggestions loaded!');
    } else {
      showToast('error', res.error || 'Failed to suggest descriptions');
    }
  }

  // Word count
  const totalText = blocks.map(b => b.content).join(' ') + ' ' + htmlContent;
  const wordCount = totalText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = totalText.length;
  const readTime = Math.ceil(wordCount / 200);

  // SEO Health Analyzer
  const seoChecks = [
    { name: "Focus keyword defined", val: !!focusKeyword, desc: "Add a main focus keyword to optimize content." },
    { name: "Focus keyword in Title", val: title.toLowerCase().includes(focusKeyword.toLowerCase()) && !!focusKeyword, desc: "Place focus keyword at the beginning of the title." },
    { name: "Focus keyword in Slug", val: slug.includes(focusKeyword.toLowerCase()) && !!focusKeyword, desc: "Ensure slug contains focus keyword." },
    { name: "Title length is ideal", val: title.length >= 40 && title.length <= 60, desc: "SEO Titles should be between 40 to 60 characters." },
    { name: "Meta description length is ideal", val: metaDesc.length >= 120 && metaDesc.length <= 160, desc: "Meta descriptions should be between 120 and 160 characters." },
    { name: "Word count meets standard", val: wordCount >= 300, desc: "Article should contain at least 300 words." },
    { name: "Excerpt defined", val: !!excerpt, desc: "An excerpt is vital for lists and previews." },
    { name: "Cover image with Alt text", val: !!coverAlt, desc: "Crucial for image index ranking." },
    { name: "FAQ Schema availability", val: blocks.some(b => b.type === 'faq'), desc: "Add an FAQ block to generate search rich snippets." }
  ];

  const goodChecksCount = seoChecks.filter(c => c.val).length;
  const seoScore = Math.round((goodChecksCount / seoChecks.length) * 100);

  // Trigger publishing validations
  function handlePrePublishValidate(e: React.FormEvent) {
    e.preventDefault();
    if (!title) {
      showToast('error', 'Title is required');
      return;
    }
    if (!slug) {
      showToast('error', 'Slug is required');
      return;
    }
    setShowPublishModal(true);
  }

  async function handleFinalSubmit() {
    setShowPublishModal(false);
    setError('');

    const contentToSave = editorMode === 'visual' ? serializeBlocksToHtml(blocks) : htmlContent;

    const data = new FormData();
    data.append('title', title);
    data.append('slug', slug);
    data.append('excerpt', excerpt);
    data.append('content', contentToSave);
    data.append('coverImage', coverImage);
    data.append('isPublished', String(isPublished));

    localStorage.removeItem(`blog_draft_${post?.id || 'new'}`);
    setIsDirty(false);

    startTransition(async () => {
      try {
        if (post?.id) {
          await updateBlogPost(String(post.id), data);
          showToast('success', 'Article updated successfully');
        } else {
          await createBlogPost(data);
          showToast('success', 'Article created successfully');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        showToast('error', err.message || 'An error occurred');
      }
    });
  }

  function copyUrl() {
    const url = `https://rany.uk/blog/${slug}`;
    navigator.clipboard.writeText(url);
    showToast('info', 'URL copied to clipboard');
  }

  return (
    <div className="new-editor-wrapper">
      <style>{`
        .new-editor-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
          margin-top: 24px;
        }

        @media (max-width: 1024px) {
          .editor-grid {
            grid-template-columns: 1fr;
          }
        }

        .editor-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 49;
          margin-bottom: 24px;
        }

        .editor-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 28px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          margin-bottom: 28px;
        }

        .editor-sidebar-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .editor-field-group {
          margin-bottom: 20px;
        }

        .editor-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }

        .editor-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 14px;
          color: #0f172a;
          transition: all 0.2s;
          background: #f8fafc;
        }

        .editor-input:focus {
          border-color: #E0A96D;
          background: #ffffff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(224, 169, 109, 0.15);
        }

        .blocks-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 20px 0;
        }

        .editor-block-item {
          position: relative;
          border: 1px dashed transparent;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .editor-block-item:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .block-actions-overlay {
          position: absolute;
          right: -10px;
          top: -10px;
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
          z-index: 10;
        }

        .editor-block-item:hover .block-actions-overlay {
          opacity: 1;
        }

        .block-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background: #334155;
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
        }

        .block-type-badge {
          position: absolute;
          left: -10px;
          top: -10px;
          background: #E0A96D;
          color: #180d15;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .editor-block-item:hover .block-type-badge {
          opacity: 1;
        }

        .editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f1f5f9;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }

        .toolbar-btn {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #334155;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          cursor: pointer;
        }

        .seo-check-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }

        .seo-check-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        .preview-tab-btn {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }

        .preview-tab-btn.active {
          color: #E0A96D;
          border-color: #E0A96D;
        }

        .editor-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          color: #fff;
          font-weight: 700;
          font-size: 14px;
        }

        .editor-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .editor-modal {
          background: #ffffff;
          border-radius: 12px;
          padding: 32px;
          max-width: 650px;
          width: 90%;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.15);
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>

      {hasBackup && (
        <div style={{ padding: '12px 20px', background: 'rgba(224, 169, 109, 0.08)', border: '1px solid #E0A96D', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#180d15' }}>
          <span>We found an unsaved draft backup for this article in your browser.</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={restoreBackup} style={{ background: '#E0A96D', color: '#180d15', border: 'none', padding: '6px 14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Restore Draft</button>
            <button type="button" onClick={() => setHasBackup(false)} style={{ background: 'transparent', border: '1px solid #E0A96D', color: '#E0A96D', padding: '6px 14px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>Discard</button>
          </div>
        </div>
      )}

      {toast && (
        <div className="editor-toast" style={{
          background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6'
        }}>
          {toast.message}
        </div>
      )}

      <form onSubmit={handlePrePublishValidate}>
        
        {/* Header Bar */}
        <header className="editor-header-bar">
          <div>
            <Link href="/admin/blog" style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b', textDecoration: 'none' }}>← Back to Articles</Link>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0 0 0', color: '#0f172a' }}>
              {post?.id ? 'Edit Article' : 'Write New Article'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {lastSaved ? `Autosaved at ${lastSaved}` : 'Autosave active'}
            </span>
            {historyBackup && (
              <button type="button" onClick={handleUndoAI} style={{ border: '1px solid #ef4444', color: '#ef4444', background: '#fff', padding: '10px 18px', borderRadius: '4px', fontSize: '13px', cursor: 'pointer' }}>
                Undo AI Changes
              </button>
            )}
            <button type="submit" disabled={isPending} className="btn-luxury-primary" style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 24px', fontSize: '13px', borderRadius: '4px' }}>
              {isPending ? 'Processing...' : (post?.id ? 'Update & Publish' : 'Publish Article')}
            </button>
          </div>
        </header>

        <div className="editor-grid">
          
          {/* Left Main Content */}
          <div className="left-column">
            
            {/* COLLAPSIBLE GEMINI AI ASSISTANT PANEL */}
            <div className="editor-card" style={{ border: '1px solid #E0A96D', background: '#fbfbfe' }}>
              <div className="card-title" style={{ display: 'flex', justifySelf: 'space-between', cursor: 'pointer', color: '#E0A96D', borderBottomColor: 'rgba(224, 169, 109, 0.15)' }} onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}>
                <span>✨ Gemini AI Content Assistant & SEO Suite</span>
                <span>{isAiPanelOpen ? '▲' : '▼'}</span>
              </div>

              {isAiPanelOpen && (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-12px', marginBottom: '20px' }}>
                    Generate or improve product descriptions, SEO keywords, structured FAQ blocks, and title variations.
                  </p>

                  {/* Gemini Sequential Automation Queue Panel */}
                  <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>Sequential AI Workflow</span>
                      <button 
                        type="button" 
                        onClick={handleSequentialAI}
                        disabled={aiStatus === 'generating'}
                        style={{ background: '#E0A96D', color: '#180d15', border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        {aiStatus === 'generating' ? 'Processing...' : 'Generate All with Gemini AI'}
                      </button>
                    </div>

                    {/* Step log list */}
                    {aiStatus !== 'idle' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#E0A96D', marginBottom: '4px' }}>{activeStepText}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>🔍 Content Analysis: <strong>{aiStepsProgress.analyze.toUpperCase()}</strong></div>
                          <div>📦 Product Details: <strong>{aiStepsProgress.details.toUpperCase()}</strong></div>
                          <div>❓ FAQ Blocks: <strong>{aiStepsProgress.faqs.toUpperCase()}</strong></div>
                          <div>🏷️ SEO Title suggestion: <strong>{aiStepsProgress.titles.toUpperCase()}</strong></div>
                          <div>📝 Meta Descriptions: <strong>{aiStepsProgress.descriptions.toUpperCase()}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sources info options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label className="editor-label">Product Name</label>
                      <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Rabbit Vibrator" className="editor-input" style={{ background: '#fff' }} />
                    </div>
                    <div>
                      <label className="editor-label">Brand Name</label>
                      <input value={productBrand} onChange={(e) => setProductBrand(e.target.value)} placeholder="e.g. Rany.uk" className="editor-input" style={{ background: '#fff' }} />
                    </div>
                    <div>
                      <label className="editor-label">Product Category</label>
                      <input value={productCategory} onChange={(e) => setProductCategory(e.target.value)} placeholder="Wellness" className="editor-input" style={{ background: '#fff' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label className="editor-label">Secondary Keywords (comma separated)</label>
                      <input value={secondaryKeywords} onChange={(e) => setSecondaryKeywords(e.target.value)} placeholder="clitoral, rabbit, premium toys" className="editor-input" style={{ background: '#fff' }} />
                    </div>
                    <div>
                      <label className="editor-label">Target Audience</label>
                      <input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Wellness enthusiasts" className="editor-input" style={{ background: '#fff' }} />
                    </div>
                  </div>

                  {/* Product details customization */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>Product Details Customization</h4>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <select value={productLength} onChange={(e: any) => setProductLength(e.target.value)} className="editor-input" style={{ background: '#fff', width: '180px' }}>
                        <option value="short">Length: Short</option>
                        <option value="standard">Length: Standard</option>
                        <option value="detailed">Length: Detailed</option>
                      </select>
                      <select value={productTone} onChange={(e: any) => setProductTone(e.target.value)} className="editor-input" style={{ background: '#fff', width: '180px' }}>
                        <option value="premium">Tone: Premium</option>
                        <option value="professional">Tone: Professional</option>
                        <option value="friendly">Tone: Friendly</option>
                        <option value="persuasive">Tone: Persuasive</option>
                      </select>
                      <button type="button" onClick={triggerDetailsAI} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Generate Product Details with AI
                      </button>
                    </div>
                  </div>

                  {/* FAQ settings */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>FAQ Settings</h4>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <select value={faqCount} onChange={(e) => setFaqCount(e.target.value)} className="editor-input" style={{ background: '#fff', width: '180px' }}>
                        <option value="3">Count: 3 FAQs</option>
                        <option value="5">Count: 5 FAQs</option>
                        <option value="8">Count: 8 FAQs</option>
                        <option value="10">Count: 10 FAQs</option>
                      </select>
                      <button type="button" onClick={triggerFaqsAI} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Generate FAQ Block with AI
                      </button>
                    </div>
                  </div>

                  {/* Individual title & meta tag buttons */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', gap: '12px' }}>
                    <button type="button" onClick={triggerTitlesAI} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Suggest SEO Titles
                    </button>
                    <button type="button" onClick={triggerDescriptionsAI} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Suggest SEO Descriptions
                    </button>
                  </div>

                  {/* Suggestion Lists */}
                  {generatedTitles.length > 0 && (
                    <div style={{ marginTop: '20px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Generated Title Suggestions (Choose One)</h4>
                      {generatedTitles.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{t.title}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Score: {t.score}/100 — {t.reason}</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              backupCurrentState();
                              setSeoTitle(t.title);
                              showToast('success', 'SEO Title updated.');
                            }}
                            style={{ background: '#E0A96D', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {generatedDescriptions.length > 0 && (
                    <div style={{ marginTop: '20px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '12px' }}>Generated Meta Description Suggestions (Choose One)</h4>
                      {generatedDescriptions.map((d, idx) => (
                        <div key={idx} style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ flex: 1, marginRight: '12px' }}>
                            <div style={{ fontSize: '13px' }}>{d.description}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Score: {d.score}/100 — {d.reason}</div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              backupCurrentState();
                              setMetaDesc(d.description);
                              showToast('success', 'SEO Description updated.');
                            }}
                            style={{ background: '#E0A96D', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            Use
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Generation Log History */}
                  {aiHistoryList.length > 0 && (
                    <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>AI Version History logs ({aiHistoryList.length})</h4>
                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {aiHistoryList.map((log, idx) => (
                          <div key={idx} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifySelf: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span>{log.action}</span>
                              <span style={{ color: '#64748b' }}>{log.timestamp}</span>
                            </div>
                            <div style={{ color: '#475569' }}>Model: {log.model} | Section: {log.section}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Title & Slug card */}
            <div className="editor-card">
              <div className="editor-field-group">
                <label className="editor-label">Article Title</label>
                <input 
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter Title..."
                  required
                  className="editor-input"
                  style={{ fontSize: '24px', fontWeight: '800', padding: '16px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: title.length >= 40 && title.length <= 60 ? '#10b981' : '#f59e0b' }}>
                  <span>{title.length >= 40 && title.length <= 60 ? '✓ SEO Friendly Length' : 'Title should be between 40-60 characters.'}</span>
                  <span>{title.length} characters</span>
                </div>
              </div>

              <div className="editor-field-group" style={{ margin: '0' }}>
                <label className="editor-label">URL Slug</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    required
                    className="editor-input"
                  />
                  <button type="button" onClick={copyUrl} style={{ padding: '0 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    Copy Link
                  </button>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                  Final Link Preview: <span style={{ color: '#E0A96D', fontWeight: '700' }}>https://rany.uk/blog/{slug}</span>
                </div>
              </div>
            </div>

            {/* Visual Block Editor */}
            <div className="editor-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setEditorMode('visual')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: editorMode === 'visual' ? '#E0A96D' : '#f1f5f9', color: editorMode === 'visual' ? '#180d15' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Visual Blocks</button>
                  <button type="button" onClick={() => setEditorMode('html')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: editorMode === 'html' ? '#E0A96D' : '#f1f5f9', color: editorMode === 'html' ? '#180d15' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>HTML Source</button>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px' }}>
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                  <span>{readTime} min read</span>
                </div>
              </div>

              {editorMode === 'visual' ? (
                <div>
                  <div className="editor-toolbar">
                    <button type="button" onClick={() => addBlock('paragraph')} className="toolbar-btn">+ Paragraph</button>
                    <button type="button" onClick={() => addBlock('h2')} className="toolbar-btn">+ H2</button>
                    <button type="button" onClick={() => addBlock('h3')} className="toolbar-btn">+ H3</button>
                    <button type="button" onClick={() => addBlock('quote')} className="toolbar-btn">+ Quote</button>
                    <button type="button" onClick={() => addBlock('code')} className="toolbar-btn">+ Code</button>
                    <button type="button" onClick={() => addBlock('callout')} className="toolbar-btn">+ Callout</button>
                    <button type="button" onClick={() => addBlock('button')} className="toolbar-btn">+ Button</button>
                    <button type="button" onClick={() => addBlock('image')} className="toolbar-btn">+ Image</button>
                    <button type="button" onClick={() => addBlock('youtube')} className="toolbar-btn">+ Video</button>
                    <button type="button" onClick={() => addBlock('faq')} className="toolbar-btn" style={{ background: '#E0A96D', color: '#180d15', border: '1px solid #E0A96D' }}>+ FAQ Block</button>
                  </div>

                  <div className="blocks-container">
                    {blocks.map((block) => (
                      <div key={block.id} className="editor-block-item">
                        <span className="block-type-badge">{block.type}</span>
                        
                        <div className="block-actions-overlay">
                          <button type="button" onClick={() => deleteBlock(block.id)} className="block-btn" title="Remove Block">✕</button>
                        </div>

                        {block.type.startsWith('h') ? (
                          <input 
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="editor-input"
                            style={{ fontStyle: block.type === 'h2' ? 'normal' : 'italic', fontWeight: 'bold', fontSize: block.type === 'h2' ? '20px' : '17px', border: 'none', background: 'transparent', padding: '4px' }}
                          />
                        ) : block.type === 'quote' ? (
                          <textarea 
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="editor-input"
                            style={{ borderLeft: '4px solid #E0A96D', background: 'rgba(224, 169, 109, 0.03)', padding: '12px', fontStyle: 'italic', borderRight: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: '0' }}
                          />
                        ) : block.type === 'code' ? (
                          <textarea 
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="editor-input"
                            style={{ fontFamily: 'monospace', fontSize: '13px', background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '6px' }}
                          />
                        ) : block.type === 'callout' ? (
                          <textarea 
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            className="editor-input"
                            style={{ borderLeft: '4px solid #E0A96D', background: 'rgba(224, 169, 109, 0.03)', padding: '12px' }}
                          />
                        ) : block.type === 'image' ? (
                          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                              <input 
                                placeholder="Image URL..." 
                                value={block.meta?.src || ''} 
                                onChange={(e) => updateBlockMeta(block.id, 'src', e.target.value)} 
                                className="editor-input" 
                                style={{ flex: 1 }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                placeholder="Alt Text..." 
                                value={block.meta?.alt || ''} 
                                onChange={(e) => updateBlockMeta(block.id, 'alt', e.target.value)} 
                                className="editor-input" 
                                style={{ flex: 1 }}
                              />
                              <input 
                                placeholder="Caption..." 
                                value={block.meta?.caption || ''} 
                                onChange={(e) => updateBlockMeta(block.id, 'caption', e.target.value)} 
                                className="editor-input" 
                                style={{ flex: 1 }}
                              />
                            </div>
                            {block.meta?.src && (
                              <img src={block.meta.src} alt={block.meta.alt} style={{ maxWidth: '120px', borderRadius: '4px', marginTop: '12px' }} />
                            )}
                          </div>
                        ) : block.type === 'button' ? (
                          <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                            <input 
                              placeholder="Button Label..." 
                              value={block.content} 
                              onChange={(e) => updateBlockContent(block.id, e.target.value)} 
                              className="editor-input" 
                              style={{ width: '40%' }}
                            />
                            <input 
                              placeholder="Link URL..." 
                              value={block.meta?.href || ''} 
                              onChange={(e) => updateBlockMeta(block.id, 'href', e.target.value)} 
                              className="editor-input" 
                              style={{ flex: 1 }}
                            />
                          </div>
                        ) : block.type === 'youtube' ? (
                          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                            <input 
                              placeholder="YouTube Link / URL..." 
                              value={block.meta?.url || ''} 
                              onChange={(e) => updateBlockMeta(block.id, 'url', e.target.value)} 
                              className="editor-input" 
                            />
                          </div>
                        ) : block.type === 'faq' ? (
                          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>FAQ List (Structured Schema Enabled)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {(block.faqItems || []).map((faq, fIdx) => (
                                <div key={fIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Q{fIdx+1}</span>
                                    <input 
                                      value={faq.question} 
                                      onChange={(e) => updateFaqRow(block.id, fIdx, 'question', e.target.value)} 
                                      placeholder="Question..." 
                                      className="editor-input"
                                      style={{ flex: 1, padding: '6px 10px' }}
                                    />
                                    <button type="button" onClick={() => reorderFaq(block.id, fIdx, 'up')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px' }}>▲</button>
                                    <button type="button" onClick={() => reorderFaq(block.id, fIdx, 'down')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px' }}>▼</button>
                                    <button type="button" onClick={() => removeFaqRow(block.id, fIdx)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>A{fIdx+1}</span>
                                    <textarea 
                                      value={faq.answer} 
                                      onChange={(e) => updateFaqRow(block.id, fIdx, 'answer', e.target.value)} 
                                      placeholder="Answer details..." 
                                      className="editor-input"
                                      rows={2}
                                      style={{ flex: 1, padding: '6px 10px' }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button type="button" onClick={() => addFaqRow(block.id)} style={{ marginTop: '12px', background: '#E0A96D', color: '#180d15', border: 'none', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                              + Add Question & Answer Row
                            </button>
                          </div>
                        ) : (
                          <textarea 
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                            rows={3}
                            className="editor-input"
                            style={{ border: 'none', background: 'transparent', padding: '4px', resize: 'vertical' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <textarea 
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  rows={20}
                  className="editor-input"
                  style={{ fontFamily: 'monospace', fontSize: '13px', background: '#0f172a', color: '#cbd5e1', padding: '16px' }}
                />
              )}
            </div>

            {/* Excerpt card */}
            <div className="editor-card">
              <div className="card-title">Excerpt (Short Description)</div>
              <textarea 
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Write a brief hook/summary of the post..."
                className="editor-input"
              />
            </div>

            {/* Advanced SEO options */}
            <div className="editor-card">
              <div className="card-title">Search Engine Optimization (SEO)</div>
              
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <button type="button" onClick={() => setActivePreviewTab('google')} className={`preview-tab-btn ${activePreviewTab === 'google' ? 'active' : ''}`}>Google Snippet</button>
                <button type="button" onClick={() => setActivePreviewTab('social')} className={`preview-tab-btn ${activePreviewTab === 'social' ? 'active' : ''}`}>Social Feeds</button>
              </div>

              {activePreviewTab === 'google' ? (
                <div>
                  <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', background: '#ffffff', marginBottom: '24px', maxWidth: '600px' }}>
                    <div style={{ display: 'flex', justifySelf: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}>GOOGLE SERP PREVIEW</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => setGoogleDevice('desktop')} style={{ border: 'none', background: googleDevice === 'desktop' ? '#cbd5e1' : 'transparent', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Desktop</button>
                        <button type="button" onClick={() => setGoogleDevice('mobile')} style={{ border: 'none', background: googleDevice === 'mobile' ? '#cbd5e1' : 'transparent', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Mobile</button>
                      </div>
                    </div>

                    <div style={{ fontFamily: 'Arial, sans-serif' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#202124', marginBottom: '4px' }}>
                        <span style={{ background: '#f1f3f4', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>🏷️</span>
                        <span>rany.uk › blog › {slug || '...'}</span>
                      </div>
                      <div style={{ fontSize: googleDevice === 'desktop' ? '20px' : '16px', color: '#1a0dab', textDecoration: 'none', fontWeight: '600', marginBottom: '4px', cursor: 'pointer', maxWidth: '600px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {seoTitle || title || 'Placeholder SEO Title'}
                      </div>
                      <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.58' }}>
                        {metaDesc || excerpt || 'Add a descriptive meta description to check search engine snippet text limits.'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div className="editor-field-group">
                      <label className="editor-label">Focus Keyword</label>
                      <input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. rabbit vibrator" className="editor-input" />
                    </div>
                    <div className="editor-field-group">
                      <label className="editor-label">Canonical URL</label>
                      <input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://..." className="editor-input" />
                    </div>
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-label">SEO Title</label>
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Custom title tag..." className="editor-input" />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-label">Meta Description</label>
                    <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} placeholder="Write search snippet overview..." className="editor-input" />
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', background: '#f8fafc', marginBottom: '24px', maxWidth: '500px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <button type="button" onClick={() => setSocialPlatform('facebook')} style={{ border: 'none', background: socialPlatform === 'facebook' ? '#1877f2' : '#e2e8f0', color: socialPlatform === 'facebook' ? '#fff' : '#475569', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Facebook</button>
                      <button type="button" onClick={() => setSocialPlatform('twitter')} style={{ border: 'none', background: socialPlatform === 'twitter' ? '#111' : '#e2e8f0', color: socialPlatform === 'twitter' ? '#fff' : '#475569', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>X (Twitter)</button>
                      <button type="button" onClick={() => setSocialPlatform('linkedin')} style={{ border: 'none', background: socialPlatform === 'linkedin' ? '#0077b5' : '#e2e8f0', color: socialPlatform === 'linkedin' ? '#fff' : '#475569', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>LinkedIn</button>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #dddfe2', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '240px', background: coverImage ? `url(${coverImage}) center/cover no-repeat` : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!coverImage && <span style={{ color: '#64748b' }}>No Cover Image selected</span>}
                      </div>
                      <div style={{ padding: '12px', borderTop: '1px solid #dddfe2' }}>
                        <span style={{ fontSize: '12px', color: '#606770', textTransform: 'uppercase' }}>rany.uk</span>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1d2129', margin: '4px 0' }}>
                          {ogTitle || title || 'Social Post Title'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#606770', lineHeight: '1.4' }}>
                          {ogDesc || excerpt || 'Write a descriptive social intro description...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-label">Social Share Title</label>
                    <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} placeholder="Title for social cards..." className="editor-input" />
                  </div>

                  <div className="editor-field-group">
                    <label className="editor-label">Social Share Description</label>
                    <textarea value={ogDesc} onChange={(e) => setOgDesc(e.target.value)} rows={2} placeholder="Description for social cards..." className="editor-input" />
                  </div>
                </div>
              )}
            </div>

            {/* Schema markup preview card */}
            <div className="editor-card">
              <div className="card-title">JSON-LD Schema Markup</div>
              <div className="editor-field-group">
                <label className="editor-label">Schema Type</label>
                <select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} className="editor-input" style={{ background: '#fff' }}>
                  <option value="BlogPosting">Blog Posting</option>
                  <option value="NewsArticle">News Article</option>
                  <option value="HowTo">HowTo Guide</option>
                  <option value="FAQPage">FAQ Page</option>
                  <option value="Review">Product / Toy Review</option>
                </select>
              </div>

              <div>
                <label className="editor-label">Live Generated Schema Output (Auto Injected Public View)</label>
                <pre suppressHydrationWarning style={{ background: '#0f172a', color: '#10b981', padding: '14px', borderRadius: '6px', fontSize: '12px', overflowX: 'auto' }}>{`{
  "@context": "https://schema.org",
  "@type": "${schemaType}",
  "headline": "${title || 'Untitled'}",
  "image": "${coverImage || 'None'}",
  "author": {
    "@type": "Person",
    "name": "${author}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Rany.uk"
  },
  "datePublished": "${createdDateStr}",
  "mainEntityOfPage": "https://rany.uk/blog/${slug}"
}`}
                </pre>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Side Controls */}
          <div className="right-column" style={{ position: 'sticky', top: '120px' }}>
            
            {/* Publish Settings Card */}
            <div className="editor-sidebar-card">
              <div className="card-title">Publish Controls</div>
              
              <div className="editor-field-group">
                <label className="editor-label">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="editor-input" style={{ background: '#fff' }}>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="editor-field-group">
                <label className="editor-label">Visibility</label>
                <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="editor-input" style={{ background: '#fff' }}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="password">Password Protected</option>
                </select>
              </div>

              {visibility === 'password' && (
                <div className="editor-field-group">
                  <label className="editor-label">Enter Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Required..." className="editor-input" />
                </div>
              )}

              {status === 'scheduled' && (
                <div className="editor-field-group">
                  <label className="editor-label">Schedule Date & Time</label>
                  <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="editor-input" />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="checkbox" 
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  id="isPublished"
                  style={{ width: '16px', height: '16px', accentColor: '#E0A96D' }}
                />
                <label htmlFor="isPublished" style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Publish Instantly</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input 
                  type="checkbox" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  id="isFeatured"
                  style={{ width: '16px', height: '16px', accentColor: '#E0A96D' }}
                />
                <label htmlFor="isFeatured" style={{ fontSize: '13px', fontWeight: '700', color: '#334155' }}>Featured Article</label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button type="button" onClick={handleFinalSubmit} disabled={isPending} className="btn-luxury-primary" style={{ width: '100%' }}>
                  {isPending ? 'Saving...' : 'Save Draft'}
                </button>
              </div>
            </div>

            {/* SEO Health Meter */}
            <div className="editor-sidebar-card">
              <div className="card-title">
                <span>SEO Score</span>
                <span style={{ 
                  color: seoScore >= 80 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : '#ef4444',
                  fontWeight: 'bold', fontSize: '18px'
                }}>{seoScore}/100</span>
              </div>
              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: `${seoScore}%`, background: seoScore >= 80 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : '#ef4444', transition: 'width 0.3s' }} />
              </div>
              <div>
                {seoChecks.map((check, idx) => (
                  <div key={idx} className="seo-check-item">
                    <span className="seo-check-dot" style={{ background: check.val ? '#10b981' : '#f59e0b' }} />
                    <div>
                      <div style={{ fontWeight: '700', color: '#334155' }}>{check.name}</div>
                      {!check.val && <div style={{ fontSize: '11px', color: '#64748b' }}>{check.desc}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Image URL upload */}
            <div className="editor-sidebar-card">
              <div className="card-title">Cover Image</div>
              
              <div className="editor-field-group">
                <label className="editor-label">Image URL</label>
                <input 
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="editor-input"
                />
              </div>

              {coverImage ? (
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
                  <img src={coverImage} alt="Cover Preview" style={{ width: '100%', display: 'block' }} />
                  <button type="button" onClick={() => setCoverImage('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
                </div>
              ) : (
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px', cursor: 'pointer', background: '#f8fafc', marginBottom: '16px' }}>
                  🌅 Cover Image URL Preview Box
                </div>
              )}

              <div className="editor-field-group">
                <label className="editor-label">Alt Text</label>
                <input value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} placeholder="Describe image details..." className="editor-input" />
              </div>

              <div className="editor-field-group">
                <label className="editor-label">Caption</label>
                <input value={coverCaption} onChange={(e) => setCoverCaption(e.target.value)} placeholder="Caption..." className="editor-input" />
              </div>

              <div className="editor-field-group" style={{ margin: '0' }}>
                <label className="editor-label">Photographer / Credit</label>
                <input value={coverCredit} onChange={(e) => setCoverCredit(e.target.value)} placeholder="Source credit..." className="editor-input" />
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="editor-sidebar-card">
              <div className="card-title">Categories</div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {categories.map((cat) => (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, cat]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat));
                        }
                      }}
                      id={`cat-${cat}`}
                      style={{ accentColor: '#E0A96D' }}
                    />
                    <label htmlFor={`cat-${cat}`} style={{ fontSize: '13px', color: '#475569' }}>{cat}</label>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  placeholder="New category..." 
                  value={newCatInput} 
                  onChange={(e) => setNewCatInput(e.target.value)} 
                  className="editor-input" 
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (newCatInput && !categories.includes(newCatInput)) {
                      setCategories([...categories, newCatInput]);
                      setNewCatInput('');
                      showToast('success', 'Category added');
                    }
                  }} 
                  style={{ background: '#cbd5e1', border: 'none', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags Card */}
            <div className="editor-sidebar-card">
              <div className="card-title">Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {selectedTags.map((tag) => (
                  <span key={tag} style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    {tag}
                    <button type="button" onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <input 
                  placeholder="Add tag..." 
                  value={newTagInput} 
                  onChange={(e) => setNewTagInput(e.target.value)} 
                  className="editor-input" 
                  style={{ padding: '6px 10px', fontSize: '12px' }}
                />
                <button 
                  type="button" 
                  onClick={() => {
                    if (newTagInput && !selectedTags.includes(newTagInput)) {
                      setSelectedTags([...selectedTags, newTagInput]);
                      setNewTagInput('');
                    }
                  }} 
                  style={{ background: '#cbd5e1', border: 'none', padding: '0 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Add
                </button>
              </div>

              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Suggested: {tags.filter(t => !selectedTags.includes(t)).slice(0, 3).map(t => (
                  <button key={t} type="button" onClick={() => setSelectedTags([...selectedTags, t])} style={{ background: 'transparent', border: 'none', color: '#E0A96D', cursor: 'pointer', textDecoration: 'underline', marginRight: '6px' }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="editor-sidebar-card">
              <div className="card-title">Author</div>
              <select value={author} onChange={(e) => setAuthor(e.target.value)} className="editor-input" style={{ background: '#fff' }}>
                <option value="Nithu">Nithu (Editor-in-Chief)</option>
                <option value="Emma">Emma Stone (Sexologist)</option>
                <option value="Liam">Liam Smith (Product Reviewer)</option>
              </select>
            </div>

          </div>

        </div>
      </form>

      {/* Confirmation Publish Modal */}
      {showPublishModal && (
        <div className="editor-modal-overlay">
          <div className="editor-modal">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>Confirm Submission</h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
              Are you ready to submit and validate your article? Your current SEO score is <strong>{seoScore}/100</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowPublishModal(false)} style={{ background: '#cbd5e1', color: '#334155', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Go Back
              </button>
              <button onClick={handleFinalSubmit} style={{ background: '#E0A96D', color: '#180d15', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Yes, Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
