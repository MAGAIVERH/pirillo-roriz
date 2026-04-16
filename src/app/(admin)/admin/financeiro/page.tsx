import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FinanceBlocksGrid } from '@/modules/finance/components/finance-blocks-grid';
import { FinanceReceivablesTable } from '@/modules/finance/components/finance-receivables-table';
import { FinanceSummaryCards } from '@/modules/finance/components/finance-summary-cards';
import {
  financialBlocks,
  financialOverview,
  financialRows,
} from '@/modules/finance/data/finance-dashboard-data';

export default function AdminFinanceiroPage() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Módulo
            </p>

            <h1 className='text-3xl font-bold tracking-tight'>Financeiro</h1>

            <p className='max-w-4xl text-sm leading-7 text-zinc-400'>
              Aqui o administrador acompanha receita, projeção financeira,
              cobranças, mensalidades, inadimplência e a saúde financeira da
              academia em um único lugar.
            </p>
          </div>

          <Button className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Nova cobrança
          </Button>
        </div>
      </section>

      <FinanceSummaryCards items={financialOverview} />

      <FinanceBlocksGrid items={financialBlocks} />

      <FinanceReceivablesTable rows={financialRows} />
    </div>
  );
}
