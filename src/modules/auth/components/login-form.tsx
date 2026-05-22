'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth-client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      toast.error('Informe email e senha.');
      return;
    }

    startTransition(async () => {
      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        toast.error(result.error.message ?? 'Não foi possível entrar.');
        return;
      }

      toast.success('Login realizado com sucesso.');
      router.push('/admin');
      setTimeout(() => router.refresh(), 400);
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-zinc-300">
          Email
        </Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSubmit();
          }}
          autoComplete="email"
          placeholder="admin@pirillororiz.com"
          className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-zinc-300">
          Senha
        </Label>
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleSubmit();
          }}
          autoComplete="current-password"
          placeholder="••••••••"
          className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
        />
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
