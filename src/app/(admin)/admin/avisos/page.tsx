import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminAvisosPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Avisos e comunicados'
      description='Aqui vamos montar o mural e os comunicados da academia, com avisos gerais, segmentados por turma e por tipo de usuário.'
      items={[
        'Comunicados gerais',
        'Avisos por turma',
        'Avisos por perfil',
        'Mensagens importantes',
        'Validade do aviso',
        'Histórico de publicações',
      ]}
    />
  );
}
