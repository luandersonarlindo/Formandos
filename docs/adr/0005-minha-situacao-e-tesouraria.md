# ADR-0005: "Minha situação" e tesouraria — parcelas e pagamentos registrados (item 1.5)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 1.5 (achado E, "dinheiro fora do app", simulações 1, 2, 3, 5, 7 e 10). Na simulação 7 (dinheiro), 8 de 8 personas disseram que o site "não serve pra nada" para dinheiro. Na simulação 10, "Minha situação" **funcionou para quem paga**, mas ficaram de fora a parcela dupla e o pagamento feito por outra pessoa (`docs/simulacoes/2026-11-08-7/relatorio.md`).

## Contexto

### O problema

Hoje o dinheiro da formatura mora no Pix de alguém da comissão, numa planilha e no "paguei?" do WhatsApp privado. O site não registra nada disso. As simulações pediram, nesta ordem:

1. **"Quanto eu paguei, quanto falta e quando vence a próxima"**, visível só para a pessoa e a tesouraria (simulação 7, recomendação 2, 7 personas). É o que acaba com o "paguei?" no privado da tesoureira.
2. **Registrar casos reais**: duas parcelas pagas juntas, pagamento parcial, pai ou mãe pagando com outro nome (simulação 10, Patrícia e Dona Socorro).
3. **"Já paguei"** feito pelo próprio formando, com a tesouraria confirmando (simulação 10).
4. **Data da última atualização**, para quem vê saber que a tesouraria pode levar um ou dois dias para lançar. Essa frase foi o que tranquilizou formando e mãe na simulação 10.
5. **Caixa da turma com totais abertos e sem nomes** (simulação 7, recomendação 3, 6 personas): prestação de contas sem expor quem deve.

E o que as simulações **não** pediram: ninguém quer pagar pelo site. Processar Pix ou boleto ficou fora de propósito no levantamento (item 3.8).

### O que já existe

- `membros.papel` aceita só `admin` e `participante`. Toda a comissão é `admin` e pode tudo (achado L).
- `src/lib/dal.ts`: `exigirMembro`, `exigirAdmin` e as versões `Editavel` (turma arquivada vira só leitura).
- `fornecedores.valor_orcado` e `src/lib/orcamento.ts` (`formatarReal`, `lerValorOrcado`) tratam o orçamento de fornecedores, que é dinheiro que **sai**. Nada trata o dinheiro que **entra**.
- `opcao-detalhe.ts` (ADR-0003) já tem `lerValorPessoa`, que aceita "95", "95,50" e "1.234,56".
- `src/lib/auditoria.ts` com vocabulário fechado e a lista `ACOES_VISIVEIS_TURMA` (ADR-0003).
- `src/lib/saida-turma.ts` apaga o rastro de quem sai da turma (votos, presença, dúvidas). Decisões e avisos ficam, sem o nome de quem fez.
- `getMeusDados` (`src/lib/usuarios.ts`) monta o "baixar meus dados" da LGPD.
- O projeto não guarda arquivo nenhum: não há armazenamento de objetos.

### Forças em jogo

- **Privacidade:** quanto cada pessoa pagou é dado pessoal e sensível no grupo (vergonha de dever, simulação 7). Só a pessoa e quem cuida do dinheiro podem ver.
- **Confiança na comissão:** quem desconfia quer ver o total arrecadado e saber que valor não muda sem rastro (simulação 7, recomendações 3 e 5).
- **Não virar a segunda planilha:** se registrar no site der mais trabalho que a planilha, a tesouraria não registra (simulação 10, "registro duplo"). Lançar precisa ser rápido.
- **Tamanho:** é o maior item do Nível 1. Precisa caber em partes que funcionem sozinhas.

## Decisão

### 1. Papel de tesouraria: uma marcação no membro da comissão

```sql
alter table membros add column if not exists tesouraria boolean not null default false;
```

- Só um `admin` pode ser marcado. Qualquer admin marca ou desmarca outro admin em `/admin/membros`, e a mudança vai para a auditoria (`papel.tesouraria`).
- Nova função `exigirTesouraria()` em `src/lib/dal.ts` (e `exigirTesourariaEditavel()`).
- **Os outros admins não veem quanto cada pessoa pagou.** Veem só o caixa da turma, como todo mundo. Isso responde ao "valor que só um grupinho enxerga" e ao medo de exposição.
- Não mexe no `check` de `membros.papel`. Papéis completos da comissão (observador, passar a tesouraria) continuam no item 3.2.

### 2. Plano de parcelas da turma

```sql
create table if not exists parcelas (
  id         uuid primary key default gen_random_uuid(),
  turma_id   uuid not null references turmas(id) on delete cascade,
  numero     smallint not null check (numero between 1 and 60),
  valor      numeric(10,2) not null check (valor > 0),
  vencimento date not null,
  unique (turma_id, numero)
);
```

- Um plano por turma, igual para todos. A tesouraria monta com "N parcelas de R$ X, primeira em dd/mm, a cada mês" e pode ajustar parcela por parcela.
- Mudar valor ou vencimento de parcela grava `plano.alterado` na auditoria, com antes e depois, e **aparece para a turma** em "Minha situação", numa lista "Mudanças no plano". É o histórico de mudança de valor que a simulação 7 pediu (recomendação 5).
- Valor diferente por pessoa (bolsa, desconto, quem só vai à colação) fica fora deste corte. A tesouraria resolve com um lançamento de ajuste (item 3), e a regra de desistência entra num "Regras do dinheiro" em texto livre (item 6).

### 3. Lançamentos por pessoa, sem ligar a uma parcela

```sql
create table if not exists pagamentos (
  id            uuid primary key default gen_random_uuid(),
  turma_id      uuid not null references turmas(id) on delete cascade,
  usuario_id    uuid references usuarios(id) on delete set null,   -- nulo = ex-membro
  tipo          varchar(12) not null default 'pagamento'
                check (tipo in ('pagamento', 'devolucao', 'ajuste')),
  valor         numeric(10,2) not null check (valor > 0),
  pago_em       date not null,
  forma         varchar(15) not null default 'pix'
                check (forma in ('pix', 'dinheiro', 'transferencia', 'outro')),
  pago_por      varchar(120),          -- "mãe", "Maria (tia)": pagamento de terceiro
  referencia    varchar(120),          -- id da transação do Pix ou observação curta
  status        varchar(12) not null default 'confirmado'
                check (status in ('informado', 'confirmado', 'recusado')),
  motivo_recusa varchar(255),
  lancado_por   uuid references usuarios(id) on delete set null,
  confirmado_por uuid references usuarios(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_pagamentos_turma_usuario on pagamentos (turma_id, usuario_id);
```

- **O lançamento não aponta para uma parcela.** O valor pago é aplicado às parcelas em ordem de vencimento (função pura, item 4). Assim, R$ 200 cobrem duas parcelas de R$ 100, R$ 50 deixam metade de uma, e ninguém precisa escolher "qual parcela" ao lançar. É o que a tesoureira não conseguiu registrar na simulação 10.
- `pago_por` cobre o pai ou a mãe que paga com outro nome.
- `tipo = 'devolucao'` (desistência) subtrai do pago; `ajuste` é desconto ou crédito decidido pela comissão, com `referencia` obrigatória dizendo o motivo.
- **Sem anexo.** O comprovante é o texto `referencia` (o id do Pix aparece no comprovante do banco). Guardar imagem exigiria armazenamento, política de retenção e cuidado com dado de terceiros (nome e CPF parcial do pagador no print).

### 4. Situação calculada por uma função pura

`src/lib/situacao-regras.ts`, com teste: `calcularSituacao(parcelas, lancamentosConfirmados, hoje)` devolve:

- total do plano, total pago (pagamentos + ajustes − devoluções), quanto falta;
- cada parcela com estado `paga`, `parcial`, `vencida` ou `a vencer`, aplicando o pago em ordem de vencimento;
- a próxima parcela em aberto e o valor que falta nela;
- o estado geral: `quitado`, `em dia`, `atrasado` (alguma parcela vencida não coberta) ou `adiantado`.

Só lançamentos `confirmado` entram na conta. `informado` aparece à parte, como "aguardando confirmação".

### 5. "Já paguei": o formando informa, a tesouraria confirma

- Em "Minha situação", o botão **"Já paguei"** abre um formulário: valor, data, forma, quem pagou (opcional) e id do Pix (opcional). Grava `status = 'informado'`.
- A tesouraria vê os informados no topo de `/admin/tesouraria` e **confirma** ou **recusa** com motivo ("não achei no extrato"). A pessoa vê o motivo.
- Lançamento feito pela própria tesouraria já nasce `confirmado`.
- Limite contra abuso: `consumirLimite` (`src/lib/throttle.ts`), 10 informes por pessoa por dia.

### 6. Telas

| Tela | Quem | O que mostra |
|---|---|---|
| `/minha-situacao` (nova, `src/app/(app)/`) | todo membro, só os próprios dados | no topo: "Você pagou R$ X de R$ Y · próxima: R$ Z em 10/12" e o estado; lista das parcelas; lançamentos com estado (confirmado, aguardando, recusado com motivo); "Já paguei"; "Atualizado pela tesouraria em dd/mm"; a frase "Pagamentos aparecem aqui depois que a tesouraria confirma. Pode levar alguns dias."; caixa da turma; mudanças no plano; regras do dinheiro |
| `/admin/tesouraria` (nova, `src/app/(admin)/admin/`) | só tesouraria | informados a confirmar; lista de membros com filtro "em dia / atrasado / aguardando" e busca (padrão de `admin/presenca`, com `Paginacao`); lançar pagamento, devolução ou ajuste (`FormDialog`); montar e ajustar o plano; editar o texto "Regras do dinheiro" |
| Menu (`app-shell.tsx`) | membros; "Tesouraria" só para quem é | item "Minha situação" e, para a tesouraria, "Tesouraria" |
| `/admin/membros` | admins | marcar ou desmarcar tesouraria; ao remover alguém com pagamentos, o diálogo avisa quanto a pessoa pagou |

**Caixa da turma** (no fim de "Minha situação", visível a todo membro): "Arrecadado: R$ X de R$ Y previstos (Y = plano × membros)". Só totais, nunca nomes nem quantas pessoas estão atrasadas (numa turma pequena, a contagem identifica quem deve). Saídas (pagamento a fornecedor) ficam para quando o orçamento separar orçado, contratado e pago (simulação 7, recomendação 4).

**Regras do dinheiro:** coluna `turmas.regras_dinheiro text` (até 2.000 caracteres), escrita pela tesouraria, com desistência, devolução e multa. Simulação 7, recomendação 12: "ninguém sabe quanto volta para quem sai".

### 7. Auditoria e LGPD

- Novas ações em `ACOES_AUDITORIA`: `papel.tesouraria`, `plano.alterado`, `pagamento.lancado`, `pagamento.informado`, `pagamento.confirmado`, `pagamento.recusado`, `pagamento.editado`, `pagamento.excluido`. Só `plano.alterado` entra em `ACOES_VISIVEIS_TURMA`. As de pagamento são individuais e ficam restritas.
- `getMeusDados` passa a incluir os lançamentos da pessoa (e o plano da turma).
- **Quem sai da turma** (`apagarDadosDoMembro`): lançamentos `informado` e `recusado` são apagados; os `confirmado` **ficam**, com `usuario_id = null`, porque são registro do caixa da turma (sem eles o total arrecadado mudaria sozinho). A tesouraria deve registrar a devolução antes de remover, e o diálogo de remoção avisa.
- **Quem exclui a conta:** `on delete set null`, mesmo efeito.
- Turma excluída: tudo some por cascata. Turma arquivada: só leitura.

### 8. Entrega em três partes

Cada parte funciona sozinha e tem commit próprio:

1. **Tesouraria lança, formando vê:** marcação de tesouraria, plano de parcelas, lançamento confirmado pela tesouraria (pagamento, devolução, ajuste), `calcularSituacao`, `/minha-situacao` (só leitura) e `/admin/tesouraria`.
2. **"Já paguei":** informar, confirmar, recusar, limite de abuso.
3. **Transparência:** caixa da turma, mudanças no plano visíveis, regras do dinheiro, aviso no diálogo de remoção e `getMeusDados`.

## Opções consideradas

### Quem cuida do dinheiro

| Opção | Prós | Contras |
|---|---|---|
| A. Todo admin lança e vê tudo | nada a configurar | toda a comissão vê quanto cada um pagou; não responde ao "grupinho que enxerga" |
| **B. Marcação `tesouraria` no admin (escolhida)** | só quem cuida do dinheiro vê os valores individuais; sem migrar o `check` de `papel` | mais uma marcação para a comissão lembrar de fazer |
| C. Papel novo `tesouraria` em `membros.papel` | modelo mais limpo | migra o `check` e todas as checagens de `admin`; é o item 3.2 inteiro |

### Como ligar pagamento e parcela

| Opção | Prós | Contras |
|---|---|---|
| A. Cada pagamento aponta para uma parcela (`parcela_id`) | "parcela 3 paga" direto no banco | parcela dupla vira dois lançamentos; parcial fica estranho; a tesouraria precisa escolher a parcela a cada lançamento |
| **B. Pagamento solto, aplicado em ordem de vencimento (escolhida)** | cobre parcial, duplo e adiantado sem esforço; lançar é só valor e data | a "parcela paga" é calculada, não gravada (função pura testada) |

### Comprovante

| Opção | Prós | Contras |
|---|---|---|
| **A. Só texto (id do Pix) (escolhida)** | sem armazenamento; sem imagem com dado de terceiros | quem confere precisa abrir o extrato do banco |
| B. Anexo em armazenamento de objetos (S3, R2) | o print fica junto do lançamento | custo, retenção, LGPD de imagem (nome e CPF parcial do pagador); o projeto não tem onde guardar arquivo |

### Quem sai da turma

| Opção | Prós | Contras |
|---|---|---|
| A. Apaga todos os lançamentos, como votos e presença | segue o padrão de `saida-turma.ts` | o caixa da turma muda sozinho; some a prova de que o dinheiro entrou |
| **B. Mantém os confirmados sem o nome (escolhida)** | caixa continua batendo; a pessoa deixa de ser identificável no registro | a tesouraria precisa resolver devolução antes de remover (o diálogo avisa) |

### Processar o pagamento pelo site (Pix, boleto)

Descartado. Ninguém pediu (simulação 7), exige conta de recebimento, contrato com intermediador e responsabilidade financeira que o projeto não tem como assumir (item 3.8 do levantamento).

## Análise de trade-offs

O que decide o desenho é **a tesouraria lançar mais rápido no site do que na planilha**. Por isso o lançamento é só valor, data e forma, sem escolher parcela, e o formando ajuda com o "Já paguei", que já chega preenchido para a tesouraria só confirmar. Se isso não acontecer, "Minha situação" mostra dado velho e perde a confiança que ganhou na simulação 10.

O segundo ponto é a privacidade. Separar a tesouraria do resto da comissão custa uma marcação, mas é o que permite dizer, na tela, "só você e a tesouraria veem isto". O caixa só com totais dá a transparência que os céticos pediram sem expor quem deve.

Manter os pagamentos confirmados de quem sai é a única exceção ao "sair não deixa rastro". Ela é necessária porque o lançamento é registro do caixa da turma, como as decisões e os avisos, e o nome é retirado.

O que fica de fora é grande: importar a planilha (3.4), exportar (2.1), anexo, valor diferente por pessoa, saídas do caixa e acesso da família (2.2). O registro fica claro na seção "Rever depois".

## Consequências

- **Fica mais fácil:** o formando sabe quanto pagou e quanto falta sem perguntar; a tesouraria para de responder "paguei?" no privado; a turma vê quanto foi arrecadado.
- **Fica mais fácil também:** o item 1.6 ganha o lembrete "sua parcela vence em 2 dias"; o 2.1 (exportar) tem dados para exportar; o 3.4 (importar planilha) tem onde gravar.
- **Fica mais difícil:** mais duas tabelas, duas telas e uma marcação nova na comissão; testar estados de parcela (paga, parcial, vencida, a vencer) e de lançamento (informado, confirmado, recusado).
- **Risco:** a tesouraria não lançar e o site mostrar "atrasado" para quem pagou. Mitigação: a frase de limite, a data da última atualização e o "Já paguei" com estado "aguardando confirmação".
- **Rever depois:** valor diferente por pessoa; anexo de comprovante; saídas e saldo do caixa; importar e exportar a planilha (3.4, 2.1); acesso só leitura para a família (2.2); papéis completos da comissão (3.2).

## Ações

### Parte 1 — tesouraria lança, formando vê

1. [ ] Backup (`pg_dump`). `db/schema.sql`: `membros.tesouraria`, `parcelas`, `pagamentos`, `turmas.regras_dinheiro`.
2. [ ] `src/lib/situacao-regras.ts` (novo): `calcularSituacao`, `gerarPlano` (N parcelas mensais a partir de uma data, sem pular mês curto: 31/01 vira 28/02 ou 29/02), com teste (parcial, dupla, adiantado, devolução, ajuste, vencida, quitado, plano vazio).
3. [ ] `src/lib/auditoria-acoes.ts`: as ações novas; só `plano.alterado` visível à turma.
4. [ ] `src/lib/dal.ts`: `exigirTesouraria`, `exigirTesourariaEditavel`; `Membro` ganha `tesouraria`.
5. [ ] `src/lib/pagamentos.ts` (novo, leituras) e `src/actions/tesouraria.ts` (novo): marcar tesouraria, salvar plano, lançar, editar e excluir lançamento. Valores com `lerValorPessoa`.
6. [ ] Telas `/minha-situacao` e `/admin/tesouraria`, itens no menu, marcação em `/admin/membros`. Textos com `design:ux-copy`.

### Parte 2 — "Já paguei"

7. [ ] `informarPagamento` (com `consumirLimite`), `confirmarPagamento`, `recusarPagamento`; formulário em "Minha situação"; fila de informados em `/admin/tesouraria`.

### Parte 3 — transparência

8. [ ] Caixa da turma e "Mudanças no plano" em "Minha situação"; "Regras do dinheiro".
9. [ ] `saida-turma.ts`: apagar informados e recusados, manter confirmados com `usuario_id = null`; aviso no diálogo de remoção em `/admin/membros`.
10. [ ] `getMeusDados`: lançamentos da pessoa e plano da turma.

### Em todas as partes

11. [ ] `npm run typecheck`, `npm test`, passos novos em `scripts/teste/fluxos.mjs` (grupo `admin`) e telas conferidas em 360px.
