'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { signOut } from '@/lib/auth-client';

type StudentSignOutButtonProps = {
  redirectTo?: string;
};

export function StudentSignOutButton({
  redirectTo = '/aluno/login',
}: StudentSignOutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const result = await signOut();

      if (result.error) {
        toast.error(result.error.message ?? 'Não foi possível sair.');
        return;
      }

      toast.success('Sessão encerrada.');
      router.push(redirectTo);
      setTimeout(() => router.refresh(), 300);
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
    >
      <LogOut className="h-3.5 w-3.5" />
      Sair
    </button>
  );
}
