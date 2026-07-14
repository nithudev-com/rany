"use client";

import { useState } from "react";

export function ImportForm() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [updateMode, setUpdateMode] = useState<"FULL" | "PRICE_STOCK_ONLY">("FULL");
  const [priceTiers, setPriceTiers] = useState({
    tier1: "", // < $10
    tier2: "", // $10 - $25
    tier3: "", // $25 - $50
    tier4: "", // $50 - $75
    tier5: "", // $75 - $100
    tier6: "", // > $100
  });

  const handleTierChange = (tier: keyof typeof priceTiers, value: string) => {
    setPriceTiers((prev) => ({ ...prev, [tier]: value }));
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("Uploading product file...");

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Add priceTiers as JSON
    formData.append("priceTiers", JSON.stringify(priceTiers));
    formData.append("updateMode", updateMode);

    const response = await fetch("/api/import/products", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(data.error || "Import failed");
      return;
    }

    setStatus(`Batch created: ${data.batchId}. ${data.mode === "queued" ? "Worker will process it." : "Processed now."}`);
  }

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        .loader-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 8px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(0, 100, 255, 0.1);
          border-top-color: #0064ff;
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 16px;
          margin-bottom: 16px;
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .tier-input {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tier-input label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }
      `}</style>
      
      <form className="form-card" onSubmit={submit}>
        <h1>Product Importer</h1>
        <p className="muted">
          Upload CSV with columns: sku, title, slug, price, salePrice, stockQuantity, categoryName, categorySlug, brandName, brandSlug, imageUrl, seoTitle, seoDescription.
        </p>
        <input className="input" type="file" name="file" accept=".csv" required />
        
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>Price Adjustment Percentage (%) by Tier</h3>
          <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
            Enter a percentage to increase/decrease prices automatically (e.g., 10 for +10%, -5 for -5%). Leave blank for no change.
          </p>
          <div className="tier-grid">
            <div className="tier-input">
              <label>Under $10</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier1} onChange={(e) => handleTierChange("tier1", e.target.value)} />
            </div>
            <div className="tier-input">
              <label>$10 to $25</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier2} onChange={(e) => handleTierChange("tier2", e.target.value)} />
            </div>
            <div className="tier-input">
              <label>$25 to $50</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier3} onChange={(e) => handleTierChange("tier3", e.target.value)} />
            </div>
            <div className="tier-input">
              <label>$50 to $75</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier4} onChange={(e) => handleTierChange("tier4", e.target.value)} />
            </div>
            <div className="tier-input">
              <label>$75 to $100</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier5} onChange={(e) => handleTierChange("tier5", e.target.value)} />
            </div>
            <div className="tier-input">
              <label>Over $100</label>
              <input className="input" type="number" step="any" placeholder="%" value={priceTiers.tier6} onChange={(e) => handleTierChange("tier6", e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <input 
            type="checkbox" 
            id="updateMode" 
            checked={updateMode === "PRICE_STOCK_ONLY"}
            onChange={(e) => setUpdateMode(e.target.checked ? "PRICE_STOCK_ONLY" : "FULL")}
          />
          <label htmlFor="updateMode" style={{ fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
            <strong>Update Existing Products Only (Price & Stock)</strong> - If checked, existing products will only have their price and stock updated (title, description, images will remain unchanged). New products will still be fully created.
          </label>
        </div>

        <div>
          <button className="button secondary" disabled={loading} type="submit" style={{ width: '100%', padding: '12px' }}>
            Upload & Process CSV
          </button>
        </div>
        
        {status && !loading ? <p style={{ marginTop: 16, fontWeight: 500, color: '#059669' }}>{status}</p> : null}
        
        {loading && (
          <div className="loader-overlay">
            <div className="spinner"></div>
            <h3 style={{ margin: 0, color: '#111827' }}>Processing Import</h3>
            <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>Please wait, this might take a moment...</p>
          </div>
        )}
      </form>
    </div>
  );
}
