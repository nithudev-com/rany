'use server';

import { getAISettings, saveAISettings, incrementAIUsage, AISettings } from '@/lib/ai-settings';

// Mask API key for client safety
export async function getAISettingsSafe(): Promise<AISettings> {
  const settings = getAISettings();
  return {
    ...settings,
    apiKey: settings.apiKey ? `${settings.apiKey.slice(0, 6)}...${settings.apiKey.slice(-4)}` : ''
  };
}

export async function saveAISettingsAction(newSettings: AISettings) {
  const current = getAISettings();
  
  // Only update API key if a new one is provided (not masked)
  if (newSettings.apiKey && !newSettings.apiKey.includes('...')) {
    current.apiKey = newSettings.apiKey;
  } else if (!newSettings.apiKey) {
    current.apiKey = ''; // Cleared
  }
  
  current.model = newSettings.model || current.model;
  current.language = newSettings.language || current.language;
  current.tone = newSettings.tone || current.tone;
  current.audience = newSettings.audience || current.audience;
  current.country = newSettings.country || current.country;
  current.seoStyle = newSettings.seoStyle || current.seoStyle;
  current.creativity = typeof newSettings.creativity === 'number' ? newSettings.creativity : parseFloat(newSettings.creativity || '0.7');
  current.maxLength = typeof newSettings.maxLength === 'number' ? newSettings.maxLength : parseInt(newSettings.maxLength || '2048');
  
  // Limits
  current.dailyLimit = typeof newSettings.dailyLimit === 'number' ? newSettings.dailyLimit : parseInt(newSettings.dailyLimit || '200');
  current.monthlyLimit = typeof newSettings.monthlyLimit === 'number' ? newSettings.monthlyLimit : parseInt(newSettings.monthlyLimit || '5000');

  // Prompts
  current.productDetailsPrompt = newSettings.productDetailsPrompt || current.productDetailsPrompt;
  current.faqsPrompt = newSettings.faqsPrompt || current.faqsPrompt;
  current.seoTitlePrompt = newSettings.seoTitlePrompt || current.seoTitlePrompt;
  current.seoDescriptionPrompt = newSettings.seoDescriptionPrompt || current.seoDescriptionPrompt;
  current.contentImprovementPrompt = newSettings.contentImprovementPrompt || current.contentImprovementPrompt;
  current.seoAnalysisPrompt = newSettings.seoAnalysisPrompt || current.seoAnalysisPrompt;

  // Auto Options
  current.autoGenDraft = !!newSettings.autoGenDraft;
  current.autoGenMissingPublish = !!newSettings.autoGenMissingPublish;
  current.autoGenFaqs = !!newSettings.autoGenFaqs;
  current.autoGenDetails = !!newSettings.autoGenDetails;
  current.autoRunSeo = !!newSettings.autoRunSeo;
  current.preventPublishMissing = !!newSettings.preventPublishMissing;
  current.autoAccept = !!newSettings.autoAccept;
  current.regenTitleChange = !!newSettings.regenTitleChange;
  current.regenKeywordChange = !!newSettings.regenKeywordChange;

  saveAISettings(current);
  return { success: true };
}

// Reset settings to default
export async function resetAISettingsAction() {
  const settings = getAISettings();
  // Clear file to force default restore
  saveAISettings({} as any);
  return { success: true };
}

// Test API Key connection status
export async function testGeminiConnection(customKey?: string, customModel?: string): Promise<{ success: boolean; status: string; message: string }> {
  const settings = getAISettings();
  let apiKey = customKey || settings.apiKey;
  
  if (apiKey && apiKey.includes('...')) {
    apiKey = settings.apiKey;
  }
  
  const model = customModel || settings.model;

  if (!apiKey) {
    return { success: false, status: 'Invalid API key', message: 'No API key provided.' };
  }

  try {
    const responseText = await callGeminiRaw(apiKey, model, "Respond with only one word: Connected", false);
    if (responseText.toLowerCase().includes('connect')) {
      return { success: true, status: 'Connected', message: 'Successfully established contact with Gemini AI API!' };
    }
    return { success: false, status: 'Connection failed', message: `Unexpected response: ${responseText}` };
  } catch (err: any) {
    const msg = err.message || '';
    if (msg.includes('400') || msg.includes('API_KEY_INVALID') || msg.includes('invalid')) {
      return { success: false, status: 'Invalid API key', message: 'The API key provided is not valid.' };
    }
    if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
      return { success: false, status: 'API quota exceeded', message: 'You have exceeded your Gemini API limits/quota.' };
    }
    if (msg.includes('404') || msg.includes('model')) {
      return { success: false, status: 'Model unavailable', message: `Model '${model}' was not found or is unavailable.` };
    }
    return { success: false, status: 'Connection failed', message: msg || 'Network connection failed.' };
  }
}

// Helper to call API
async function callGeminiRaw(apiKey: string, model: string, prompt: string, jsonMode: boolean = false): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: jsonMode ? "application/json" : undefined,
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || `API status code: ${response.status}`);
  }

  const data = await response.json();
  const contentText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!contentText) {
    throw new Error("Empty candidate parts returned from Gemini API");
  }
  return contentText.trim();
}

// Core execution method
export async function executeAITask(taskType: string, variables: Record<string, string>): Promise<{ success: boolean; data?: any; error?: string }> {
  const settings = getAISettings();
  if (!settings.apiKey) {
    return { success: false, error: 'Gemini API key is not configured in settings.' };
  }

  // Check rate limit counters
  if (settings.requestsToday >= settings.dailyLimit) {
    return { success: false, error: 'Daily generation limit reached. Please check AI Settings.' };
  }
  if (settings.requestsThisMonth >= settings.monthlyLimit) {
    return { success: false, error: 'Monthly generation limit reached. Please check AI Settings.' };
  }

  try {
    let promptTemplate = '';
    let jsonMode = false;

    switch (taskType) {
      case 'productDetails':
        promptTemplate = settings.productDetailsPrompt;
        jsonMode = true; // Request structured JSON details
        break;
      case 'faqs':
        promptTemplate = settings.faqsPrompt;
        jsonMode = true;
        break;
      case 'seoTitles':
        promptTemplate = settings.seoTitlePrompt;
        jsonMode = true;
        break;
      case 'seoDescriptions':
        promptTemplate = settings.seoDescriptionPrompt;
        jsonMode = true;
        break;
      case 'contentImprovement':
        promptTemplate = settings.contentImprovementPrompt;
        break;
      case 'seoAnalysis':
        promptTemplate = settings.seoAnalysisPrompt;
        jsonMode = true;
        break;
      case 'productBlogGenerator':
        promptTemplate = "Write a highly detailed and SEO-optimized {{article_type}} for the product '{{product_title}}'.\nProduct Description: {{product_description}}\nFocus Keyword: {{focus_keyword}}\n\nCRITICAL SEO RULES FOR 100% SCORE:\n1. Choose a short 2-3 word 'focusKeyword'.\n2. The 'title' MUST be 45-55 characters long and contain the exact 'focusKeyword'.\n3. The 'seoDescription' MUST be 130-150 characters long and contain the exact 'focusKeyword'.\n4. The 'slug' MUST contain the exact 'focusKeyword'.\n5. 'contentHtml' MUST be over 400 words and include a <div class=\"faq-section\"> element.\n6. An 'excerpt' must be provided.";
        jsonMode = true;
        break;
      case 'seoKeywordsAndAlts':
        promptTemplate = "Analyze the product '{{product_name}}' (Category: {{product_category}}).\n1. Generate the single best primary SEO focus keyword (2-4 words).\n2. Generate unique, highly descriptive SEO alt texts for exactly {{image_count}} images of this product.";
        jsonMode = true;
        break;
      default:
        promptTemplate = settings.fullAutomationPrompt;
        jsonMode = true;
    }

    // Replace template tags
    let prompt = promptTemplate;
    Object.entries(variables).forEach(([k, v]) => {
      prompt = prompt.replace(new RegExp(`{{${k}}}`, 'g'), v || '');
    });

    // Append JSON expectations if jsonMode
    if (jsonMode) {
      if (taskType === 'productDetails') {
        prompt += `\nReturn a JSON object conforming exactly to this schema:
{
  "html": "formatted HTML containing headings, paragraphs, and list points based on specifications",
  "summary": "one line summary",
  "shortDescription": "A highly compelling 2-sentence description of the product",
  "features": ["feature 1", "feature 2"],
  "benefits": ["benefit 1", "benefit 2"],
  "tags": ["tag1", "tag2", "tag3"]
}`;
      } else if (taskType === 'faqs') {
        prompt += `\nReturn a JSON array of FAQ objects matching this schema:
[
  {
    "question": "Question text?",
    "answer": "Answer text."
  }
]`;
      } else if (taskType === 'seoTitles') {
        prompt += `\nReturn a JSON array of Title objects matching this schema:
[
  {
    "title": "Optimized Title Tag",
    "score": 95,
    "reason": "Clear, includes target keyword at start"
  }
]`;
      } else if (taskType === 'seoDescriptions') {
        prompt += `\nReturn a JSON array of Meta Description objects matching this schema:
[
  {
    "description": "Meta description content",
    "score": 90,
    "reason": "Includes keyword and compelling call to action"
  }
]`;
      } else if (taskType === 'seoAnalysis') {
        prompt += `\nReturn a JSON object conforming to this schema:
{
  "score": 85,
  "checks": [
    { "name": "Keyword Placement", "val": true, "desc": "Keyword is placed in heading successfully." }
  ]
}`;
      } else if (taskType === 'productBlogGenerator') {
        prompt += `\nReturn a JSON object conforming exactly to this schema:
{
  "article": {
    "title": "Natural, catchy blog title (no clickbait)",
    "slug": "clean-lowercase-hyphen-slug",
    "excerpt": "A short summary of the article",
    "contentHtml": "<h2>Heading</h2><p>Full HTML content structured with headings, paragraphs, and lists.</p>"
  },
  "seo": {
    "focusKeyword": "primary focus keyword",
    "secondaryKeywords": ["keyword1", "keyword2"],
    "seoTitle": "Optimized SEO title",
    "seoDescription": "Optimized meta description"
  },
  "faqs": [
    { "question": "Question text", "answer": "Answer text" }
  ]
}`;
      } else if (taskType === 'seoKeywordsAndAlts') {
        prompt += `\nReturn a JSON object conforming exactly to this schema:
{
  "focusKeyword": "best primary seo keyword",
  "imageAlts": [
    "Descriptive alt text for image 1",
    "Descriptive alt text for image 2"
  ]
}`;
      }
    }

    const outputText = await callGeminiRaw(settings.apiKey, settings.model, prompt, jsonMode);
    
    // Increment logs
    incrementAIUsage(true, outputText.length / 4);

    if (jsonMode) {
      try {
        // Clean JSON formatting codes if returned as markdown block
        const cleanJsonStr = outputText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(cleanJsonStr);
        return { success: true, data: parsed };
      } catch (err: any) {
        // Attempt a safe repair retry
        try {
          const secondTryText = await callGeminiRaw(settings.apiKey, settings.model, "Repair and return only valid JSON for: " + outputText, true);
          const cleanSecond = secondTryText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
          const parsedSecond = JSON.parse(cleanSecond);
          return { success: true, data: parsedSecond };
        } catch {
          return { success: false, error: `Invalid JSON returned by AI: ${err.message || 'Parsing failed'}` };
        }
      }
    }

    return { success: true, data: outputText };
  } catch (err: any) {
    incrementAIUsage(false, 0);
    return { success: false, error: err.message || 'AI Generation failed' };
  }
}
