import { PauseCircle, ShieldAlert, UserCheck, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentsSummary } from '@/modules/students/queries/get-students-summary';

type StudentSummaryCardsProps = {
  summary: StudentsSummary;
};

const cards = (summary: StudentsSummary) => [
  {
    title: 'Total de alunos',
    value: String(summary.totalStudents),
    description: 'Quantidade total de alunos operacionais cadastrados.',
    icon: Users,
  },
  {
    title: 'Alunos ativos',
    value: String(summary.activeStudents),
    description: 'Total de alunos com matrícula ativa.',
    icon: UserCheck,
  },
  {
    title: 'Inadimplentes',
    value: String(summary.delinquentStudents),
    description: 'Alunos com pendência financeira.',
    icon: ShieldAlert,
  },
  {
    title: 'Trancados',
    value: String(summary.frozenStudents),
    description: 'Alunos com matrícula temporariamente pausada.',
    icon: PauseCircle,
  },
];

export const StudentSummaryCards = ({ summary }: StudentSummaryCardsProps) => {
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
