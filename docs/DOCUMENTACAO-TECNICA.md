# Documentação Técnica — Pirillo Roriz

Este documento descreve **por que** o projeto existe, **como** foi estruturado, **como funciona** internamente e quais padrões devem ser seguidos por quem for manter ou evoluir a plataforma.

---

## 1. Contexto e motivação

### Problema

Academias de Jiu-Jitsu costumam operar com planilhas, grupos de WhatsApp e controles manuais para:

- matrículas e status de alunos;
- presença em aulas;
- graduação por faixa e grau;
- mensalidades e inadimplência;
- comunicação (avisos);
- venda simples de produtos (kimonos, patches).

Isso gera retrabalho, inconsistência de dados e dificuldade para professores e administradores tomarem decisões.

### Solução

O **Pirillo Roriz** é uma plataforma web única com **três portais** que compartilham o mesmo banco e a mesma regra de negócio, mas com interfaces e permissões distintas:

1. **Admin** — visão completa da operação.
2. **Professor** — foco em turmas, presença e alunos do dia a dia.
3. **Aluno** — QR Code, avisos, loja e acompanhamento de presença/progresso.

A separação de portais é intencional: cada perfil vê apenas o que precisa, reduzindo complexidade na UI e reforçando segurança.

---

## 2. Decisões de arquitetura

### 2.1 Next.js App Router + Server Components

**Por quê:** a maior parte das telas é leitura de dados (listagens, dashboards, relatórios). Server Components permitem buscar dados no servidor, sem expor queries ao cliente e com melhor performance inicial.

**Como funciona:**

- Pages em `src/app/` são, na maioria, `async` Server Components.
- Dados vêm de funções em `src/modules/*/queries/`.
- Mutações (criar, editar, excluir) usam **Server Actions** em `src/modules/*/actions/`.
- Client Components (`'use client'`) ficam restritos a formulários, interatividade e hooks.

### 2.2 Domínios em `src/modules/`

**Por quê:** evitar que `app/` vire um monólito com lógica espalhada. Cada área de negócio é um módulo autocontido.

**Estrutura padrão de um módulo:**

```
modules/[dominio]/
├── types/       # Tipos TypeScript do domínio
├── schemas/     # Schemas Zod (entrada de actions e forms)
├── queries/     # Funções de leitura (Prisma + transformação)
├── actions/     # Server Actions (validação → execução → revalidate)
├── components/  # UI específica do domínio
├── lib/         # Helpers puros do domínio
└── data/        # Dados estáticos (quando aplicável)
```

**Regra:** pages nunca contêm queries Prisma diretas nem regras de negócio complexas.

### 2.3 Prisma + PostgreSQL (Neon)

**Por quê:** modelo relacional rico (alunos, turmas, presenças, faturas, graduação) com tipagem forte via Prisma Client gerado em `src/generated/prisma`.

**Convenções:**

- Toda query escopada por `academyId` via `getOrCreateDefaultAcademy()`.
- Preferir `findFirst({ where: { id, academyId } })` a `findUnique` sem escopo.
- Valores monetários em **centavos** no banco; formatação na query.
- Sempre usar `select` ou `include` explícito — nunca retornar o objeto Prisma inteiro ao cliente.

### 2.4 Better Auth

**Por quê:** autenticação moderna com adapter Prisma, sessões por cookie e suporte a email/senha sem boilerplate excessivo.

**Fluxo:**

1. Login em `/login` (admin), `/professor/login` ou `/aluno/login`.
2. Better Auth valida credenciais e define cookie de sessão.
3. `middleware.ts` verifica cookie nas rotas `/admin`, `/professor` e `/aluno`.
4. Layouts autenticados chamam `requireAdminSession()`, `requireInstructorContext()` ou `requireStudentContext()`.

**Provisionamento de contas de portal:**

- Ao cadastrar aluno ou professor com email, `provision-user-account.ts` cria usuário, senha provisória e envia email (Resend).
- `ensure-portal-links.ts` garante vínculo entre registro (`Student`/`Instructor`) e `User` pelo email.
- Scripts em `scripts/` permitem reparar vínculos e resetar senhas em ambiente de desenvolvimento.

### 2.5 Validação com Zod

**Por quê:** uma única fonte de verdade para entrada de dados, compartilhada entre Server Actions e formulários.

**Padrão:**

```typescript
const parsed = schema.safeParse(input);
if (!parsed.success) {
  return { success: false, message: '...' };
}
```

Tipos derivados com `z.infer<typeof schema>` — nunca duplicar manualmente.

---

## 3. Mapa de módulos

| Módulo | Responsabilidade |
|--------|------------------|
| `students` | CRUD alunos, presença manual, progresso, graduação, status |
| `instructors` | CRUD professores |
| `classes` | Turmas, horários, capacidade, matrículas |
| `graduation-rules` | Regras de promoção por faixa/programa |
| `finance` | Planos, faturas, pagamentos, relatórios |
| `store` | Produtos, categorias, estoque, reservas |
| `warnings` | Avisos/comunicados |
| `analytics` | KPIs, gráficos, heatmap de presença |
| `attendance` | QR check-in, tokens de aluno, registro de sessão |
| `dashboard` | Overview admin, recálculo de progressos |
| `student-portal` | UI e queries do portal do aluno |
| `instructor-portal` | UI e queries do portal do professor |
| `users` | Provisionamento, reparo de acesso, roles |
| `auth` | Formulários de login e menu de usuário |

---

## 4. Fluxos principais

### 4.1 Presença via QR Code

```
Aluno exibe QR (/aluno)
        ↓
Professor escaneia (/professor/qr-code)
        ↓
process-qr-check-in (Server Action)
        ↓
Valida token + sessão da turma + vínculo aluno/turma
        ↓
Registra Attendance + recalcula progresso (quando aplicável)
```

Cada aluno possui um `StudentQrToken` único por academia, gerado/atualizado em `ensure-student-qr-token.ts`.

### 4.2 Progresso de graduação

O progresso combina:

- **Tempo** desde a última promoção (ou entrada na academia);
- **Presenças** e **faltas** desde a data base;
- **Regra de graduação** compatível (adulto/kids, faixa, idade).

Funções em `students/lib/`:

- `calculateStudentProgress()` — calcula e **persiste** (upsert) — usado após mutações.
- `getStudentProgressSnapshot()` — **somente leitura** — usado em pages de visualização.
- `build-journey-heatmap.ts` / `calculate-journey-progress.ts` — heatmap e barra verde no portal do aluno.

### 4.3 Financeiro e inadimplência

- Planos geram assinaturas (`StudentSubscription`) e faturas (`Invoice`).
- Pagamentos registrados via `registerPaymentAction`.
- `sync-student-delinquency-core.ts` alinha status `ACTIVE` ↔ `DELINQUENT` conforme faturas vencidas.

### 4.4 Loja e reservas

- Admin cadastra produtos com estoque.
- Aluno/professor reservam itens; reserva reduz estoque disponível.
- `ensure-store-reservations-released.ts` libera reservas expiradas uma vez por carregamento da page da loja.

---

## 5. Segurança

### Camadas de proteção

| Camada | Mecanismo |
|--------|-----------|
| Middleware | Redireciona rotas protegidas sem cookie de sessão |
| Layout admin | `requireAdminSession()` — valida roles ADMIN_* |
| Layout professor | `requireInstructorContext()` — role INSTRUCTOR + registro ativo |
| Layout aluno | `requireStudentContext()` — role STUDENT + registro |
| Server Actions admin | `assertAdminAction()` no início de cada action |

### Boas práticas implementadas

- Nenhum `academyId` hardcoded — sempre `getOrCreateDefaultAcademy()`.
- Queries com escopo `{ id, academyId }`.
- Sem `any` em TypeScript.
- Feedback ao usuário via Sonner (toast), nunca `alert()`.
- Mutações com `useTransition` nos Client Components.

---

## 6. Modelo de dados (visão resumida)

Entidades centrais no Prisma:

- **Academy** — tenant único (single-academy por instância).
- **User** + **UserRoleAssignment** — autenticação e papéis.
- **Student** / **Instructor** — perfis operacionais vinculados a `User`.
- **Class** / **ClassSchedule** / **ClassSession** — turmas e aulas.
- **Attendance** — presença por sessão.
- **GraduationRule** / **StudentProgress** / **StudentBeltStatus** — graduação.
- **Plan** / **Invoice** / **Payment** — financeiro.
- **StoreProduct** / **StoreReservation** — loja.
- **Warning** / **WarningRead** — avisos.

Enums importantes: `AppRole`, `StudentStatus`, `ProgressStatus`, `GraduationProgram`, `InvoiceStatus`.

Schema completo: `prisma/schema.prisma`.

---

## 7. UI e design system

- **Dark mode exclusivo** — nunca light mode.
- Paleta: zinc (fundos), red (acento), emerald (positivo), amber (alerta).
- Cards: `rounded-2xl border border-white/10 bg-zinc-950 p-5`.
- Tabelas: grid customizado (não shadcn Table) com header `bg-zinc-900`.
- Sidebars: shadcn Sidebar com hover alinhado entre os três portais.

Componentes globais em `src/components/`; componentes de domínio em `src/modules/*/components/`.

---

## 8. Convenções de código

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Arquivo | kebab-case | `create-class-complete.ts` |
| Componente | PascalCase | `ClassCreateForm` |
| Query | camelCase + get | `getClassById` |
| Action | camelCase + Action | `createClassCompleteAction` |
| Schema | camelCase + Schema | `createClassCompleteSchema` |

### Server Action (template)

```typescript
'use server';

export async function exampleAction(input: unknown): Promise<{ success: boolean; message: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: '...' };

  const auth = await assertAdminAction(); // quando admin
  if (!auth.success) return { success: false, message: auth.message };

  try {
    const academy = await getOrCreateDefaultAcademy();
    // ... mutação
    revalidatePath('/admin/...');
    return { success: true, message: '...' };
  } catch (error) {
    console.error('exampleAction error', error);
    return { success: false, message: '...' };
  }
}
```

### Client Component com formulário

- `'use client'` na primeira linha.
- `useTransition` para loading (nunca `useState` para pending).
- `toast` do Sonner para feedback.
- Após sucesso com redirect: `router.push` + `router.refresh()` (~400ms).

---

## 9. Ambientes e deploy

### Desenvolvimento

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Produção (Vercel)

1. Variáveis de ambiente configuradas no painel (ver `.env.example`).
2. `postinstall` roda `prisma generate` (client não versionado — `.gitignore`).
3. `npm run build` valida TypeScript e gera páginas estáticas/dinâmicas.
4. Migrations aplicadas com `npx prisma migrate deploy` no banco de produção.

### URLs críticas em produção

- `BETTER_AUTH_URL` deve ser a URL pública exata (inclui https).
- `NEXT_PUBLIC_APP_URL` idem, para links em emails e QR.

---

## 10. Evolução e manutenção

### Ordem recomendada ao criar feature

1. `types/` → 2. `schemas/` → 3. `queries/` → 4. `actions/` → 5. `components/` → 6. `page.tsx`

### Ao alterar schema Prisma

```bash
npx prisma migrate dev --name descricao_da_mudanca
npx prisma generate
npm run typecheck
```

### Scripts úteis

| Script | Uso |
|--------|-----|
| `scripts/repair-portal-access.ts` | Vincula alunos/professores sem `userId` e garante roles |
| `scripts/reset-portal-password.ts <email>` | Redefine senha e imprime no terminal |
| `scripts/debug-user-access.ts` | Inspeciona roles e vínculos de um email |

---

## 11. Referências internas

Arquivos que exemplificam os padrões do projeto:

| Padrão | Arquivo de referência |
|--------|----------------------|
| Page Server Component | `src/app/(admin)/admin/financeiro/page.tsx` |
| Client form | `src/modules/classes/components/class-create-form.tsx` |
| Server Action | `src/modules/classes/actions/create-class-complete.ts` |
| Query function | `src/modules/classes/queries/get-class-by-id.ts` |
| Types | `src/modules/finance/types/finance-summary.ts` |

Regras completas do projeto: `.cursor/rules/projeto.mdc`.

---

## 12. Glossário

| Termo | Significado |
|-------|-------------|
| Portal | Interface isolada (admin, professor ou aluno) |
| Academy | Instituição/tenant — hoje single-academy |
| Progress snapshot | Leitura de progresso sem escrita no banco |
| Delinquency sync | Atualização automática ACTIVE ↔ DELINQUENT |
| QR token | Identificador único do aluno para check-in |

---

*Documento mantido junto ao código em `docs/DOCUMENTACAO-TECNICA.md`. Atualize sempre que houver mudança estrutural relevante.*
