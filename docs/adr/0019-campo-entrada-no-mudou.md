# ADR-0019: Campo "Entrada" no "Mudou" (item 1.2 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-16
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 1, item 1.2 (ERS 2.0: RF-57). Temas 7 e 9 da rodada 2. Depende do item 1 da ADR-0017 para chegar ao texto do grupo.

## Contexto

### O que as simulações dizem

- **Troca de portão não chega a ninguém.** Sem alguém da turma avisar direto, 0 de 8 pessoas da família ficariam sabendo da troca (tema 9). Entre os formandos, foram 4 de 8 (tema 7).
- O portão estava nas observações do local, que não entram no "Mudou".

### O que já existe

- `mudancasEvento` (`src/lib/lembretes-regras.ts`) compara só data e horário (`inicio`), `local` e `endereco`, pelo tipo `EstadoEvento`.
- As observações do local (`turmas.observacoes_local`) são texto livre e ficam fora da comparação.
- `salvarEvento` (`src/actions/evento.ts`) grava a auditoria `evento.alterado` com as mudanças calculadas.
- O "Mudou em" (dashboard e página pública) e o email "Mudou" (`emailEventoMudou`) já mostram qualquer item que `mudancasEvento` devolver.
- A lista da portaria (ADR-0013) é impressa pela comissão.

### Forças em jogo

- **O aviso de mudança só vale se for raro e certo.** Se qualquer vírgula virar "mudou", ninguém lê.
- **A entrada é o que a família precisa na noite do evento.**

## Decisão

### 1. Campo próprio "Entrada / portão"

```sql
alter table turmas add column if not exists entrada varchar(120);  -- nulo = não informado
```

- Campo no formulário do evento, com até 120 caracteres e a dica "Ex.: Portão 2, pela Rua X".
- `EstadoEvento` e `mudancasEvento` ganham `entrada`, com o rótulo "entrada".

### 2. Onde a entrada aparece

- No card do evento e na página pública, logo abaixo de "Onde".
- Na lista da portaria, no topo.

### 3. Onde a mudança aparece

Quando a entrada muda, sem código novo além do item 1:
- no "Mudou em" do card e da página pública;
- no email "Mudou";
- no texto do grupo (pela ADR-0017, item 1).

Preencher a entrada pela primeira vez (de vazio para algo) **não** conta como mudança. Trocar ou apagar conta.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Comparar as observações do local inteiras | Texto livre: qualquer vírgula alterada viraria "mudou", e o aviso perderia valor. |
| Destacar as observações quando mudam, sem dizer o quê | A pessoa vê "mudou" e não sabe o que procurar. |
| Campos de acessibilidade (rampa, estacionamento, banheiro) junto | É o item 2.5, do Nível 2. Fica para depois da validação com turmas reais. |

## Consequências

**Fica melhor**
- Troca de portão passa a ser avisada como troca de horário.
- A família vê a entrada na página pública, sem abrir as observações.

**Fica pior ou mais difícil**
- Um campo a mais no formulário do evento.
- Turmas antigas ficam com a entrada vazia até a comissão preencher. Preencher pela primeira vez **não** conta como mudança (de vazio para algo), mesmo com o evento já divulgado. Decidido pelo grupo em 16/11/2026.

**Arquivos**
- `db/schema.sql`.
- `src/lib/lembretes-regras.ts` (`EstadoEvento`, `mudancasEvento`) e o teste dela.
- `src/actions/evento.ts` (`salvarEvento`).
- O formulário do evento, o card do evento, a página pública e a lista da portaria.

**Teste de fluxo**
- Casos novos no teste de `mudancasEvento`: entrada trocada, entrada preenchida pela primeira vez (não conta) e entrada apagada.
- Passo no E2E: trocar a entrada e conferir o "Mudou em" e o email no Mailpit.
