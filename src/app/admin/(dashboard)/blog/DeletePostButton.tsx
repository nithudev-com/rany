'use client';

import { deleteBlogPost } from '@/actions/blog';
import { useTransition } from 'react';

export function DeletePostButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      onClick={() => {
        if (confirm('Are you sure you want to delete this post?')) {
          startTransition(() => deleteBlogPost(String(id)));
        }
      }}
      disabled={isPending}
      style={{ padding: '6px 12px', background: '#FFF4F7', color: '#D63062', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
