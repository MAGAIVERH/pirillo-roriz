'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

type PortalLoginSessionAlertProps = {
  message: string;
  sessionEmail?: string;
};

export function PortalLoginSessionAlert({
  message,
  sessionEmail,
}: PortalLoginSessionAlertProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      toast.success('Sessão encerrada. Agora você pode entrar com outra conta.');
      window.location.reload();
    });
  };

  return (
    <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
      <p>{message}</p>
      {sessionEmail ? (
        <p className="mt-2 font-medium text-white">Conta logada: {sessionEmail}</p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={handleSignOut}
        className="mt-3 border-amber-500/30 bg-transparent text-amber-100 hover:bg-amber-500/10 hover:text-white"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? 'Saindo...' : 'Sair da conta atual'}
      </Button>
    </div>
  );
}
