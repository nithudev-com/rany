'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface SitemapRow {
  name: string;
  url: string;
  count: number;
  size: number;
  ok: boolean;
  error?: string;
  generatedAt?: string;
}

interface StatsData {
  index: string;
  productPages: number;
  sitemaps: SitemapRow[];
}

interface ValidationResult {
  name: string;
  urlCount: number;
  errors: string[];
  ok: boolean;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function StatusPill({ ok, label }: { ok: boolean; label?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '12px', fontWeight: 700,
      padding: '2px 10px', borderRadius: '20px',
      background: ok ? '#dcfce7' : '#fee2e2',
      color: ok ? '#15803d' : '#b91c1c',
    }}>
      {ok ? '✓' : '✗'} {label ?? (ok ? 'OK' : 'Error')}
    </span>
  );
}

export default function SitemapDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[] | null>(null);
  const [actionLog, setActionLog] = useState<{ time: string; msg: string; ok: boolean }[]>([]);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const log = (msg: string, ok = true) =>
    setActionLog((prev) => [{ time: new Date().toLocaleTimeString(), msg, ok }, ...prev.slice(0, 49)]);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sitemaps?action=stats');
      const data = await res.json();
      setStats(data);
    } catch {
      log('Failed to load sitemap stats', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  async function handleRegenerate(name?: string) {
    setRegenerating(name ?? 'all');
    try {
      const res = await fetch('/api/admin/sitemaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate', name }),
      });
      const data = await res.json();
      if (data.ok) {
        log(`Regenerated: ${name ?? 'all sitemaps'} — ${data.regenerated?.length ?? 0} files`);
        await fetchStats();
      } else {
        log(`Regeneration failed: ${data.error}`, false);
      }
    } catch (err: any) {
      log(`Error: ${err.message}`, false);
    } finally {
      setRegenerating(null);
    }
  }

  async function handleValidate(name?: string) {
    setValidating(name ?? 'all');
    setValidationResults(null);
    try {
      const url = name
        ? `/api/admin/sitemaps?action=validate&name=${name}`
        : '/api/admin/sitemaps?action=validate';
      const res = await fetch(url);
      const data = await res.json();
      setValidationResults(data.validated ?? []);
      const errors = (data.validated ?? []).flatMap((v: ValidationResult) => v.errors);
      log(
        errors.length === 0
          ? `Validation passed for ${name ?? 'all sitemaps'}`
          : `Validation found ${errors.length} issue(s)`,
        errors.length === 0
      );
    } catch (err: any) {
      log(`Validation error: ${err.message}`, false);
    } finally {
      setValidating(null);
    }
  }

  async function handleGscSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/sitemaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-gsc' }),
      });
      const data = await res.json();
      log(data.message ?? (data.ok ? 'Submitted to Google!' : 'Submission failed'), data.ok);
    } catch (err: any) {
      log(`GSC error: ${err.message}`, false);
    } finally {
      setSubmitting(false);
    }
  }

  const btnBase: React.CSSProperties = {
    padding: '7px 16px', fontSize: '13px', fontWeight: 600,
    borderRadius: '6px', cursor: 'pointer', border: 'none',
    transition: 'opacity 0.15s',
  };

  return (
    <div style={{ maxWidth: '1200px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', margin: 0 }}>🗺 Sitemap Manager</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Index: <a href={stats?.index ?? 'https://rany.uk/sitemap.xml'} target="_blank" rel="noreferrer"
              style={{ color: '#6366f1' }}>sitemap.xml</a>
            {stats && <> · {stats.productPages} product sitemap{stats.productPages !== 1 ? 's' : ''}</>}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => handleRegenerate()} disabled={!!regenerating}
            style={{ ...btnBase, background: '#6366f1', color: '#fff' }}>
            {regenerating === 'all' ? '⏳ Regenerating…' : '⚡ Regenerate All'}
          </button>
          <button onClick={() => handleValidate()} disabled={!!validating}
            style={{ ...btnBase, background: '#0f172a', color: '#fff' }}>
            {validating === 'all' ? '⏳ Validating…' : '✓ Validate All'}
          </button>
          <button onClick={handleGscSubmit} disabled={submitting}
            style={{ ...btnBase, background: '#16a34a', color: '#fff' }}>
            {submitting ? '⏳ Submitting…' : '🚀 Submit to Google'}
          </button>
          <button onClick={fetchStats} disabled={loading}
            style={{ ...btnBase, background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
            {loading ? '⏳' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '28px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Sitemap File', 'URLs', 'Size', 'Status', 'Last Generated', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading sitemaps…</td></tr>
            )}
            {!loading && !stats?.sitemaps?.length && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No sitemaps found.</td></tr>
            )}
            {stats?.sitemaps?.map((row, i) => (
              <tr key={row.name} style={{ borderBottom: i < (stats.sitemaps.length - 1) ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                  <a href={row.url} target="_blank" rel="noreferrer" style={{ color: '#6366f1', textDecoration: 'none' }}>
                    {row.name}
                  </a>
                </td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{row.count.toLocaleString()}</td>
                <td style={{ padding: '14px 16px', color: '#334155' }}>{formatBytes(row.size)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <StatusPill ok={row.ok} label={row.ok ? 'OK' : (row.error ?? 'Error')} />
                </td>
                <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '12px' }}>
                  {row.generatedAt ? new Date(row.generatedAt).toLocaleString() : '—'}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleRegenerate(row.name)} disabled={!!regenerating}
                      style={{ ...btnBase, padding: '5px 12px', background: '#ede9fe', color: '#6d28d9', fontSize: '12px' }}>
                      ⚡ Regen
                    </button>
                    <button onClick={() => handleValidate(row.name)} disabled={!!validating}
                      style={{ ...btnBase, padding: '5px 12px', background: '#f0fdf4', color: '#15803d', fontSize: '12px' }}>
                      ✓ Validate
                    </button>
                    <a href={row.url} target="_blank" rel="noreferrer"
                      style={{ ...btnBase, padding: '5px 12px', background: '#f8fafc', color: '#334155', fontSize: '12px', textDecoration: 'none' }}>
                      View
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation Results */}
      {validationResults && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: 0 }}>Validation Results</h2>
          {validationResults.map((v) => (
            <div key={v.name} style={{ marginBottom: '16px', padding: '16px', borderRadius: '8px', background: v.ok ? '#f0fdf4' : '#fff7ed', border: `1px solid ${v.ok ? '#bbf7d0' : '#fdba74'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#0f172a' }}>{v.name}</strong>
                <StatusPill ok={v.ok} label={v.ok ? 'Passed' : `${v.errors.length} error(s)`} />
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{v.urlCount.toLocaleString()} URLs checked</div>
              {v.errors.length > 0 && (
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#b45309', fontSize: '13px' }}>
                  {v.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <div style={{ background: '#0f172a', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Activity Log
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
            {actionLog.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                <span style={{ color: '#475569', flexShrink: 0 }}>{entry.time}</span>
                <span style={{ color: entry.ok ? '#4ade80' : '#f87171' }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GSC Instructions */}
      <div style={{ marginTop: '28px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af', marginTop: 0 }}>📡 Google Search Console</h2>
        <p style={{ color: '#1e40af', fontSize: '13px', margin: '0 0 8px 0' }}>
          To manually submit, open Google Search Console → Sitemaps → Enter: <code style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>sitemap.xml</code> → Submit
        </p>
        <p style={{ color: '#3b82f6', fontSize: '12px', margin: 0 }}>
          You can also click <strong>"Submit to Google"</strong> above to ping Google automatically (no API key required).
        </p>
      </div>
    </div>
  );
}
