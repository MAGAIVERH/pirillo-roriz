import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FinanceSummaryItem } from '@/modules/finance/types/finance-summary';

type FinanceSummaryCardsProps = {
  items: FinanceSummaryItem[];
};

export const FinanceSummaryCards = ({ items }: FinanceSummaryCardsProps) => {
  return (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {items.map(({ title, value, description, icon: Icon }) => (
        <Card key={title} className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0'>
            <div className='space-y-2'>
              <CardTitle className='text-sm font-medium text-zinc-400'>
                {title}
              </CardTitle>

              <p className='text-3xl font-bold leading-none tracking-tight text-white'>
                {value}
              </p>
            </div>

            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
              <Icon className='h-5 w-5' />
            </div>
          </CardHeader>

          <CardContent>
            <p className='text-sm leading-6 text-zinc-400'>{description}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
};
