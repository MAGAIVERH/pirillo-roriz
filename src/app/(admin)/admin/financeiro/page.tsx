import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminFinanceiroPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Financeiro'
      description='Aqui vamos construir o módulo financeiro com planos, mensalidades, cobranças, pagamentos, inadimplência e visão estratégica de receita da academia.'
      items={[
        'Planos',
        'Mensalidades',
        'Cobranças',
        'Pagamentos',
        'Inadimplência',
        'Relatórios financeiros',
      ]}
    />
  );
}
