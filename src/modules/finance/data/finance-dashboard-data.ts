import {
  AlertTriangle,
  BadgeDollarSign,
  CreditCard,
  FileBarChart2,
  PlusCircle,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import type { FinanceSummaryItem } from '@/modules/finance/types/finance-summary';

export const financialOverview: FinanceSummaryItem[] = [
  {
    title: 'Receita do mês',
    value: 'R$ 18.450,00',
    description: 'Total recebido no mês atual.',
    icon: TrendingUp,
  },
  {
    title: 'Receita prevista',
    value: 'R$ 21.300,00',
    description: 'Projeção com base nas cobranças ativas.',
    icon: BadgeDollarSign,
  },
  {
    title: 'Em aberto',
    value: 'R$ 3.120,00',
    description: 'Valores pendentes de recebimento.',
    icon: Wallet,
  },
  {
    title: 'Cobranças vencidas',
    value: '8',
    description: 'Pagamentos que já passaram do vencimento.',
    icon: AlertTriangle,
  },
];

export const financeQuickActions = [
  {
    title: 'Planos',
    description: 'Valores, periodicidade e vínculo com alunos.',
    icon: Receipt,
  },
  {
    title: 'Mensalidades',
    description: 'Controle do mês, vencimentos e recorrência.',
    icon: CreditCard,
  },
  {
    title: 'Cobranças',
    description: 'Pendências, vencidos e recuperação.',
    icon: PlusCircle,
  },
  {
    title: 'Pagamentos',
    description: 'Registro manual, confirmações e histórico.',
    icon: Wallet,
  },
  {
    title: 'Inadimplência',
    description: 'Atrasos, dias vencidos e prioridade de cobrança.',
    icon: AlertTriangle,
  },
  {
    title: 'Relatórios',
    description: 'Receita, previsão e indicadores financeiros.',
    icon: FileBarChart2,
  },
];

export const financialRows = [
  {
    student: 'Rafael Morais',
    plan: 'Plano Adulto',
    dueDate: '10/04/2026',
    paidInMonth: 'R$ 180,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
  {
    student: 'Jorge Augusto',
    plan: 'Plano Competição',
    dueDate: '12/04/2026',
    paidInMonth: 'R$ 0,00',
    pending: 'R$ 220,00',
    status: 'Vencido',
  },
  {
    student: 'Helano Magalhães',
    plan: 'Plano Kids',
    dueDate: '15/04/2026',
    paidInMonth: 'R$ 160,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
  {
    student: 'Carlos Henrique',
    plan: 'Plano No-Gi',
    dueDate: '18/04/2026',
    paidInMonth: 'R$ 0,00',
    pending: 'R$ 190,00',
    status: 'Pendente',
  },
  {
    student: 'Fernanda Alves',
    plan: 'Plano Adulto',
    dueDate: '20/04/2026',
    paidInMonth: 'R$ 180,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
];
