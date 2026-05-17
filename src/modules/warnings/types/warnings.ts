export type WarningVisibility = 'todos' | 'alunos' | 'professores';

export type WarningType = 'info' | 'aviso' | 'importante';

export type WarningStatus = 'rascunho' | 'agendado' | 'ativo' | 'expirado';

export type Warning = {
  id: string;
  title: string;
  content: string;
  type: WarningType;
  visibility: WarningVisibility;
  status: WarningStatus;
  publishedAt: Date | null;
  expiresAt: Date | null;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type WarningsOverviewStats = {
  total: number;
  active: number;
  drafts: number;
  expired: number;
};
