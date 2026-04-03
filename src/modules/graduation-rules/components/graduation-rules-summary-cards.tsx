import {
  CalendarCheck2,
  GraduationCap,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GraduationRulesSummary } from '@/modules/graduation-rules/queries/get-graduation-rules-summary';

type GraduationRulesSummaryCardsProps = {
  summary: GraduationRulesSummary;
};

const cards = (summary: GraduationRulesSummary) => [
  {
    title: 'Total de regras',
    value: String(summary.totalRules),
    description: 'Quantidade total de regras cadastradas.',
    icon: GraduationCap,
  },
  {
    title: 'Regras ativas',
    value: String(summary.activeRules),
    description: 'Regras atualmente disponíveis para cálculo.',
    icon: ShieldCheck,
  },
  {
    title: 'Programa kids',
    value: String(summary.kidsRules),
    description: 'Regras voltadas para a progressão infantil.',
    icon: Users,
  },
  {
    title: 'Programa adulto',
    value: String(summary.adultRules),
    description: 'Regras voltadas para a progressão adulta.',
    icon: CalendarCheck2,
  },
];

export const GraduationRulesSummaryCards = ({
  summary,
}: GraduationRulesSummaryCardsProps) => {
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
