import {
  AlertTriangle,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Clock,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentFinanceSummary } from '@/modules/finance/queries/get-student-finance-summary';

type StudentFinanceCardProps = {
  studentName: string;
  billingDueDay: number | null;
  finance: StudentFinanceSummary;
};

const getStatusClasses = (status: string) => {
  if (status === 'PAID') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  }
  if (status === 'OVERDUE') {
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  }
  return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
};

const getStatusIcon = (status: string) => {
  if (status === 'PAID') return CheckCircle2;
  if (status === 'OVERDUE') return AlertTriangle;
  return Clock;
};

export const StudentFinanceCard = ({
  studentName,
  billingDueDay,
  finance,
}: StudentFinanceCardProps) => {
  return (
    <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold text-white'>
          Situação financeira
        </h2>
        <p className='text-sm text-zinc-400'>
          Resumo financeiro de {studentName} no mês atual.
        </p>
      </div>

      <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {/* Plano */}
        <Card className='border-white/10 bg-zinc-900 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-400'>
              Plano
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
              <CreditCard className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-xl font-bold text-white'>
              {finance.planName ?? 'Sem plano'}
            </p>
            <p className='mt-1 text-sm text-zinc-400'>
              {finance.priceLabel ?? 'Nenhum plano vinculado'}
            </p>
          </CardContent>
        </Card>

        {/* Dia de vencimento */}
        <Card className='border-white/10 bg-zinc-900 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-400'>
              Vencimento
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
              <CalendarClock className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-xl font-bold text-white'>
              {billingDueDay ? `Todo dia ${billingDueDay}` : '-'}
            </p>
            <p className='mt-1 text-sm text-zinc-400'>Dia de cobrança mensal</p>
          </CardContent>
        </Card>

        {/* Valor do mês */}
        <Card className='border-white/10 bg-zinc-900 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-400'>
              Fatura do mês
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
              <BadgeDollarSign className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-xl font-bold text-white'>
              {finance.currentInvoice?.amountLabel ?? 'R$ 0,00'}
            </p>
            <p className='mt-1 text-sm text-zinc-400'>
              {finance.currentInvoice
                ? `Vence em ${finance.currentInvoice.dueDate}`
                : 'Sem fatura este mês'}
            </p>
          </CardContent>
        </Card>

        {/* Status da fatura */}
        <Card className='border-white/10 bg-zinc-900 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-zinc-400'>
              Status
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
              {finance.currentInvoice ? (
                (() => {
                  const Icon = getStatusIcon(finance.currentInvoice.status);
                  return <Icon className='h-4 w-4' />;
                })()
              ) : (
                <Clock className='h-4 w-4' />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {finance.currentInvoice ? (
              <>
                <Badge
                  className={getStatusClasses(finance.currentInvoice.status)}
                >
                  {finance.currentInvoice.statusLabel}
                </Badge>
                {finance.currentInvoice.paidAt ? (
                  <p className='mt-2 text-sm text-zinc-400'>
                    Pago em {finance.currentInvoice.paidAt}
                  </p>
                ) : null}
              </>
            ) : (
              <p className='text-sm text-zinc-400'>Sem fatura gerada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
