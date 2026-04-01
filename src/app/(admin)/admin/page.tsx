import { Users, GraduationCap, CalendarDays, ShoppingBag } from 'lucide-react';

const cards = [
  {
    title: 'Alunos ativos',
    value: '128',
    description: 'Visão inicial do total atual de alunos ativos.',
    icon: Users,
  },
  {
    title: 'Turmas em andamento',
    value: '12',
    description: 'Quantidade de turmas atualmente cadastradas.',
    icon: CalendarDays,
  },
  {
    title: 'Graduações próximas',
    value: '9',
    description: 'Alunos que podem entrar em análise de graduação.',
    icon: GraduationCap,
  },
  {
    title: 'Pedidos da loja',
    value: '6',
    description: 'Pedidos aguardando separação ou retirada.',
    icon: ShoppingBag,
  },
];

export default function AdminPage() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Pirillo Roriz
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>
            Painel administrativo
          </h1>

          <p className='max-w-2xl text-sm text-zinc-400'>
            Essa é a fundação visual da área administrativa. Agora já temos uma
            estrutura pronta para receber dashboard, alunos, professores,
            turmas, financeiro, analytics e loja.
          </p>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {cards.map(({ title, value, description, icon: Icon }) => (
          <article
            key={title}
            className='rounded-2xl border border-white/10 bg-zinc-950 p-5'
          >
            <div className='mb-4 flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm text-zinc-400'>{title}</p>
                <h2 className='mt-2 text-3xl font-bold'>{value}</h2>
              </div>

              <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
                <Icon className='h-5 w-5' />
              </div>
            </div>

            <p className='text-sm leading-6 text-zinc-400'>{description}</p>
          </article>
        ))}
      </section>

      <section className='grid gap-4 xl:grid-cols-[1.4fr_0.8fr]'>
        <article className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Próximos módulos</h2>
            <p className='text-sm text-zinc-400'>
              A próxima etapa será transformar essa base visual em navegação
              real do sistema.
            </p>
          </div>

          <div className='mt-6 grid gap-3 sm:grid-cols-2'>
            {[
              'Gestão de alunos',
              'Gestão de professores',
              'Turmas e horários',
              'Presença e QR Code',
              'Graduações',
              'Financeiro',
              'Loja e estoque',
              'Analytics',
            ].map((item) => (
              <div
                key={item}
                className='rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-zinc-300'
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold'>Status da fundação</h2>
            <p className='text-sm text-zinc-400'>
              Tudo que precisávamos para sair do zero já está validado.
            </p>
          </div>

          <div className='mt-6 space-y-3'>
            {[
              'Next.js configurado',
              'Prisma conectado ao Neon',
              'Migration inicial aplicada',
              'Better Auth funcionando',
              'Login e logout validados',
              'Tema base configurado',
              'Shell inicial do admin criado',
            ].map((item) => (
              <div
                key={item}
                className='rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-zinc-300'
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
