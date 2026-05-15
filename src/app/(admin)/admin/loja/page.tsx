// src/app/admin/loja/page.tsx

import { StoreClientView } from '@/modules/store/components/store-client-view';
import { getStoreOverviewStats, getStoreProducts, getStoreReservations } from '@/modules/store/queries/get-store-stats';
import { Archive, AlertTriangle, BookmarkCheck, ShoppingBag } from 'lucide-react';


export default async function AdminLojaPage() {
  const [products, reservations, stats] = await Promise.all([
    getStoreProducts(),
    getStoreReservations(),
    getStoreOverviewStats(),
  ]);

  const metricCards = [
    {
      title: 'Produtos na loja',
      value: String(stats.totalProducts),
      desc: 'Total de itens cadastrados.',
      icon: ShoppingBag,
      alert: false,
    },
    {
      title: 'Itens em estoque',
      value: String(stats.totalStock),
      desc: 'Soma de todas as quantidades.',
      icon: Archive,
      alert: false,
    },
    {
      title: 'Reservas pendentes',
      value: String(stats.pendingReservations),
      desc: 'Aguardando retirada presencial.',
      icon: BookmarkCheck,
      alert: stats.pendingReservations > 0,
    },
    {
      title: 'Sem estoque',
      value: String(stats.outOfStock),
      desc: 'Produtos esgotados ou zerados.',
      icon: AlertTriangle,
      alert: stats.outOfStock > 0,
    },
  ];

  return (
    <div className='space-y-6'>

      {/* Cabeçalho */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Módulo
          </p>
          <h1 className='text-3xl font-bold tracking-tight'>Loja</h1>
          <p className='max-w-2xl text-sm leading-7 text-zinc-400'>
            Gerencie produtos, estoque e reservas. Alunos e professores
            reservam presencialmente — o estoque é atualizado em tempo real.
          </p>
        </div>
      </section>

      {/* Cards de métricas */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map(({ title, value, desc, icon: Icon, alert }) => (
          <div
            key={title}
            className={`rounded-2xl border p-5 ${
              alert
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/10 bg-zinc-950'
            }`}
          >
            <div className='flex items-start justify-between'>
              <p className='text-sm font-medium text-zinc-400'>{title}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  alert ? 'bg-red-600/20 text-red-400' : 'bg-red-600/15 text-red-500'
                }`}
              >
                <Icon className='h-4 w-4' />
              </div>
            </div>
            <p className={`mt-3 text-3xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>
              {value}
            </p>
            <p className='mt-2 text-sm text-zinc-400'>{desc}</p>
          </div>
        ))}
      </section>

      {/* Conteúdo interativo (client component) */}
      <StoreClientView
        initialProducts={products}
        initialReservations={reservations}
      />

    </div>
  );
}
