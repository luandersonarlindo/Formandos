# ADR-0026: Valor por acompanhante

**Status:** Aceito
**Data:** 2026-11-22
**Decisores:** grupo do Formandos (dono do produto)
**Origem:** pedido do dono, item 3.1 dos ajustes depois do plano de UX: "Seria interessante colocar valor por acompanhante?". Na escolha entre só mostrar o valor, mostrar e cobrar pela Tesouraria, ou deixar para depois, ele escolheu mostrar e cobrar.

## Contexto

- A turma já sabe quantos acompanhantes cada formando leva (presença, ADR-0013), mas o custo deles (buffet e espaço) era combinado fora do site.
- A Tesouraria (ADR-0005) calcula a situação de cada formando só a partir das parcelas do plano, que são iguais para todos.
- Um valor por acompanhante faz o total devido variar de pessoa para pessoa, de acordo com a resposta de presença.

## Decisão

1. **Configuração da tesouraria.** Duas colunas em `turmas`:
   - `valor_acompanhante numeric(10,2)`: nulo quer dizer que a turma não cobra.
   - `vencimento_acompanhante date`: opcional.

   Elas são editadas em Tesouraria › Plano e regras, no card "Acompanhantes", e só a tesouraria pode mudar, como o plano. Cada mudança grava `plano.acompanhante` na auditoria. Essa ação é visível à turma e aparece em "Mudanças no plano" e no histórico.
2. **Item a mais na situação.** Para quem respondeu "vou" com N acompanhantes, a situação ganha o item "Acompanhantes (N × R$ X)", no valor de N × X (`itemAcompanhantes` e `planoDaPessoa` em `src/lib/situacao-regras.ts`).
   - **Vencimento:** a data escolhida; sem ela, a última parcela do plano; sem plano, o dia do evento (ou hoje).
   - **Ordem:** o item entra na mesma fila por vencimento das parcelas, então o que a pessoa paga cobre primeiro o que vence antes. Empatado com a última parcela, ele vem depois dela.
   - **Efeito:** o item entra no total devido, no atraso, na próxima cobrança do Início e na lista da tesouraria.
3. **A conta acompanha a resposta.** Se a pessoa muda a presença (mais ou menos acompanhantes, ou deixa de ir), o item muda junto. Nada é gravado como dívida: a situação é sempre calculada na hora, como já era.
4. **Onde aparece:**
   - Ao confirmar presença: "2 × R$ 80,00 = R$ 160,00, que entram em Minha situação".
   - Em Minha situação: o item na lista de parcelas.
   - Na Presença da comissão: o total da turma ("Acompanhantes a pagar"). É só uma soma; os outros admins continuam sem ver o valor de cada pessoa (ADR-0005).
5. **Fora desta ADR:** o lembrete de parcela por email (ADR-0006) continua só com as parcelas do plano.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Só informativo (sem entrar na situação) | O dono quis que o valor entrasse na conta de cada um. |
| Gravar uma "parcela" por pessoa no banco | Teria de ser refeita a cada mudança de presença; calcular na hora mantém uma fonte só (a resposta de presença). |
| Valor diferente para criança | Fica para quando uma tesoureira real pedir; hoje a presença já separa adulto e criança e dá para estender. |

## Consequências

**Fica melhor**
- Cada formando vê quanto deve pelos próprios acompanhantes, sem conta à parte.
- A comissão sabe quanto vai entrar com os acompanhantes antes de fechar o buffet.

**Fica pior ou mais difícil**
- O total devido muda quando a pessoa muda a presença. Se ela já pagou e depois tira acompanhantes, o que sobrar aparece como "adiantado" e a devolução segue as regras do dinheiro da turma.
- Bancos existentes precisam receber as duas colunas (`npm run db:schema`).

**Arquivos**
- `db/schema.sql`, `src/lib/situacao-regras.ts` (+ testes), `src/lib/pagamentos.ts`, `src/actions/tesouraria.ts` (`salvarCobrancaAcompanhante`), `src/lib/auditoria-acoes.ts`, `src/lib/historico-texto.ts`, `src/components/features/mudancas-plano.tsx`, `src/components/features/form-presenca.tsx`, `src/lib/dal.ts`.
- Telas: `/admin/tesouraria/plano`, `/admin/presenca`, `/minha-situacao`, `/admin/tesouraria/[usuarioId]` e Início.
