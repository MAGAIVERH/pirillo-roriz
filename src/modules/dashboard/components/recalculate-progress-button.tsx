'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import { recalculateAllProgressAction } from '@/modules/students/actions/recalculate-all-progress';

export function RecalculateProgressButton() {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await recalculateAllProgressAction();
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className="h-10 gap-2 rounded-xl border-white/10 bg-zinc-900 text-sm text-white hover:bg-zinc-800 hover:text-white"
    >
      <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
      {isPending ? 'Recalculando...' : 'Recalcular progressos'}
    </Button>
  );
}
