import Link from 'next/link';

export default function Home() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-black px-6'>
      <div className='w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-8 text-white shadow-xl'>
        <div className='space-y-3 text-center'>
          <h1 className='text-3xl font-bold'>Jiu Jitsu</h1>
          <p className='text-sm text-zinc-400'>
            Base inicial da plataforma criada com sucesso.
          </p>
        </div>

        <div className='mt-8 space-y-3'>
          <Link
            href='/admin'
            className='flex h-11 w-full items-center justify-center rounded-md bg-red-600 text-sm font-medium text-white transition hover:bg-red-500'
          >
            Entrar na área administrativa
          </Link>

          <Link
            href='/teste-auth'
            className='flex h-11 w-full items-center justify-center rounded-md border border-white/10 bg-zinc-900 text-sm font-medium text-white transition hover:bg-zinc-800'
          >
            Ir para teste de autenticação
          </Link>
        </div>
      </div>
    </main>
  );
}
