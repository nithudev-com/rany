'use client';

import { useState } from 'react';

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  return (
    <button 
      onClick={handleCopy}
      title="Copy Link"
      aria-label="Copy Link"
      style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        background: copied ? '#10b981' : '#64748b', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
        padding: 0
      }}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
      )}
    </button>
  );
}
