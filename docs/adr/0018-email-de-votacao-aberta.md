# ADR-0018: Email de votação aberta (item 1.1 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-16
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 1, item 1.1 (ERS 2.0: RF-55). É o gargalo da rodada 2: apareceu nos temas 1, 2, 3, 5 e 10 e foi a recomendação 1 de cinco relatórios.

## Contexto

### O que as simulações dizem

- **Votação nova não gera email.** A turma só fica sabendo se alguém da comissão colar no grupo.
- A comissão continua sendo "o carteiro" (tema 10). Essa crítica já tinha ficado depois da ADR-0004 e da ADR-0016.

### O que já existe

- **Não existe o momento de "abrir uma pergunta".** As perguntas existem desde que o catálogo é criado. O prazo é salvo à parte, em `salvarRegraEnquete` (`src/actions/catalogos.ts`).
- **O catálogo padrão tem 23 perguntas.** Avisar cada uma sozinha lotaria a caixa de todo mundo e o teto diário de emails.
- **Envio para a turma:** `destinatariosDaTurma` e `enviarParaTurma` já respeitam quem desligou os emails e o teto diário (ADR-0006).
- **Registro de envios:** `lembretes_enviados` guarda o que já foi mandado, com `check (tipo in ('votacao', 'parcela', 'exclusao', 'presenca'))`.
- **Lembrete de prazo de votação** já existe (ADR-0006). Ele sai perto do fim do prazo, não na abertura.
- **"Mandar para o grupo"** da pergunta (ADR-0004) já fica no card da pergunta na tela da comissão.

### Forças em jogo

- **O email precisa sair quando a pergunta está pronta**, não enquanto a comissão monta o catálogo.
- **Um email por pergunta, uma vez só.**
- **Teto diário de emails.** Uma turma de 60 pessoas gasta 60 envios por aviso.

## Decisão

### 1. A comissão dispara o email (opção A, escolhida pelo grupo em 16/11/2026)

- Botão **"Avisar a turma por email"** ao lado do "Mandar para o grupo" no card da pergunta.
- O botão só aparece se a pergunta tem prazo.
- O botão funciona **uma vez por pergunta**. Depois do envio, ele vira o texto "Turma avisada em dd/mm".
- Respeita quem desligou os emails e conta no teto diário. Se o teto não comportar a turma inteira, a ação recusa e diz quantos envios restam hoje.

### 2. O email

- Modelo novo `emailVotacaoAberta({ pergunta, prazo, valorPorPessoa?, url })` em `src/lib/email.ts`, no padrão dos outros.
- Assunto: "Votação aberta: {pergunta}, fecha em dd/mm".
- Corpo: a pergunta, o prazo, o valor por pessoa se houver, e o link para votar.

### 3. Ação e registro

- Ação nova `avisarVotacao(enqueteId)` em `src/actions/catalogos.ts`. Confere que é admin, que a pergunta tem prazo e que ainda não foi avisada.
- Marca o envio em `lembretes_enviados` com o tipo novo `abertura` (referência = pergunta).
- Registra `votacao.avisada` na auditoria, visível no histórico da turma.

### 4. Banco

```sql
alter table lembretes_enviados drop constraint if exists lembretes_enviados_tipo_check;
alter table lembretes_enviados add constraint lembretes_enviados_tipo_check
  check (tipo in ('votacao', 'parcela', 'exclusao', 'presenca', 'abertura'));
```

## Alternativas consideradas

| Opção | Prós | Contras |
|---|---|---|
| **A. A comissão dispara (escolhida)** | A comissão controla; nenhum email enquanto o catálogo está sendo montado | Depende de a comissão lembrar de clicar |
| B. Sai sozinho ao salvar o prazo pela primeira vez | Ninguém precisa lembrar | Manda email durante a montagem; 23 perguntas podem virar 23 emails no mesmo dia |
| C. Um resumo diário das votações abertas | Um email só por dia | Precisa de agendador novo e chega atrasado |

## Consequências

**Fica melhor**
- A turma recebe a votação nova por email, sem depender do grupo.
- A comissão escolhe o momento, como já faz no "Mandar para o grupo".

**Fica pior ou mais difícil**
- Mais um email para a turma (o 6º tipo).
- Se a comissão não clicar, nada muda em relação a hoje.
- Um botão a mais no card da pergunta.

**Arquivos**
- `db/schema.sql`.
- `src/lib/email.ts` (`emailVotacaoAberta`) e `email.test.ts`.
- `src/actions/catalogos.ts` (`avisarVotacao`).
- `src/lib/auditoria-acoes.ts` e `src/lib/historico-texto.ts` (`votacao.avisada`).
- O card da pergunta na tela da comissão.

**Teste de fluxo**
- `email.test.ts`: assunto e corpo, com e sem valor por pessoa.
- Passo no E2E (grupo `admin` de `fluxos.mjs`): avisar, ver o email no Mailpit e conferir que o segundo clique não manda de novo.

### Andamento (2026-11-17)

Feita. Diferenças em relação ao texto acima:

- **"Já avisada" vem do histórico:** a trava de uma vez por pergunta olha a auditoria (`votacao.avisada`), e não `lembretes_enviados`. Assim ela vale mesmo quando ninguém recebeu o email. `lembretes_enviados` (tipo `abertura`) guarda quem recebeu, pessoa por pessoa.
- **Quem recebe:** só quem ainda não votou naquela pergunta, conta na turma (observador fica de fora, ADR-0012), aceita email e tem email confirmado. Quem clicou também fica de fora.
- **Teto do dia:** antes de enviar, `enviosLivresHoje` (em `email-turma.ts`) confere se o teto comporta todos. Se não comporta, a ação recusa e diz quantos envios faltam e quantos restam, sugerindo o "Mandar para o grupo". Assim a turma nunca é avisada pela metade.
- **Sem ninguém para avisar** (todos votaram ou desligaram os emails): a ação recusa com essa mensagem e não gasta o aviso.
- **O email lista as opções**, com o valor por pessoa ao lado de cada uma que tiver valor.
- **Depois do clique, a página recarrega** e o botão vira "Turma avisada por email em dd/mm às HH:MM". Esse texto é a confirmação: a mensagem de sucesso da ação some com o botão.
- **Histórico da turma:** `votacao.avisada` é visível para a turma, com a frase "avisou a turma por email da votação …" e quantas pessoas receberam.
- Testes: `typecheck`, `npm test` (339; 4 novos em `email.test.ts`, `historico-texto.test.ts` e `auditoria-acoes.test.ts`). Passo novo "ADR-0018" no grupo `admin` de `fluxos.mjs`: sem prazo não há botão; com prazo, avisa, o email chega ao participante no Mailpit, o envio fica marcado e o botão some. Bloco `participante,app,admin` no Docker, 67 de 67.
