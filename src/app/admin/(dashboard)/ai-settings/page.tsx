'use client';

import { useState, useEffect } from 'react';
import { getAISettingsSafe, saveAISettingsAction, resetAISettingsAction, testGeminiConnection } from '@/actions/gemini';
import { AISettings } from '@/lib/ai-settings';

export default function AISettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // Connection Test State
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'Connected' | 'Invalid API key' | 'API quota exceeded' | 'Model unavailable' | 'Connection failed'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Tab Control
  const [activeTab, setActiveTab] = useState<'general' | 'prompts' | 'limits' | 'automation'>('general');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const data = await getAISettingsSafe();
    setSettings(data);
    setApiKeyInput(data.apiKey || '');
  }

  async function handleTestConnection() {
    setTestStatus('testing');
    setTestMessage('Verifying credentials with Google Gemini API...');
    try {
      const res = await testGeminiConnection(apiKeyInput || undefined, settings?.model);
      setTestStatus(res.status as any);
      setTestMessage(res.message);
    } catch (err: any) {
      setTestStatus('Connection failed');
      setTestMessage(err.message || 'Unknown network error');
    }
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;
    setSaveStatus('Saving settings...');
    try {
      const settingsToSave = {
        ...settings,
        apiKey: apiKeyInput
      };
      await saveAISettingsAction(settingsToSave);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      loadSettings();
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message}`);
    }
  }

  async function handleResetToDefault() {
    if (confirm('Are you sure you want to reset all prompt templates and options to default values? This will not clear your API key.')) {
      await resetAISettingsAction();
      loadSettings();
      alert('Prompt templates restored to factory defaults.');
    }
  }

  if (!settings) {
    return <div style={{ padding: '40px', color: '#64748b' }}>Loading AI configurations...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <header style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Gemini AI Settings</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Configure Google Gemini models, custom prompt variables, and content usage limits.</p>
        </div>
        <button 
          type="button" 
          onClick={handleResetToDefault} 
          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#ef4444' }}
        >
          Reset to Default
        </button>
      </header>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #cbd5e1', marginBottom: '28px' }}>
        {(['general', 'prompts', 'automation', 'limits'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '3px solid #E0A96D' : '3px solid transparent',
              color: activeTab === tab ? '#E0A96D' : '#64748b',
              textTransform: 'capitalize'
            }}
          >
            {tab === 'prompts' ? 'AI Prompt Templates' : tab + ' Settings'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* TAB 1: General Options */}
        {activeTab === 'general' && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚙️ General Gemini API Configuration
            </h2>

            {/* API Key */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Gemini API Key</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  name="apiKey"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini AI key here..."
                  style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  style={{ background: '#111', color: '#fff', border: 'none', padding: '0 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Test Connection
                </button>
              </div>
            </div>

            {/* Connection Test Status */}
            {testStatus !== 'idle' && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                lineHeight: '1.5',
                background: testStatus === 'Connected' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${testStatus === 'Connected' ? '#10b981' : '#ef4444'}`,
                color: testStatus === 'Connected' ? '#065f46' : '#991b1b'
              }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Status: {testStatus}</div>
                <div>{testMessage}</div>
              </div>
            )}

            {/* Configuration Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Gemini Model</label>
                <select 
                  name="model" 
                  value={settings.model} 
                  onChange={(e) => setSettings({ ...settings, model: e.target.value })} 
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latest High-speed & Smart)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Latest Advanced Logical Reasoning)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Premium Speed & Performance)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Legacy Speed)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Legacy Logical)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Default Output Language</label>
                <input 
                  name="language" 
                  value={settings.language} 
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  placeholder="e.g. English, French" 
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Default Writing Tone</label>
                <select 
                  name="tone" 
                  value={settings.tone} 
                  onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}
                >
                  <option value="Professional">Professional & SEO-focused</option>
                  <option value="Premium">Premium & Luxury-brand style</option>
                  <option value="Friendly">Friendly & Enthusiastic</option>
                  <option value="Persuasive">Persuasive & Marketing</option>
                  <option value="Simple">Simple & Clear</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Target Audience</label>
                <input 
                  name="audience" 
                  value={settings.audience} 
                  onChange={(e) => setSettings({ ...settings, audience: e.target.value })}
                  placeholder="e.g. Adult toy shoppers" 
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Country Focus</label>
                <input 
                  name="country" 
                  value={settings.country} 
                  onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Creativity Level (Temp)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="1" 
                  name="creativity" 
                  value={settings.creativity} 
                  onChange={(e) => setSettings({ ...settings, creativity: parseFloat(e.target.value) || 0.7 })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Max Output Length (Tokens)</label>
                <input 
                  type="number" 
                  name="maxLength" 
                  value={settings.maxLength} 
                  onChange={(e) => setSettings({ ...settings, maxLength: parseInt(e.target.value) || 2048 })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AI Prompt Templates */}
        {activeTab === 'prompts' && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              📝 Editable Prompt Templates
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              Customize prompts sent to Gemini. You can use variables like: <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>{`{{article_title}}`}</code>, <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>{`{{product_name}}`}</code>, <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>{`{{focus_keyword}}`}</code>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Product Details Generator Prompt</label>
                <textarea
                  value={settings.productDetailsPrompt}
                  onChange={(e) => setSettings({ ...settings, productDetailsPrompt: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>FAQs Generator Prompt</label>
                <textarea
                  value={settings.faqsPrompt}
                  onChange={(e) => setSettings({ ...settings, faqsPrompt: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>SEO Title Generator Prompt</label>
                <textarea
                  value={settings.seoTitlePrompt}
                  onChange={(e) => setSettings({ ...settings, seoTitlePrompt: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>SEO Description Generator Prompt</label>
                <textarea
                  value={settings.seoDescriptionPrompt}
                  onChange={(e) => setSettings({ ...settings, seoDescriptionPrompt: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Automation Options */}
        {activeTab === 'automation' && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              ⚡ Automatic Content Automation Option Controls
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoGenDraft" 
                  checked={settings.autoGenDraft} 
                  onChange={(e) => setSettings({ ...settings, autoGenDraft: e.target.checked })}
                  id="autoGenDraft" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoGenDraft" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Generate AI content automatically when creating a new draft</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoGenMissingPublish" 
                  checked={settings.autoGenMissingPublish} 
                  onChange={(e) => setSettings({ ...settings, autoGenMissingPublish: e.target.checked })}
                  id="autoGenMissingPublish" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoGenMissingPublish" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Scan and generate missing SEO fields before publishing</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoGenFaqs" 
                  checked={settings.autoGenFaqs} 
                  onChange={(e) => setSettings({ ...settings, autoGenFaqs: e.target.checked })}
                  id="autoGenFaqs" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoGenFaqs" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Generate FAQs automatically when main article text is saved</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoGenDetails" 
                  checked={settings.autoGenDetails} 
                  onChange={(e) => setSettings({ ...settings, autoGenDetails: e.target.checked })}
                  id="autoGenDetails" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoGenDetails" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Generate Product Details automatically on new products</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoRunSeo" 
                  checked={settings.autoRunSeo} 
                  onChange={(e) => setSettings({ ...settings, autoRunSeo: e.target.checked })}
                  id="autoRunSeo" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoRunSeo" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Run live SEO scoring analysis automatically on load</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="preventPublishMissing" 
                  checked={settings.preventPublishMissing} 
                  onChange={(e) => setSettings({ ...settings, preventPublishMissing: e.target.checked })}
                  id="preventPublishMissing" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="preventPublishMissing" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Prevent publishing when required SEO fields or schema are missing</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="autoAccept" 
                  checked={settings.autoAccept} 
                  onChange={(e) => setSettings({ ...settings, autoAccept: e.target.checked })}
                  id="autoAccept" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="autoAccept" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Automatically accept AI recommended content without review</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="checkbox" 
                  name="regenTitleChange" 
                  checked={settings.regenTitleChange} 
                  onChange={(e) => setSettings({ ...settings, regenTitleChange: e.target.checked })}
                  id="regenTitleChange" 
                  style={{ width: '18px', height: '18px', accentColor: '#E0A96D' }} 
                />
                <label htmlFor="regenTitleChange" style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>Regenerate SEO titles automatically when post title changes</label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Cost & Limits */}
        {activeTab === 'limits' && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px 0' }}>
              📊 Cost & Usage Monitoring Metrics
            </h2>

            {/* Current Metrics grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Calls</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{settings.totalRequests}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Successful</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{settings.successfulRequests}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Failed</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>{settings.failedRequests}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Est. Token Count</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginTop: '4px' }}>{settings.estimatedTokens}</div>
              </div>
            </div>

            {/* Threshold controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Daily Request limit</label>
                <input 
                  type="number" 
                  name="dailyLimit" 
                  value={settings.dailyLimit} 
                  onChange={(e) => setSettings({ ...settings, dailyLimit: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Current today: <strong>{settings.requestsToday}</strong> requests used.</span>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Monthly Request limit</label>
                <input 
                  type="number" 
                  name="monthlyLimit" 
                  value={settings.monthlyLimit} 
                  onChange={(e) => setSettings({ ...settings, monthlyLimit: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '6px' }} 
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>Current month: <strong>{settings.requestsThisMonth}</strong> requests used.</span>
              </div>
            </div>

          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end', marginTop: '12px' }}>
          {saveStatus && <span style={{ fontSize: '14px', fontWeight: '700', color: saveStatus.includes('successfully') ? '#10b981' : '#ef4444' }}>{saveStatus}</span>}
          <button type="submit" style={{ background: '#E0A96D', color: '#180d15', border: 'none', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(224, 169, 109, 0.2)' }}>
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}
