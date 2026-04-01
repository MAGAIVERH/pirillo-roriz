import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminAnalyticsPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Analytics e inteligência'
      description='Aqui vamos construir a área estratégica da academia, com retenção, evasão, faixa etária, presença, crescimento, graduação, horários fortes e oportunidades de melhoria.'
      items={[
        'Faixa etária',
        'Retenção por faixa',
        'Evasão por faixa',
        'Presença por turma',
        'Entrada de novos alunos',
        'Visão estratégica',
      ]}
    />
  );
}
