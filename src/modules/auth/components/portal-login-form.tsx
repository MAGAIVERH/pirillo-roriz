'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signOut } from '@/lib/auth-client';

type PortalLoginFormProps = {
  redirectTo: string;
  portalLabel: string;
};

export function PortalLoginForm({
  redirectTo,
  portalLabel,
}: PortalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      toast.error('Informe email e senha.');
      return;
    }

    startTransition(async () => {
      await signOut();

      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        const message = result.error.message ?? 'Não foi possível entrar.';

        toast.error(
          message.toLowerCase().includes('password') ||
            message.toLowerCase().includes('senha') ||
            message.toLowerCase().includes('invalid email')
            ? 'Email ou senha incorretos. Se você recebeu uma senha antiga por email, ela pode ter sido redefinida — peça uma nova senha ao admin.'
            : message,
        );
        return;
      }

      toast.success(`Bem-vindo ao ${portalLabel}.`);
      window.location.assign(redirectTo);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="portal-login-email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="portal-login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSubmit();
          }}
          autoComplete="email"
          placeholder="seu@email.com"
          className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="portal-login-password" className="text-zinc-300">
          Senha
        </Label>
        <div className="relative">
          <Input
            id="portal-login-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSubmit();
            }}
            autoComplete="current-password"
            placeholder="••••••••"
            className="border-white/10 bg-zinc-900 pr-11 text-white placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 transition hover:text-white"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-xs leading-5 text-zinc-500">
          Use a senha mais recente enviada por email. Senhas antigas deixam de
          funcionar após uma redefinição.
        </p>
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="h-11 w-full bg-red-600 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Entrar'
        )}
      </Button>
    </div>
  );
}
