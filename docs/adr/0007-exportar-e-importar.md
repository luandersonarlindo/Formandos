# ADR-0007: Exportar o registro da turma e convidar por lista (item 2.1)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 2.1 (achado C, "sem exportar e sem importar", em 7 simulações). Na simulação 3 (só a comissão), "não importa a lista da turma" apareceu em 12 de 12 personas. Na simulação 9 (depois da festa), "não exporta a turma em formato legível" foi o **bloqueio nº 1** (7 de 8): a comissão "fez a prestação de contas inteira fora dele", e a turma seguinte trocou o site por uma empresa de formatura "sem exportar planilha" (`docs/simulacoes/2026-11-08-6/relatorio.md`).

## Contexto

### O que as simulações pediram

1. **Registro legível da turma** (PDF), para prestar contas e guardar como prova "como era no dia": decisões com data e números, resultado de cada votação, presença, fornecedores, tarefas, avisos e caixa (simulação 9, recomendação 1).
2. **Planilhas** (CSV) do mesmo conteúdo, para quem continua controlando no Excel (simulações 3, 7 e 10).
3. **Trazer a lista da turma** de uma vez, em vez de cada pessoa ser convidada sozinha (simulação 3).
4. **Exportação pessoal legível**: "baixar meus dados" em JSON "eu não abro isso" (simulação 9, recomendação 6, 4 personas).

### O que já existe

- `/conta/exportar` (`src/app/(conta)/conta/exportar/route.ts`): rota GET que devolve o JSON de `getMeusDados` com `Content-Disposition`.
- Leituras prontas: `listarMembrosAdmin` e `getVotosEnquete` (`src/lib/admin.ts`), `getRelatorio` (`src/lib/relatorio.ts`), `listarPresencas` e `getResumoPresenca` (`src/lib/presenca.ts`), `listarFornecedoresAdmin` e `getResumoOrcamento` (`src/lib/terceiros.ts`), `listarDecisoes` (`src/lib/dashboard.ts`), `listarHistoricoDecisoes` (`src/lib/auditoria.ts`), `listarSituacoes` e `getCaixa` (`src/lib/pagamentos.ts`).
- Convite: link com código (ADR-0002, `linkConvite` em `src/lib/convite-link.ts`) e `BotaoConvite`.
- Email: `enviarParaTurma` com teto diário (ADR-0006, `src/lib/email-turma.ts`).
- Privacidade já decidida: quem votou em quê é visto só pela comissão (ADR-0001); quanto cada um pagou, só pela tesouraria (ADR-0005).

### Forças em jogo

- **Prova e prestação de contas** sem depender do site continuar no ar.
- **Privacidade:** um arquivo exportado sai do controle do site. O que vai no arquivo precisa respeitar as mesmas regras de quem vê o quê.
- **Sem biblioteca nova:** gerar PDF no servidor traz dependência pesada. O navegador já salva qualquer página como PDF.
- **LGPD ao importar:** a lista traz email de quem ainda não tem conta nem aceitou nada. O site não pode criar conta pela pessoa.

## Decisão

### 1. "Registro da turma" para imprimir ou salvar como PDF

- Página nova `/admin/turma/registro` (`src/app/(admin)/admin/turma/registro/page.tsx`), feita para impressão (`@media print`: sem menu, sem botões, quebra de página entre seções) com um botão **"Salvar como PDF"** que chama `window.print()`. O navegador do celular e do computador salvam em PDF.
- Conteúdo, com a data e hora em que foi gerado no topo:
  - turma, evento (data, local, endereço) e quem é a comissão (nomes);
  - **decisões**: pergunta, escolha, data, "votaram X de Y", se foi dentro da regra e o motivo (fotografia da ADR-0003);
  - **resultado de cada votação**: contagem por opção (sem nomes);
  - **presença**: totais (vão, talvez, não, acompanhantes), sem nomes;
  - **fornecedores contratados**: nome e categoria, e o **total contratado por categoria** (não o preço de cada fornecedor, como a simulação 7 pediu na recomendação 7);
  - **caixa**: arrecadado e previsto (ADR-0005), sem nomes;
  - **histórico**: decisões fixadas e reabertas, mudanças de regra, de valor e de plano.
- **Sem dado pessoal além dos nomes da comissão.** Assim o PDF pode ser repassado à turma, à família ou à coordenação sem expor ninguém. Quem votou em quê e quanto cada um pagou ficam nas planilhas, que têm acesso restrito (item 2).

### 2. Planilhas (CSV)

- Rota `GET /admin/turma/exportar?tipo=...` (`src/app/(admin)/admin/turma/exportar/route.ts`), padrão de `/conta/exportar`.
- Tipos e quem pode baixar:

  | `tipo` | Conteúdo | Quem |
  |---|---|---|
  | `membros` | nome, email, papel, desde quando | comissão |
  | `votos` | pergunta, opção, nome de quem votou | comissão (é o que ela já vê na tela) |
  | `decisoes` | pergunta, escolha, data, votantes, membros, fora da regra, motivo | comissão |
  | `presenca` | nome, resposta, acompanhantes, observação | comissão |
  | `fornecedores` | nome, categoria, contato, status, valor | comissão |
  | `pagamentos` | nome, tipo, valor, data, forma, quem pagou, referência, estado | **só a tesouraria** |

- Função pura `paraCsv(linhas)` em `src/lib/csv.ts`, com teste: separador `;` e BOM UTF-8 (o Excel em português abre direto, com acento), aspas quando preciso, e **proteção contra fórmula**: célula que começa com `=`, `+`, `-`, `@`, tab ou retorno ganha um apóstrofo na frente (senão um nome como `=HIPERLINK(...)` vira fórmula ao abrir).
- Nome do arquivo: `formandos-{turma}-{tipo}-{AAAA-MM-DD}.csv`.
- Cada download grava `turma.exportada` na auditoria (tipo e quem baixou), visível só à comissão. É a resposta a "quem levou a lista de emails?".
- Botões no card novo **"Exportar o registro da turma"** em `/admin/turma`.

### 3. Convidar por lista (não criar conta)

- Em `/admin/membros`, diálogo **"Convidar por lista"**: a comissão cola uma lista (um por linha: `email` ou `nome; email`, aceita vírgula e tab, como sai de uma planilha). Até 200 por vez.
- Função pura `lerListaConvites(texto)` (em `src/lib/convite-lista.ts`, com teste): separa nome e email, normaliza o email, tira repetidos e linhas inválidas (e diz quais).
- Antes de enviar, o diálogo mostra: "X novos convites, Y já são membros, Z já convidados, W linhas com problema". Depois de confirmar, cada pessoa recebe um email **"Convite: entre na turma {turma}"** com o link `?codigo=` (ADR-0002). Os envios contam no teto diário (`enviarParaTurma`).
- **Ninguém é colocado na turma nem ganha conta.** A pessoa clica, entra com Google ou cria a conta e confirma, como qualquer convite.
- Tabela nova para a comissão acompanhar e não convidar duas vezes:

  ```sql
  create table if not exists convites_email (
    turma_id    uuid not null references turmas(id) on delete cascade,
    email       varchar(255) not null,
    nome        varchar(120),
    enviado_por uuid references usuarios(id) on delete set null,
    enviado_em  timestamptz not null default now(),
    primary key (turma_id, email)
  );
  ```

  Em `/admin/membros`, a lista **"Convidados que ainda não entraram"**, com "reenviar" (no máximo 1 vez por dia por email) e "tirar da lista". Quando a pessoa entra na turma (`entrarPorConvite`), a linha dela é apagada.
- **Retenção:** email de quem não entrou é apagado 90 dias depois do último envio, pela rota de agendamento da ADR-0006. A Política de Privacidade ganha uma linha sobre isso.

### 4. "Meus dados" legível

- Página nova `/conta/meus-dados`, com o mesmo conteúdo de `getMeusDados` em seções (conta, turmas, votos, presença, dúvidas, tarefas, pagamentos) e o botão "Salvar como PDF". O JSON continua em `/conta/exportar`, para quem quer levar os dados para outro serviço (portabilidade).
- Em `/conta`, o card "Baixar meus dados" passa a ter dois botões: "Ver e salvar em PDF" e "Baixar JSON".

## Opções consideradas

### Como gerar o PDF

| Opção | Prós | Contras |
|---|---|---|
| **A. Página de impressão + "Salvar como PDF" do navegador (escolhida)** | zero dependência; o mesmo HTML vira tela e PDF; funciona no celular | o layout final depende um pouco do navegador |
| B. Gerar no servidor (`@react-pdf/renderer`, Puppeteer) | arquivo idêntico em todo lugar | dependência pesada; Puppeteer precisa de Chrome no servidor; mais um layout para manter |

### O que vai no PDF

| Opção | Prós | Contras |
|---|---|---|
| A. Tudo, com nomes (quem votou, quem pagou) | registro completo | o PDF circula fora do site e expõe voto e dívida de cada um, contra as ADRs 0001 e 0005 |
| **B. Agregado, só com os nomes da comissão (escolhida)** | pode ser repassado à turma e à coordenação | quem precisa do detalhe usa a planilha, de acesso restrito |

### Importar a lista

| Opção | Prós | Contras |
|---|---|---|
| A. Criar as contas e pôr na turma direto | a turma fica pronta num clique | conta sem consentimento; email que ninguém confirmou; quem não quer estar ali fica |
| **B. Mandar convite por email e acompanhar quem entrou (escolhida)** | a pessoa decide; reaproveita o link da ADR-0002 | depende de a pessoa abrir o email (por isso o link também vai para o grupo, ADR-0004) |
| C. Só gerar a lista de links para a comissão colar no WhatsApp | sem email | não resolve "quem ainda não entrou?" |

## Análise de trade-offs

A simulação 9 mostrou que o registro só vale se sair do site: é o que a comissão leva para a prestação de contas e o que sobra se o site acabar. O PDF agregado responde a isso sem criar um arquivo que exponha voto e dívida, e as planilhas dão o detalhe para quem tem direito de vê-lo na tela.

O convite por lista é o maior risco de privacidade deste item: o site passa a guardar email de quem não é usuário. Por isso ele não cria conta, guarda o mínimo (nome e email), apaga quando a pessoa entra ou em 90 dias, e cada envio passa pelo teto diário.

## Consequências

- **Fica mais fácil:** prestar contas e guardar a prova "como era no dia"; trazer a turma inteira de uma vez; saber quem ainda não entrou.
- **Fica mais fácil também:** o plano de fim (2.3) pode dizer "baixe o registro antes da exclusão"; a tesouraria leva os pagamentos para a planilha dela (3.4 é o caminho de volta).
- **Fica mais difícil:** manter o registro e as planilhas alinhados quando aparecerem dados novos (cada ADR futura precisa decidir se entra no registro).
- **Risco:** planilha com emails e votos sair do controle da comissão. Mitigação: só comissão (pagamentos só tesouraria) e cada download na auditoria.
- **Rever depois:** importar a planilha da tesouraria (3.4); registro por período; exportar avisos e dúvidas.

## Ações

1. [ ] Backup (`pg_dump`). `db/schema.sql`: tabela `convites_email`.
2. [ ] `src/lib/csv.ts` (`paraCsv`, com teste: `;`, BOM, aspas, quebra de linha, proteção contra fórmula) e `src/lib/convite-lista.ts` (`lerListaConvites`, com teste: `email`, `nome; email`, vírgula, tab, repetidos, inválidos, limite de 200).
3. [ ] `src/lib/auditoria-acoes.ts`: `turma.exportada` (restrita).
4. [ ] `/admin/turma/exportar` (CSV, 6 tipos, pagamentos só tesouraria, auditoria) e card "Exportar o registro da turma" em `/admin/turma`.
5. [ ] `/admin/turma/registro`: página de impressão com as seções do item 1 e "Salvar como PDF".
6. [ ] Convite por lista: `emailConviteTurma` em `email.ts`; actions `previaConvites`, `enviarConvites`, `reenviarConvite`, `removerConvite`; lista "Convidados que ainda não entraram" em `/admin/membros`; `entrarPorConvite` apaga a linha; a rota de lembretes apaga convites com mais de 90 dias.
7. [ ] `/conta/meus-dados` legível e os dois botões em `/conta`; `/privacidade` com a linha sobre convites.
8. [ ] Textos revisados com `design:ux-copy`; telas e PDF conferidos em 360px.
9. [ ] `npm run typecheck`, `npm test`, passo novo em `fluxos.mjs` (baixar um CSV e conferir cabeçalho e auditoria; registro abre com as seções; convite por lista manda email no Mailpit e o convidado some da lista quando entra).
