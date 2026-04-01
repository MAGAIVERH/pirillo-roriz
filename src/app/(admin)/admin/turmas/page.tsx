import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminTurmasPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Turmas e horários'
      description='Aqui vamos montar a gestão de turmas, horários, lotação, professor responsável, calendário de aulas, sessões e base para presença com QR Code.'
      items={[
        'Lista de turmas',
        'Cadastro de turma',
        'Horários da turma',
        'Capacidade e lotação',
        'Sessões de aula',
        'Matrículas',
      ]}
    />
  );
}
