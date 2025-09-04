'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

export default function ShuffleButton({ groupId }: { groupId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/groups/${groupId}/execute-matching`, { method: 'POST' });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        window.location.reload();
      } catch (e: any) {
        setError(e.message || 'Failed to start matching');
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={onClick} disabled={pending}>
        <Shuffle className="mr-2 h-4 w-4" />
        {pending ? 'Matching…' : 'Start Matching'}
      </Button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
