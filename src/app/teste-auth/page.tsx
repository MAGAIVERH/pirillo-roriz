import { AuthTestForm } from '@/components/auth/auth-test-form';

export default function TesteAuthPage() {
  return (
    <main className='min-h-screen bg-black px-6 py-10 text-white'>
      <div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold'>Teste de autenticação</h1>
          <p className='text-sm text-zinc-400'>
            Aqui vamos validar cadastro, login, sessão e logout antes de seguir
            para o restante da plataforma.
          </p>
        </div>

        <AuthTestForm />
      </div>
    </main>
  );
}
