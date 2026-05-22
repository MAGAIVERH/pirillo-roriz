# Guia de status do aluno (`StudentStatus`)

Glossário canônico de como cada valor de `StudentStatus` deve ser interpretado e usado no sistema.

| Status | Quando aplicar | Quem atualiza | Conta como ativo? |
|---|---|---|---|
| `LEAD` | Lead que ainda não fez trial nem se matriculou. | Admin/recepção ao cadastrar contato. | ❌ |
| `TRIAL` | Aluno em aula experimental. | Admin ao agendar/registrar trial. | ❌ |
| `ACTIVE` | Matriculado e em dia com financeiro. | Admin ao confirmar matrícula. | ✅ |
| `FROZEN` | Pausa temporária com previsão de retorno (lesão, viagem, etc). | Admin via modal "Alterar status". | ❌ |
| `INACTIVE` | Parou de treinar há tempo, sem cancelamento formal. | Admin via modal "Alterar status". | ❌ |
| `CANCELED` | Saída definitiva. **Exige motivo** (`CancellationReason`). | Admin via modal "Alterar status". | ❌ |
| `DELINQUENT` | Estaria ativo, mas tem fatura em atraso. | **Automático** via `syncStudentDelinquencyStatus`. | ⚠️ (conta como ativo na operação, mas alerta financeiro) |

## Regras automáticas

- Aluno `ACTIVE` com qualquer `Invoice.status = OVERDUE` → vira `DELINQUENT`.
- Aluno `DELINQUENT` sem nenhuma fatura `OVERDUE` → volta para `ACTIVE`.
- Toda transição é registrada em `StudentStatusHistory` (com `fromStatus`, `toStatus`, `reasonId?`, `notes?`, `changedByUserId?`).
- Quando o sistema muda automaticamente, `changedByUserId = null` e `notes` indica a causa (ex: "Atualização automática por fatura vencida.").

## Onde a sincronização acontece

- `registerPaymentAction` → roda `syncStudentDelinquencyStatus(studentId)` ao final.
- `getDashboardOverview` → roda `syncStudentDelinquencyStatus()` global antes de apurar métricas.
- Botão **"Recalcular progressos"** no dashboard → roda só recálculo de graduação (não mexe em inadimplência).

## Mudança manual

Sempre via `updateStudentStatusAction`, que:

1. Lê o status atual.
2. Valida que o novo status é diferente.
3. Se for `CANCELED`, exige `reasonId` válido.
4. Cria `StudentStatusHistory` e atualiza `Student.status` em sequência.
5. Revalida `/admin`, `/admin/alunos`, `/admin/alunos/[id]` e `/admin/analytics`.

## Métricas que dependem deste glossário

- **Cancelamentos do mês** (Analytics + Comparativo): conta `StudentStatusHistory.toStatus IN (CANCELED, INACTIVE)` no período.
- **Funil de aquisição**: `toStatus = LEAD` (entrada) → `toStatus IN (TRIAL, ACTIVE)` (trial) → `toStatus = ACTIVE` (matricula).
- **Inadimplência (R$ e %)**: somatório de faturas `OVERDUE` — independente do `Student.status`.
- **Alunos ativos**: `Student.status IN (ACTIVE, DELINQUENT)` é uma decisão consciente — inadimplente ainda treina.
