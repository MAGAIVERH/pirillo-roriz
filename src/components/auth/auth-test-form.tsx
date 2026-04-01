'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import { signIn, signOut, signUp, useSession } from '@/lib/auth-client';

export const AuthTestForm = () => {
  const { data, isPending, refetch } = useSession();

  const [name, setName] = useState('Magaiver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<
    'signup' | 'signin' | 'signout' | null
  >(null);
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    try {
      setLoadingAction('signup');
      setMessage('');

      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || 'Erro ao criar conta.');
        return;
      }

      setMessage('Conta criada com sucesso.');
      await refetch();
    } catch {
      setMessage('Erro inesperado ao criar conta.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoadingAction('signin');
      setMessage('');

      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        setMessage(result.error.message || 'Erro ao fazer login.');
        return;
      }

      setMessage('Login realizado com sucesso.');
      await refetch();
    } catch {
      setMessage('Erro inesperado ao fazer login.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoadingAction('signout');
      setMessage('');

      const result = await signOut();

      if (result.error) {
        setMessage(result.error.message || 'Erro ao sair.');
        return;
      }

      setMessage('Logout realizado com sucesso.');
      await refetch();
    } catch {
      setMessage('Erro inesperado ao sair.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='mb-6 space-y-1'>
          <h2 className='text-xl font-semibold'>Teste do Better Auth</h2>
          <p className='text-sm text-zinc-400'>
            Use um email real ou de teste e uma senha simples para validarmos o
            fluxo.
          </p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm text-zinc-300'>Nome</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className='h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-red-500'
              placeholder='Seu nome'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-300'>Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-red-500'
              placeholder='seuemail@email.com'
              type='email'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm text-zinc-300'>Senha</label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm outline-none ring-0 placeholder:text-zinc-500 focus:border-red-500'
              placeholder='Digite sua senha'
              type='password'
            />
          </div>

          <div className='grid gap-3 pt-2 sm:grid-cols-3'>
            <button
              type='button'
              onClick={handleSignUp}
              disabled={loadingAction !== null}
              className='flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loadingAction === 'signup' ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Cadastrar'
              )}
            </button>

            <button
              type='button'
              onClick={handleSignIn}
              disabled={loadingAction !== null}
              className='flex h-11 items-center justify-center rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loadingAction === 'signin' ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Entrar'
              )}
            </button>

            <button
              type='button'
              onClick={handleSignOut}
              disabled={loadingAction !== null}
              className='flex h-11 items-center justify-center rounded-md border border-white/10 bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loadingAction === 'signout' ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Sair'
              )}
            </button>
          </div>

          <div className='rounded-md border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-300'>
            <p className='font-medium text-white'>Mensagem</p>
            <p className='mt-2 text-zinc-400'>
              {message || 'Nenhuma ação executada ainda.'}
            </p>
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='mb-6 space-y-1'>
          <h2 className='text-xl font-semibold'>Sessão atual</h2>
          <p className='text-sm text-zinc-400'>
            Aqui vamos ver se o usuário realmente está autenticado.
          </p>
        </div>

        <div className='rounded-md border border-white/10 bg-zinc-900 p-4'>
          {isPending ? (
            <div className='flex items-center gap-2 text-sm text-zinc-400'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Carregando sessão...
            </div>
          ) : (
            <pre className='overflow-x-auto text-xs text-zinc-300'>
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
};
