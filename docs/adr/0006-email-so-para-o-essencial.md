# ADR-0006: Email só para o essencial — decisão, mudança no evento e lembretes de prazo (item 1.6)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 1.6 (achado A, "o site não avisa ninguém", em 10 de 10 simulações). Na simulação 10 o email **quase não foi lido**: "caiu na caixa velha no meio de propaganda". **O único que foi lido tinha "prazo" no assunto.** E uma persona pediu para "controlar quais recebo" (`docs/simulacoes/2026-11-08-7/relatorio.md` e `entrevistas.md`).

## Contexto

### O que as simulações dizem sobre email

- Email **não substitui** o grupo do WhatsApp. O canal que funcionou foi o texto colado no grupo (ADR-0004).
- Email serve para o que **não pode ser perdido** e é **pessoal**: um prazo que está acabando, uma decisão que mudou o que a pessoa vai pagar, a festa que mudou de horário. Na simulação 8 (semana da festa), 5 de 8 personas não saberiam pelo site de uma mudança de horário 3 dias antes.
- Muitos emails ensinam a pessoa a ignorar todos. Por isso, **poucos tipos**, com o assunto dizendo o que mudou.

### O que já existe

- `src/lib/email.ts`: `enviarEmail` e `enviarEmailSilencioso` (nodemailer/SMTP), o layout dos modelos (`caixaEmail`, `botao`, `escapar`), `urlDoSite` e 8 modelos transacionais (verificação, senha, entrou, saiu e foi removido da turma, conta excluída). Sem `SMTP_HOST`, o email só vai para o log.
- No Docker, todo email vai para o **Mailpit** (`compose.yaml`, bloco `x-email`), nunca para a internet. O `.env.example` sugere Gmail com senha de app.
- `src/lib/throttle.ts` (`consumirLimite`), já usado em avisos e convites.
- `src/lib/texto-whatsapp.ts` (ADR-0004): textos de decisão e de evento, sem nome de pessoa.
- `fixarDecisao` (ADR-0003) e `salvarEvento` (`src/actions/evento.ts`) são os pontos onde decisão e evento mudam. `salvarEvento` hoje grava sem ler o valor anterior.
- `regras_enquete.prazo` (ADR-0003) e `parcelas.vencimento` com `calcularSituacao` (ADR-0005) dizem quando algo está para vencer.
- **Não há agendador.** O projeto não está publicado: roda no Docker de cada pessoa.
- Next 16: `after()` (`next/server`, estável desde a 15.1) roda um trabalho depois que a resposta foi enviada, em Server Actions e Route Handlers (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`).

### Forças em jogo

- **Ser lido:** assunto com a palavra que importa ("Prazo", "Mudou", "Decidido") e o resto em 3 linhas.
- **Não virar spam:** poucos tipos, só para quem precisa (o lembrete de votação vai só para quem ainda não votou).
- **Privacidade:** um email por pessoa (ninguém vê o endereço de ninguém); o lembrete de parcela fala só da parcela da própria pessoa.
- **Controle:** quem não quer receber desliga.
- **Limites do envio:** o Gmail aceita cerca de 500 destinatários por dia; uma turma de 60 com 4 avisos já gasta metade.
- **Sem servidor no ar:** o lembrete precisa de alguém chamando uma rota todo dia.

## Decisão

### 1. Quatro emails, e só eles

| Email | Quem recebe | Quando | Assunto |
|---|---|---|---|
| Decisão fixada | todos os membros, menos quem fixou | logo depois de `fixarDecisao` | `Decidido: {pergunta}` |
| Mudança no evento | todos os membros, menos quem mudou | `salvarEvento` mudou data, horário, local ou endereço | `Mudou: {o quê} da formatura` |
| Votação fecha em breve | membros que **ainda não votaram** na pergunta | até 2 dias antes de `regras_enquete.prazo` | `Prazo: votação "{pergunta}" fecha em {12/12 às 23:59}` |
| Parcela vence em breve | a pessoa com a parcela em aberto | até 2 dias antes do vencimento | `Prazo: sua parcela de R$ {valor} vence em {10/12}` |

- Corpo curto: o que mudou ou o que vence, "antes → agora" quando é mudança, e **um** botão para o site. O texto de decisão e de evento reaproveita as linhas de `texto-whatsapp.ts`, para o grupo e o email dizerem a mesma coisa.
- O email de mudança no evento resolve uma parte do achado D (histórico de alteração): diz "era 20h, agora é 19h". Para isso, `salvarEvento` passa a ler data, local e endereço antes de gravar, na mesma transação.
- **Ficam de fora:** aviso publicado (vai para o grupo pela ADR-0004; email de aviso é o que a simulação 10 mostrou que ninguém lê), nova votação aberta, nova dúvida respondida, lembrete de presença. Podem entrar depois se a turma pedir, como tipos que a pessoa liga.

### 2. A pessoa pode desligar

```sql
alter table usuarios add column if not exists receber_emails boolean not null default true;
```

- Em `/conta`, um interruptor **"Receber emails da turma"** (decisões, mudanças no evento e prazos). Os emails de conta (confirmação, senha, saída da turma) continuam sempre, porque são da própria conta.
- Todo email desta ADR termina com "Para não receber mais, desligue em Minha conta: {link}".
- Base legal (LGPD): execução do serviço que a pessoa pediu ao entrar na turma, com oposição a qualquer momento. A Política de Privacidade (`/privacidade`) ganha uma linha sobre esses emails e o interruptor.

### 3. Envio fora do caminho da tela

- Função nova `enviarParaTurma(lista, montar)` em `src/lib/email.ts`: um email por pessoa, em sequência, com `enviarEmailSilencioso` (falha de um não derruba os outros). Quem chama monta a lista já filtrada por `receber_emails`.
- Decisão e evento disparam dentro de **`after()`** na própria Server Action, depois da transação. A tela responde na hora, e os 60 emails saem em segundo plano.
- **Teto diário:** `consumirLimite` com a chave `email:dia`, 400 por dia, conferido a cada email. Passou do teto, o email não sai e o log registra. Fica abaixo dos ~500 do Gmail para sobrar espaço para os emails de conta (confirmação, senha), que não passam pelo teto.

### 4. Lembretes: rota de agendamento chamada de hora em hora

- Rota `GET /api/cron/lembretes` (`src/app/api/cron/lembretes/route.ts`), que só responde com o cabeçalho `Authorization: Bearer {CRON_SECRET}` (variável nova; sem ela, a rota responde 404).
- A cada chamada, procura votações com prazo nas próximas 48 horas e parcelas em aberto vencendo nos próximos 2 dias, em todas as turmas não arquivadas, e manda o lembrete a quem ainda não recebeu.
- **Não repete:** tabela nova

  ```sql
  create table if not exists lembretes_enviados (
    tipo       varchar(20) not null check (tipo in ('votacao', 'parcela')),
    referencia uuid not null,           -- enquete_id + turma, ou parcelas.id
    turma_id   uuid not null references turmas(id) on delete cascade,
    usuario_id uuid not null references usuarios(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (tipo, referencia, turma_id, usuario_id)
  );
  ```

  Como cada envio fica marcado, chamar a rota várias vezes por dia é seguro. Isso permite chamar **de hora em hora**: se o computador estiver desligado num horário, a próxima chamada pega.
- **Quem chama:**
  - no Docker (hoje): um serviço novo `cron` no `compose.yaml` (imagem pequena com `curl`, num laço de 1 hora), apontando para `http://app:3000/api/cron/lembretes`. Os emails caem no Mailpit;
  - se um dia houver deploy: Vercel Cron ou GitHub Actions chamando a mesma rota, sem mudar código.
- `/api/healthz` passa a mostrar a hora da última execução do lembrete, para saber se o agendador parou.

### 5. Provedor de envio

- **Continua SMTP**, configurado por variável. Os provedores transacionais (Brevo, Resend, Amazon SES, Mailgun) também aceitam SMTP, então trocar o Gmail por um deles é **só trocar `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` e `EMAIL_FROM`**, sem mudar código.
- O README ganha uma nota: Gmail serve para uma ou duas turmas de teste; para várias turmas, usar um provedor transacional com domínio próprio (melhora a entrega e tira o email da caixa de spam), e ajustar o teto do item 3.

## Opções consideradas

### Quais emails mandar

| Opção | Prós | Contras |
|---|---|---|
| A. Tudo (aviso, votação nova, decisão, dúvida respondida, evento, prazos) | ninguém perde nada | é o que a simulação 10 mostrou: ninguém lê; queima o limite do Gmail |
| **B. Quatro essenciais (escolhida)** | o que não pode ser perdido; assunto com "Prazo", "Mudou", "Decidido" | aviso e votação nova dependem do grupo (ADR-0004) |
| C. Nenhum email, só o grupo | zero custo | quem está fora do grupo (ou silenciou) perde a mudança de horário |

### Como agendar os lembretes

| Opção | Prós | Contras |
|---|---|---|
| A. Calcular "fecha em breve" quando alguém abre o site | sem agendador | o lembrete serve justamente para quem **não** abre o site |
| **B. Rota protegida + chamador externo, de hora em hora, sem repetir (escolhida)** | funciona no Docker hoje e em qualquer deploy amanhã; idempotente | mais uma variável (`CRON_SECRET`) e um serviço no compose |
| C. Fila com agendador dentro do app (pg-boss, BullMQ) | reenvio e prioridade | Redis ou trabalhador sempre ligado; grande demais para dezenas de turmas |
| D. `setInterval` dentro do servidor Next | nada de fora | o `next dev` reinicia a cada mudança; em deploy serverless não existe processo vivo |

### Como mandar para a turma inteira

| Opção | Prós | Contras |
|---|---|---|
| A. Um email com todos em cópia oculta (BCC) | um envio só | não dá para tirar quem desligou de um jeito confiável por pessoa; cai mais em spam; o lembrete de parcela é individual de qualquer jeito |
| **B. Um email por pessoa, em `after()` (escolhida)** | respeita `receber_emails`; mesmo caminho para os individuais | 60 envios por decisão; mitigado pelo teto diário |

### Provedor

| Opção | Prós | Contras |
|---|---|---|
| **A. SMTP por variável, Gmail hoje (escolhida)** | já funciona; trocar de provedor é mudar variável | limite de ~500 por dia; entrega pior que provedor dedicado |
| B. API de um provedor (SDK do Resend, SES) | estatística de entrega | prende o código a um fornecedor; conta e domínio antes de testar qualquer coisa |

## Análise de trade-offs

O que decide é a simulação 10: o email só foi lido quando o assunto dizia "prazo". Por isso a ADR não tenta avisar tudo por email, e sim o pouco que tem prazo ou que muda o que a pessoa vai fazer (pagar, votar, chegar na festa). O resto fica com o grupo, onde a turma está.

O agendador é a parte cara. A rota protegida com marcação de "já enviado" é a forma mais simples que funciona tanto no Docker de hoje quanto num deploy futuro, sem ninguém precisar lembrar de rodar nada. Chamar de hora em hora, e não uma vez por dia, cobre o computador que estava desligado na hora marcada.

`after()` evita que fixar uma decisão demore 30 segundos para responder porque 60 emails estão saindo. O risco é o processo cair no meio do envio e parte da turma não receber; para uma turma de dezenas de pessoas e um aviso que também vai para o grupo, isso é aceitável.

## Consequências

- **Fica mais fácil:** quem não abre o site fica sabendo que a votação fecha, que a decisão saiu, que o horário mudou e que a parcela vence. A tesouraria ganha o lembrete automático de parcela.
- **Fica mais fácil também:** o histórico do evento (item 2.5) começa aqui, com o "antes → agora" lido em `salvarEvento`; a página pública do evento (2.2) pode usar o mesmo texto.
- **Fica mais difícil:** mais um serviço no `compose.yaml` e uma variável secreta; testar envio em massa (Mailpit ajuda: todos os emails ficam lá).
- **Risco:** email cair no spam com Gmail. Mitigação: poucos emails, texto simples, e a nota no README sobre provedor transacional com domínio próprio.
- **Rever depois:** tipos de email que a pessoa liga um a um; email de aviso para quem pedir; resumo semanal em vez de emails soltos; WhatsApp de verdade (item 3.1).

## Ações

1. [ ] Backup (`pg_dump`). `db/schema.sql`: `usuarios.receber_emails`, tabela `lembretes_enviados`.
2. [ ] `src/lib/lembretes-regras.ts` (novo, puro, com teste): quais votações e parcelas entram na janela de 2 dias (fuso de Brasília, prazo passado não entra, parcela paga não entra) e o que mudou no evento (data, horário, local, endereço; "antes → agora").
3. [ ] `src/lib/email.ts`: modelos `emailDecisao`, `emailEventoMudou`, `emailPrazoVotacao`, `emailPrazoParcela` (assunto com a palavra-chave, rodapé com o link para desligar) e `enviarParaTurma` com o teto diário. Teste dos modelos em `email.test.ts`.
4. [ ] `fixarDecisao` e `salvarEvento`: montar a lista (membros com `receber_emails`, menos quem fez) e enviar em `after()`. `salvarEvento` lê o estado anterior na mesma transação.
5. [ ] `src/app/api/cron/lembretes/route.ts` com `CRON_SECRET`; marcação em `lembretes_enviados`; hora da última execução em `/api/healthz`.
6. [ ] `compose.yaml`: serviço `cron` chamando a rota de hora em hora; `.env.example` com `CRON_SECRET`; README com a nota de provedor.
7. [ ] `/conta`: interruptor "Receber emails da turma"; `/privacidade`: linha sobre esses emails; `getMeusDados` inclui a preferência.
8. [ ] Textos dos 4 emails revisados com `design:ux-copy`.
9. [ ] `npm run typecheck`, `npm test`, passo novo em `fluxos.mjs` (fixar decisão e conferir os emails no Mailpit; mudar o horário do evento; chamar a rota de lembretes duas vezes e conferir que não repete) e teste à mão no Mailpit (`http://localhost:8025`) em largura de celular.
