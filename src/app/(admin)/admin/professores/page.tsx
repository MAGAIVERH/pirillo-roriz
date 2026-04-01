import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminProfessoresPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Gestão de professores'
      description='Aqui vamos estruturar o módulo de professores com cadastro, turmas vinculadas, horários, indicadores e informações importantes para a operação da academia.'
      items={[
        'Lista de professores',
        'Cadastro de professor',
        'Turmas vinculadas',
        'Horários',
        'Indicadores',
        'Observações internas',
      ]}
    />
  );
}
