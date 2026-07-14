import fs from 'fs';
import path from 'path';

export interface AISettings {
  apiKey: string;
  model: string;
  language: string;
  tone: string;
  audience: string;
  country: string;
  seoStyle: string;
  creativity: number;
  maxLength: number;
  
  // Cost & Usage
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  estimatedTokens: number;
  dailyLimit: number;
  monthlyLimit: number;
  requestsToday: number;
  requestsThisMonth: number;
  lastRequestDate: string;

  // Prompts
  productDetailsPrompt: string;
  faqsPrompt: string;
  seoTitlePrompt: string;
  seoDescriptionPrompt: string;
  fullAutomationPrompt: string;
  contentImprovementPrompt: string;
  seoAnalysisPrompt: string;

  // Automation Options
  autoGenDraft: boolean;
  autoGenMissingPublish: boolean;
  autoGenFaqs: boolean;
  autoGenDetails: boolean;
  autoRunSeo: boolean;
  preventPublishMissing: boolean;
  autoAccept: boolean;
  requireManualApproval: boolean;
  regenTitleChange: boolean;
  regenKeywordChange: boolean;
}

const SETTINGS_FILE = path.join(process.cwd(), 'storage', 'ai-settings.json');

const DEFAULT_SETTINGS: AISettings = {
  apiKey: '',
  model: 'gemini-2.5-flash',
  language: 'English',
  tone: 'Premium',
  audience: 'Wellness and Pleasure Seekers',
  country: 'Global',
  seoStyle: 'Modern',
  creativity: 0.7,
  maxLength: 2048,
  
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  estimatedTokens: 0,
  dailyLimit: 200,
  monthlyLimit: 5000,
  requestsToday: 0,
  requestsThisMonth: 0,
  lastRequestDate: '',

  productDetailsPrompt: `Generate detailed, high-converting, and SEO-friendly product details for target product: "{{product_name}}".
Brand: "{{brand_name}}". Focus Keyword: "{{focus_keyword}}". Target audience: "{{target_audience}}". Country: "{{country}}". Language: "{{language}}".
Include these sections if relevant: Product overview, Main features, Key benefits, Who it is suitable for, How it works, Important specifications, Care/maintenance, Delivery/Warranty notes, and Why choose this product.
Write natural HTML content compatible with standard paragraphs and lists. Avoid clickbait, fake certifications, or false specifications.`,
  
  faqsPrompt: `Generate {{faq_count}} Frequently Asked Questions (FAQs) based on:
Product: "{{product_name}}"
Article content: "{{article_content}}"
Focus Keyword: "{{focus_keyword}}"
Output structured questions and answers addressing customer concerns and search intent. Do not create fake promises.`,

  seoTitlePrompt: `Suggest 5 highly optimized SEO titles based on:
Article title: "{{article_title}}"
Product: "{{product_name}}"
Focus Keyword: "{{focus_keyword}}"
Make them attractive, click-worthy, keeping lengths within 50-60 characters.`,

  seoDescriptionPrompt: `Suggest 3 meta descriptions based on:
Article title: "{{article_title}}"
Product details: "{{product_details}}"
Focus Keyword: "{{focus_keyword}}"
Incorporate benefits and clear calls to action within 140-160 characters.`,

  fullAutomationPrompt: `Conduct complete AI automation for:
Title: "{{article_title}}"
Product: "{{product_name}}"
Focus Keyword: "{{focus_keyword}}"
Output all fields including Product Details, FAQs, SEO Title suggestions, and SEO Description suggestions in JSON format.`,

  contentImprovementPrompt: `Improve and expand this existing content:
"{{existing_content}}"
Make it more "{{tone}}", clear, readable, and SEO-focused.`,

  seoAnalysisPrompt: `Analyze this content and output recommendations:
Title: "{{article_title}}"
Content: "{{article_content}}"
Focus Keyword: "{{focus_keyword}}"
Check keyword placements, headings, reading ease, alt text, and schemas. Output checks with scores.`,

  autoGenDraft: false,
  autoGenMissingPublish: false,
  autoGenFaqs: false,
  autoGenDetails: false,
  autoRunSeo: true,
  preventPublishMissing: false,
  autoAccept: false,
  requireManualApproval: true,
  regenTitleChange: false,
  regenKeywordChange: false
};

function ensureDirExists() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getAISettings(): AISettings {
  ensureDirExists();
  if (!fs.existsSync(SETTINGS_FILE)) {
    saveAISettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAISettings(settings: AISettings) {
  ensureDirExists();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

export function incrementAIUsage(success: boolean, tokens: number = 200) {
  const settings = getAISettings();
  const today = new Date().toDateString();
  
  if (settings.lastRequestDate !== today) {
    settings.requestsToday = 0;
    settings.lastRequestDate = today;
  }

  settings.totalRequests += 1;
  settings.requestsToday += 1;
  settings.requestsThisMonth += 1;
  settings.estimatedTokens += tokens;

  if (success) {
    settings.successfulRequests += 1;
  } else {
    settings.failedRequests += 1;
  }

  saveAISettings(settings);
}
