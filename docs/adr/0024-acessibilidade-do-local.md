# ADR-0024: Acessibilidade do local do evento (item 2.5 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-21
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 2, item 2.5 (ERS 2.0: RF-69). Temas 7 e 9 da rodada 2. Terceiro da ordem que sobrou na simulação da tesoureira (`docs/simulacoes/2026-11-20/relatorio.md`), com a condição dela: vazio mostra "não informado", nunca "não tem".

## Contexto

- Nos temas 7 e 9, a avó cadeirante e o pai com mobilidade reduzida não sabiam se o local tinha rampa. A resposta estava, quando estava, nas observações do local, texto livre.
- A ADR-0019 criou o campo "Entrada" e deixou a acessibilidade para o Nível 2.
- A tesoureira sintética usaria só se o campo vazio aparecesse como "não informado": um "não" que ninguém conferiu leva alguém a desistir de ir, e um "sim" que ninguém conferiu leva alguém a chegar e não entrar.

## Decisão

### 1. Três perguntas fechadas e uma observação

```sql
alter table turmas add column if not exists acess_rampa boolean;           -- nulo = não informado
alter table turmas add column if not exists acess_estacionamento boolean;
alter table turmas add column if not exists acess_banheiro boolean;
alter table turmas add column if not exists acess_obs varchar(200);
```

- Rampa ou entrada sem degrau.
- Estacionamento perto da entrada.
- Banheiro adaptado.

Cada uma com "Não informado" (o padrão), "Sim" ou "Não". Colunas próprias, em vez do `jsonb` sugerido no levantamento: são poucas, fixas, e ficam mais simples de ler e de validar.

### 2. Onde aparece

No dashboard e na página pública do evento, abaixo do local, sempre em texto (não só ícone), para o leitor de tela:

- Com pelo menos uma resposta: as três linhas ("Rampa ou entrada sem degrau: sim", "… : não informado") e a observação.
- Sem nenhuma resposta: uma linha só, "Acessibilidade do local: não informada. Pergunte à comissão."

### 3. Fora desta ADR

- Não entra no "Mudou" nem no email de mudança (decisão do levantamento para o primeiro corte).
- Não entra na lista da portaria.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Caixa de marcar ("tem rampa") | Desmarcado vira "não tem" sem ninguém ter conferido. É o erro que a tesoureira apontou. |
| Só texto livre | É como está hoje, nas observações; ninguém acha. |
| `jsonb` com as chaves | Três colunas fixas são mais simples; o `jsonb` só valeria se a lista mudasse por turma. |

## Consequências

**Fica melhor**
- A família sabe se pode ir sem ligar para alguém da comissão, ou sabe que precisa perguntar.

**Fica pior ou mais difícil**
- Mais quatro campos no formulário do evento.
- Uma resposta desatualizada continua sendo um risco: o site não sabe se alguém conferiu.

**Arquivos**
- `db/schema.sql`; `src/lib/acessibilidade.ts` (regras e textos, com teste); `src/actions/evento.ts`; `evento-admin.tsx`; `src/lib/dashboard.ts`, `src/lib/admin.ts`, `src/lib/evento-publico.ts`; o dashboard e a página pública.

**Teste de fluxo**
- Unitário: leitura do formulário e textos, inclusive "não informado".
- E2E: sem respostas, a página pública diz "não informada"; a comissão marca rampa "sim" e banheiro "não"; dashboard e página pública mostram as três linhas, com o estacionamento "não informado".

### Andamento (2026-11-21)

Feita. Diferenças em relação ao texto acima:

- **Formulário:** as três perguntas e a observação ficam num bloco próprio ("Acessibilidade do local") dentro de "Editar dados do evento", com o aviso "Só marque Sim ou Não se alguém conferiu".
- **No dashboard**, o bloco fica abaixo dos dados do evento, numa caixa própria; na página pública, abaixo da lista de dados e antes da descrição.
- **Mudar a acessibilidade atualiza o "Atualizado em"** da página pública (`evento_atualizado_em`), mas não gera "Mudou", email nem auditoria.
- Testes: `typecheck`, `npm test` (364; 5 novos em `acessibilidade.test.ts`). Passo novo "ADR-0024" no grupo `admin` de `fluxos.mjs`: sem resposta, a página pública diz "não informada"; a comissão marca rampa "sim" e banheiro "não"; o estacionamento fica nulo no banco; nada entra no "Mudou"; dashboard e página pública mostram as três linhas e a observação. Bloco `participante,app,admin` no Docker, 72 de 72 (a primeira rodada falhou só na conferência do teste, que lia o booleano como `t`/`f`).
