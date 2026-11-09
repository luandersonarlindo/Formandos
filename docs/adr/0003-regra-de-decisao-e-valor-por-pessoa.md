# ADR-0003: Regra para fixar decisão e valor por pessoa em cada opção (itens 1.2 e 1.3)

**Status:** Aceito
**Data:** 2026-11-08
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, itens 1.2 (achados K e D: simulações 1, 2, 3, 6, 7, 8, 9 e 10) e 1.3 (achado J: simulações 5, 6, 7 e 10). Na simulação 10, a regra de decisão foi **o maior ganho** e o valor por pessoa **decidiu a votação**.

## Contexto

### Como a decisão funciona hoje

- A comissão abre `/admin/votacoes/votos/[enqueteId]`, que já mostra "X de Y membros votaram", quem votou em cada opção e "Ainda não votaram" (`getVotosEnquete` em `src/lib/admin.ts`).
- `fixarDecisao` (`src/actions/decisoes.ts`) grava em `decisoes (turma_id, enquete_id, opcao_id, decidido_por, created_at)` **qualquer** opção, mesmo com 0 votos, sem prazo, sem quórum e sem explicar o motivo. A trava `pg_advisory_xact_lock` impede duas decisões ao mesmo tempo.
- Com decisão gravada, `salvarVotos` (`src/actions/votos.ts`) ignora a pergunta e `enquete-card.tsx` mostra "A comissão já decidiu esta pergunta".
- `reabrirVotacao` **apaga** as linhas de `decisoes`. Não sobra registro de que houve uma decisão, de quando foi tomada nem de quem a tomou.
- A turma vê as decisões em "Decisões da turma" no dashboard (`listarDecisoes` em `src/lib/dashboard.ts`), sem números.
- A `auditoria` (`src/lib/auditoria.ts`) tem vocabulário fechado com 6 ações. Nenhuma delas é sobre decisões, e a turma não lê essa tabela (só aparece no "baixar meus dados" de `/conta`).

### Como as opções funcionam hoje

- `opcoes (id, enquete_id, texto, exclusiva, ordem)` não tem valor nem link.
- O catálogo padrão é **global** (`catalogos.turma_id is null`) e somente leitura. As perguntas dele são de preferência ("Qual formato de comemoração?", "Quais ritmos?"), não escolhas entre fornecedores com preço.
- As perguntas com preço ("Buffet A ou B?") são criadas pela comissão no catálogo da própria turma (`adicionarEnquete` e `atualizarEnquete` em `src/actions/catalogos.ts`, com o editor `editor-opcoes.tsx`). Os modelos por tipo de turma (`criarCatalogoDeModelo`) também viram catálogo da turma.
- `formatarReal` e `lerValorOrcado` (`src/lib/orcamento.ts`) já tratam valores em reais. `ehLinkHttps` (`src/lib/evento.ts`) já valida links. Datas usam o fuso `America/Sao_Paulo` (`src/lib/datas.ts`, `src/actions/evento.ts`).

### Forças em jogo

- **Confiança:** nas simulações 3, 6 e 10, a turma aceitou a decisão quando havia uma regra combinada antes e números visíveis. Recusou quando "a comissão escolheu".
- **Liberdade da comissão:** às vezes a opção mais votada não pode ser contratada (o fornecedor sumiu ou o preço subiu). A comissão precisa poder decidir fora da regra, **desde que explique**.
- **Prova:** a decisão não pode sumir quando alguém sai da turma ou quando a votação é reaberta (achados D e M).
- **Sem agendador:** o projeto não tem cron (`levantamento.md`, seção 11). O prazo precisa funcionar sem tarefa agendada.
- **Catálogo padrão compartilhado:** o que vale para uma turma não pode vazar para outra.

## Decisão

### 1. Regra da pergunta: tabela `regras_enquete`, por turma

```sql
create table if not exists regras_enquete (
  turma_id   uuid not null references turmas(id) on delete cascade,
  enquete_id uuid not null references enquetes(id) on delete cascade,
  prazo      timestamptz,                                         -- nulo = sem prazo
  quorum_pct smallint check (quorum_pct between 1 and 100),       -- nulo = sem quórum
  updated_at timestamptz not null default now(),
  primary key (turma_id, enquete_id)
);
```

- A regra fica numa tabela por turma, e não em `enquetes`, porque as perguntas do catálogo padrão são compartilhadas. Assim a mesma tabela serve às perguntas do padrão e às da turma.
- A comissão define prazo (data e hora, no fuso `America/Sao_Paulo`) e quórum (percentual dos membros) na tela da pergunta. Os dois são opcionais. Sem linha em `regras_enquete`, a pergunta não tem prazo nem quórum.
- **Mudar a regra depois que a votação começou é permitido, mas fica no histórico** (ação `regra.alterada`, item 4). Mudança sem registro visível é o achado D, que se repetiu em 7 das 10 simulações.

### 2. Prazo sem agendador

- Regra pura `votacaoEncerrada({ prazo, decidida, agora })` em `src/lib/votos-regras.ts` (o arquivo já existe, com teste).
- `salvarVotos` recusa voto em pergunta com prazo vencido, do mesmo jeito que já ignora pergunta decidida. A tela calcula "encerrada" na hora de ler. Ninguém precisa "fechar" a votação.
- Prazo vencido **não fixa sozinho**. A comissão continua fixando, e a regra do item 3 diz se foi dentro ou fora do combinado.

### 3. Quando a comissão fixa: dentro ou fora da regra

Função pura `avaliarDecisao(...)` em um arquivo novo, `src/lib/decisao-regras.ts`, com teste. Ela recebe a contagem por opção, as opções escolhidas, votantes, membros, a regra e a hora atual. Devolve a lista de motivos pelos quais a decisão foge da regra. Lista vazia significa decisão dentro da regra.

| Motivo | Quando |
|---|---|
| `nao_mais_votada` | Escolha única: a opção fixada tem menos votos que outra. Múltipla: alguma opção fixada tem menos votos que uma opção que ficou de fora. |
| `empate` | A opção fixada está empatada com outra que ficou de fora. A comissão desempatou, e a turma precisa saber o critério. |
| `sem_quorum` | Existe quórum e `votantes / membros` ficou abaixo dele. |
| `antes_do_prazo` | Existe prazo, ele ainda não venceu e nem todos os membros votaram. |
| `sem_votos` | Ninguém votou. |

- Com qualquer motivo, a **justificativa é obrigatória** (de 10 a 500 caracteres). `fixarDecisao` devolve erro sem ela, e o diálogo explica o porquê ("A opção escolhida não é a mais votada. Escreva para a turma o motivo.").
- Dentro da regra, a justificativa é opcional.
- `membros` conta todos os membros da turma no momento, incluindo a comissão (a mesma conta que `/admin/votacoes/votos/[enqueteId]` já faz).

### 4. Fotografia e histórico: colunas em `decisoes` + `auditoria`

```sql
alter table decisoes add column if not exists justificativa text;
alter table decisoes add column if not exists votantes      smallint;
alter table decisoes add column if not exists membros       smallint;
alter table decisoes add column if not exists fora_da_regra text[] not null default '{}';
```

- `decisoes` guarda o **estado atual** e uma fotografia dos números do dia em que a decisão foi fixada. Os valores se repetem nas linhas da mesma pergunta (uma linha por opção fixada). Isso é aceitável: são poucas linhas, gravadas todas de uma vez dentro da mesma transação.
- A `auditoria` guarda o **histórico**, que não se apaga. O vocabulário de `AcaoAuditoria` ganha 3 ações:
  - `decisao.fixada`: `detalhe` leva a pergunta, os textos das opções fixadas, a contagem por opção (texto e votos), votantes, membros, motivos fora da regra e justificativa.
  - `decisao.reaberta`: `detalhe` leva a pergunta e as opções que estavam fixadas.
  - `regra.alterada`: `detalhe` leva o prazo e o quórum, antes e depois.
- O `detalhe` guarda **textos**, não só ids, porque a opção pode ser renomeada ou apagada depois.
- `reabrirVotacao` continua apagando as linhas de `decisoes` (é o que reabre os votos), mas antes grava `decisao.reaberta`.
- Nova leitura `listarHistoricoDecisoes(turmaId, enqueteId?)` em `src/lib/auditoria.ts`, filtrando `acao in ('decisao.fixada', 'decisao.reaberta', 'regra.alterada')`. **Só essas ações** ficam visíveis para a turma. As outras (papel trocado, membro removido, conta excluída) continuam restritas.
- Quem fez aparece pelo nome. Se a pessoa excluiu a conta, `usuario_id` vira nulo (`on delete set null`) e a tela mostra "ex-membro da comissão".

### 5. Valor por pessoa e link: colunas em `opcoes`, só em perguntas da turma

```sql
alter table opcoes add column if not exists valor_pessoa numeric(10,2) check (valor_pessoa >= 0);
alter table opcoes add column if not exists link         varchar(500);
```

- O valor é **por pessoa**, em reais, e opcional. O link é opcional e precisa ser `https://` (`ehLinkHttps`). Ele serve para o cardápio ou a página do fornecedor.
- **Só em perguntas do catálogo da turma.** As perguntas do catálogo padrão são de preferência e são compartilhadas. Um valor numa opção dela apareceria para todas as turmas. Quem quer preço numa pergunta do padrão cria a pergunta no catálogo da turma.
- `atualizarEnquete` aceita mudar o valor mesmo com votos, mas grava `opcao.valor_alterado` na `auditoria` (valor antes e depois) quando a pergunta já tem votos. O card mostra "valor alterado em 12/11" ao lado do preço. Mudar o preço sem avisar foi a reclamação da simulação 7.
- **Não ligar ainda a `fornecedores.valor_orcado`.** São números diferentes (total orçado × valor por pessoa). Fica como evolução possível (ver Consequências).

### 6. Telas

- **Comissão, editar pergunta** (`form-enquete.tsx`, `dialogo-nova-pergunta.tsx`, `editor-opcoes.tsx`): campos "Prazo" (`datetime-local`) e "Quórum mínimo (%)" na pergunta. Em cada opção, "Valor por pessoa (R$)" e "Link", recolhidos em "Mais detalhes" para não poluir a lista.
- **Comissão, regra de pergunta do padrão:** os campos de prazo e quórum também aparecem em `/admin/votacoes/[catalogoId]` para perguntas do padrão (sem os campos de valor). Action nova `salvarRegraEnquete` em `src/actions/catalogos.ts`.
- **Comissão, fixar** (`/admin/votacoes/votos/[enqueteId]`): o diálogo (`FormDialog`) mostra o resultado e os motivos fora da regra **antes** de confirmar. A justificativa aparece e passa a ser obrigatória só quando há motivo.
- **Turma, votar** (`enquete-card.tsx`): selo "fecha em 12/12 às 23h59", "precisa de 50% da turma" e barra `Progress` "22 de 38 votaram". Abaixo de cada opção, "R$ 95 por pessoa" em `tabular-nums` (`formatarReal`) e o link "ver cardápio". Prazo vencido mostra "Votação encerrada em 12/12", e o formulário fica desabilitado como já acontece com pergunta decidida.
- **Turma, decisões** (card "Decisões da turma" em `dashboard/page.tsx` e `listarDecisoes`): "votaram 22 de 38", selo "mais votada" ou "fixada fora da regra" com a justificativa, e "ver histórico" (`PainelRecolhivel`) com as linhas de `listarHistoricoDecisoes`.

## Opções consideradas

### Onde guardar a regra

| Opção | Prós | Contras |
|---|---|---|
| A. Colunas em `enquetes` (`prazo`, `quorum_pct`) | uma tabela a menos | não funciona no catálogo padrão (global): o prazo de uma turma valeria para todas |
| **B. Tabela `regras_enquete (turma_id, enquete_id)` (escolhida)** | serve aos dois catálogos; isolada por turma | uma junção a mais nas leituras de votação |
| C. Regra por catálogo inteiro | menos campos para a comissão | perguntas do mesmo catálogo fecham em datas diferentes (local antes de buffet), e as simulações pediram prazo por pergunta |

### Onde guardar o histórico e a fotografia

| Opção | Prós | Contras |
|---|---|---|
| A. Só colunas em `decisoes` | leitura simples | `reabrirVotacao` apaga as linhas, e o histórico some junto |
| B. Tabela nova `historico_decisoes` | consulta direta | duplica o papel da `auditoria`, contra o mapa de reaproveitamento do levantamento (seção 8) |
| **C. Colunas em `decisoes` (estado atual) + `auditoria` (histórico) (escolhida)** | reaproveita a trilha que já existe e não pode ser editada; o estado atual continua barato de ler | a turma passa a ler uma parte da `auditoria`, então o filtro por ação precisa ser fechado e testado |
| D. Mudar `decisoes` para guardar várias versões (`ativa boolean`) | histórico na mesma tabela | muda a chave primária e todas as consultas que hoje leem `decisoes` (votacoes, dashboard, relatório, admin) |

### Onde guardar o valor por pessoa

| Opção | Prós | Contras |
|---|---|---|
| **A. Colunas em `opcoes`, só para perguntas da turma (escolhida)** | simples; cobre o caso das simulações ("Buffet A ou B") | perguntas do padrão ficam sem valor |
| B. Tabela `opcoes_turma (turma_id, opcao_id, valor_pessoa, link)` | valor também no padrão | mais uma junção em toda leitura de opção para um caso que as simulações não pediram |

### Fechar a votação no prazo

| Opção | Prós | Contras |
|---|---|---|
| **A. Recusar voto depois do prazo e calcular "encerrada" na leitura (escolhida)** | sem infraestrutura nova | a decisão continua sendo um ato da comissão |
| B. Agendador que fixa a mais votada no prazo | turma não depende da comissão | precisa de cron (item 1.6); fixar sozinho em empate ou sem quórum é pior do que esperar a comissão |

## Análise de trade-offs

O ponto central é **não proibir a comissão de decidir fora da regra, e sim tornar isso visível**. Proibir travaria casos reais (fornecedor que desistiu). Deixar como hoje foi o que as simulações reprovaram. Por isso a regra é uma função pura que só classifica, a justificativa é exigida só quando há motivo e tudo vai para um histórico que a turma lê.

Usar a `auditoria` como histórico custa abrir uma parte dela para a turma. O risco é mostrar ações que não deveriam ser vistas. A mitigação é uma lista fechada de ações na consulta (`listarHistoricoDecisoes`) com teste, e o `detalhe` dessas 3 ações nunca leva email nem dado de quem votou em quê. Ele leva só contagens, o que a turma já vê no relatório.

Deixar o valor só em perguntas da turma é o corte mais simples que resolve o caso das simulações. Se aparecer a necessidade no padrão, a opção B da tabela acima entra sem mudar as colunas já criadas: o valor da turma passaria a ter prioridade.

## Consequências

- **Fica mais fácil:** a turma aceita a decisão porque vê a regra antes e os números depois; a comissão para de responder "quem decidiu isso?"; o voto passa a mostrar o custo de cada opção.
- **Fica mais fácil também:** os itens 2.4 (congelar o resultado) e 2.5 (histórico visível) já começam aqui. A fotografia em `decisoes` e o `detalhe` da auditoria guardam os números do dia, mesmo que alguém saia da turma depois.
- **Fica mais difícil:** o diálogo de fixar ganha estados (dentro ou fora da regra) e a tela de votar ganha informação. É preciso cuidar para o card não ficar carregado no celular.
- **Fica mais difícil também:** a `auditoria` deixa de ser só para o master e para o "baixar meus dados". Qualquer ação nova no vocabulário precisa decidir se é visível para a turma.
- **Rever depois:** aviso de "fecha em 2 dias" (depende do agendador do item 1.6); botão "Copiar para o WhatsApp" na decisão (item 1.4, que pode usar a justificativa no texto); ligar `valor_pessoa` × presença confirmada ao orçamento de `fornecedores` (estimativa "R$ 95 × 120 pessoas"); voto secreto (item 3.7), que muda o que a comissão vê, mas não esta regra.

## Ações

1. [ ] **Backup antes** (`pg_dump` do banco do Docker). Depois, `db/schema.sql`: tabela `regras_enquete`; colunas `justificativa`, `votantes`, `membros` e `fora_da_regra` em `decisoes`; colunas `valor_pessoa` e `link` em `opcoes`. Tudo com `if not exists`.
2. [ ] `src/lib/decisao-regras.ts` (novo): `avaliarDecisao(...)`, com teste para mais votada, empate, múltipla, sem quórum, antes do prazo com e sem todos os votos, sem votos e sem regra.
3. [ ] `src/lib/votos-regras.ts`: `votacaoEncerrada(...)`, com teste (sem prazo, antes, depois, decidida).
4. [ ] `src/lib/auditoria.ts`: ações `decisao.fixada`, `decisao.reaberta`, `regra.alterada` e `opcao.valor_alterado`; leitura `listarHistoricoDecisoes` com lista fechada de ações e teste.
5. [ ] `src/actions/decisoes.ts`: `fixarDecisao` conta votos e membros na mesma transação, aplica `avaliarDecisao`, exige justificativa, grava a fotografia e registra `decisao.fixada`; `reabrirVotacao` registra `decisao.reaberta` antes de apagar.
6. [ ] `src/actions/votos.ts`: `salvarVotos` lê `regras_enquete` e recusa pergunta encerrada pelo prazo.
7. [ ] `src/actions/catalogos.ts`: `salvarRegraEnquete` (perguntas do padrão e da turma, com `regra.alterada`); `adicionarEnquete` e `atualizarEnquete` aceitam `valor-<id>` e `link-<id>` só em catálogo da turma, com `lerValorOrcado` e `ehLinkHttps`, e registram `opcao.valor_alterado` quando já há votos.
8. [ ] Leituras: `src/lib/votacoes.ts` (regra, valor, link e "encerrada"), `src/lib/admin.ts` (`getVotosEnquete` com regra e contagem para o diálogo), `src/lib/dashboard.ts` (`listarDecisoes` com números, selo e justificativa).
9. [ ] Telas listadas na Decisão, item 6. Textos do diálogo de fixar e dos selos revisados com `design:ux-copy`.
10. [ ] `src/lib/usuarios.ts` (`getMeusDados`): conferir se as novas ações da `auditoria` feitas pela pessoa entram no "baixar meus dados" (a consulta por `usuario_id` já cobre).
11. [ ] Testar à mão no Docker: fixar a mais votada (sem justificativa); fixar outra (exige justificativa); empate; quórum não atingido; prazo vencido recusando voto; reabrir e ver o histórico com as duas entradas; valor por pessoa aparecendo no card; valor alterado com votos aparecendo no histórico; pergunta do padrão sem campo de valor; turma arquivada continua só leitura.
12. [ ] `npm run typecheck`, `npm test` e `scripts/teste/fluxos.mjs` (blocos `participante,app,admin`, onde está o passo do empate).
