import {
  BookUser,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InstructorsSummary } from '@/modules/instructors/queries/get-instructors-summary';

type InstructorsSummaryCardsProps = {
  summary: InstructorsSummary;
};

const cards = (summary: InstructorsSummary) => [
  {
    title: 'Total de professores',
    value: String(summary.totalInstructors),
    description: 'Quantidade total de professores cadastrados.',
    icon: BookUser,
  },
  {
    title: 'Professores ativos',
    value: String(summary.activeInstructors),
    description: 'Professores atualmente ativos na operação.',
    icon: ShieldCheck,
  },
  {
    title: 'Professores inativos',
    value: String(summary.inactiveInstructors),
    description: 'Professores temporariamente inativos.',
    icon: UserRoundX,
  },
  {
    title: 'Com turmas vinculadas',
    value: String(summary.assignedInstructors),
    description: 'Professores que já estão responsáveis por turmas.',
    icon: UserRoundCheck,
  },
];

export const InstructorsSummaryCards = ({
  summary,
}: InstructorsSummaryCardsProps) => {
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
