import { ModulePagePlaceholder } from '@/components/shared/module-page-placeholder';

export default function AdminLojaPage() {
  return (
    <ModulePagePlaceholder
      eyebrow='Módulo'
      title='Loja e estoque'
      description='Aqui vamos criar a gestão da loja da academia com produtos, estoque, pedidos, separação e retirada presencial feita pelo aluno na academia.'
      items={[
        'Produtos',
        'Categorias',
        'Estoque',
        'Pedidos',
        'Retirada na academia',
        'Movimentações',
      ]}
    />
  );
}
