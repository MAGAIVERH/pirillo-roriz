import { CalendarDays, ShieldCheck, UserCheck, UserX } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ClassesSummary } from '@/modules/classes/queries/get-classes-summary';

type ClassesSummaryCardsProps = {
  summary: ClassesSummary;
};

const cards = (summary: ClassesSummary) => [
  {
    title: 'Total de turmas',
    value: String(summary.totalClasses),
    description: 'Quantidade total de turmas cadastradas.',
    icon: CalendarDays,
  },
  {
    title: 'Turmas ativas',
    value: String(summary.activeClasses),
    description: 'Turmas atualmente ativas na operação.',
    icon: ShieldCheck,
  },
  {
    title: 'Com professor',
    value: String(summary.classesWithInstructor),
    description: 'Turmas com professor já vinculado.',
    icon: UserCheck,
  },
  {
    title: 'Sem professor',
    value: String(summary.classesWithoutInstructor),
    description: 'Turmas que ainda precisam de responsável.',
    icon: UserX,
  },
];

export const ClassesSummaryCards = ({ summary }: ClassesSummaryCardsProps) => {
  return (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards(summary).map(({ title, value, description, icon: Icon }) => (
        <Card key={title} className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader className='flex flex-row items-start justify-between space-y-0'>
            <div className='space-y-2'>
              <CardTitle className='text-sm font-medium text-zinc-400'>
                {title}
              </CardTitle>
              <p className='text-3xl font-bold text-white'>{value}</p>
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
