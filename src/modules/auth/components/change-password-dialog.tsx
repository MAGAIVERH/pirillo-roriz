'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient, signOut } from '@/lib/auth-client';

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  function reset() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('A confirmação não confere com a nova senha.');
      return;
    }

    startTransition(async () => {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(
          result.error.message ?? 'Não foi possível alterar a senha.',
        );
        return;
      }

      toast.success('Senha alterada. Faça login novamente.');
      onOpenChange(false);
      reset();

      // Por segurança, depois de trocar a senha, encerra a sessão e devolve
      // para o login — o usuário valida que a nova senha funciona.
      await signOut();
      router.push('/login');
      setTimeout(() => router.refresh(), 300);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) reset();
      }}
    >
      <DialogContent className="scrollbar-hide max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-4 w-4 text-red-500" />
            Trocar senha
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Por segurança, ao trocar a senha sua sessão será encerrada e você
            precisará entrar novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-current" className="text-zinc-300">
              Senha atual
            </Label>
            <Input
              id="cp-current"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-new" className="text-zinc-300">
              Nova senha
            </Label>
            <Input
              id="cp-new"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo de 8 caracteres"
              className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-confirm" className="text-zinc-300">
              Confirmar nova senha
            </Label>
            <Input
              id="cp-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirmar troca'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
