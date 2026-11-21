# ADR-0021: Encerramento do site — faixa e email (item 1.4 da rodada 2)

**Status:** Aceito
**Data:** 2026-11-16
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento-rodada-2.md`, Nível 1, item 1.4 (ERS 2.0: RF-59). Tema 8 da rodada 2. Completa a ADR-0009, item 6.

## Contexto

### O que as simulações dizem

- No tema 8, 6 de 8 personas chamaram o aviso de encerramento de "promessa no papel". Os Termos prometem, mas o site não tem como cumprir sem trabalho manual.

### O que já existe

- **Termos, seção "Se o Formandos for encerrado"** (ADR-0009, item 6): aviso a todos por email e numa faixa no site, com 60 dias de antecedência. Durante esses 60 dias, não se cria turma nova; o resto continua funcionando, inclusive exportar o registro e baixar os próprios dados.
- A ADR-0009 deixou a faixa e o email "só no texto": "uma variável de ambiente e um script com `enviarEmail`, que já existe".
- **Faixa de turma arquivada** no `AppShell`, que serve de modelo.
- **Teto diário de emails** (ADR-0006) e `lembretes_enviados` para não repetir.

### Forças em jogo

- **Pode nunca acontecer.** O mecanismo precisa ser barato.
- **Quando acontecer, precisa funcionar de primeira**, para todos, dentro do teto diário.

## Decisão

### 1. Faixa por variável de ambiente

- Variável `ENCERRAMENTO_EM=AAAA-MM-DD`. Sem ela, nada muda.
- Com ela, o `AppShell` e a vitrine mostram a faixa: "O Formandos será encerrado em dd/mm. Baixe seus dados em Minha conta e o registro da turma."
- `criarTurma` recusa turma nova, com a mesma frase.

### 2. Email por script

- Script `scripts/encerramento.mjs`, rodado à mão por quem mantém o site.
- Manda o aviso a todos os usuários com email confirmado, **mesmo a quem desligou os emails** (como o aviso de exclusão da turma, ADR-0009).
- Envia em lotes que cabem no teto diário. Rodado de novo no dia seguinte, continua de onde parou.
- Marca quem já recebeu para não repetir. A proposta é reaproveitar `lembretes_enviados`, com o tipo novo `encerramento`. Se a chave da tabela (que exige turma) não servir, uma tabela pequena só para isso.

### 3. Termos

A seção "Se o Formandos for encerrado" passa a citar o mecanismo: a faixa em todas as telas e o email a todos com conta.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Tela para o master ligar o encerramento | Mais trabalho para algo que talvez nunca aconteça. A variável resolve. |
| Email automático pela rodada de lembretes | Mistura um envio único e raro com a rodada de hora em hora. O script é mais fácil de conferir. |
| Deixar como está (só texto) | É exatamente a crítica do tema 8. |

## Consequências

**Fica melhor**
- A promessa dos Termos passa a ter mecanismo pronto e testado.

**Fica pior ou mais difícil**
- Mais um script para manter.
- Com uma base grande, o aviso leva vários dias por causa do teto diário. Por isso o prazo de 60 dias.

**Arquivos**
- `app-shell.tsx` e a vitrine (faixa).
- `src/actions/turmas.ts` (`criarTurma`).
- `scripts/encerramento.mjs` (novo) e `src/lib/email.ts` (modelo do aviso).
- `db/schema.sql`, só se a marcação precisar de tipo ou tabela nova.
- `/termos`.

**Teste de fluxo**
- Passo no E2E com a variável ligada: a faixa aparece e criar turma é recusado.
- Rodar o script contra o Mailpit duas vezes e conferir que ninguém recebe duas vezes.

## Para decidir

- Nada além da aprovação. O item já estava prometido na ADR-0009.

### Andamento (2026-11-20)

Feita. Diferenças em relação ao texto acima:

- **O email sai por uma rota, e o script só a chama.** Um `.mjs` não consegue importar o envio de email do site (TypeScript, com `server-only`). Então `scripts/encerramento.sh` faz `POST /api/encerramento` com o mesmo `Authorization: Bearer $CRON_SECRET` dos lembretes, lido do ambiente ou do `.env.local`. Sem `CRON_SECRET`, a rota não existe (404); sem `ENCERRAMENTO_EM`, recusa (409). A resposta diz quantos foram enviados e quantos faltam.
- **Tabela própria `avisos_encerramento`**, e não `lembretes_enviados`: a chave daquela tabela exige turma, e o aviso vai também a quem não tem turma. A marca some junto com a conta.
- **Quem recebe:** todo usuário com email confirmado, mesmo quem desligou os emails da turma. Um por vez, até o teto diário; rodado de novo no dia seguinte, continua de onde parou.
- **Faixa no layout raiz** (`FaixaEncerramento`), e não no `AppShell`: assim aparece em todas as telas, inclusive a vitrine, o login e os Termos. Some na impressão.
- **Data inválida não liga nada:** `lerDataEncerramento` aceita só `AAAA-MM-DD` que exista no calendário. Melhor não mostrar faixa do que mostrar data errada.
- **Variável lida no servidor:** no Docker (`next dev`) vale ao recriar o app. Num build de produção, as páginas estáticas guardam o valor do momento do build: defina a variável antes de gerar o build.
- **Termos, seção 7:** dizem que o email vai a todos com conta, mesmo a quem desligou os emails, e que a faixa fica no topo de todas as telas. `.env.example` explica a variável.
- Testes: `typecheck`, `npm test` (348; 6 novos em `encerramento.test.ts` e no email). Grupo novo `encerramento` em `fluxos.mjs`, fora da lista padrão (ver `scripts/teste/README.md`): faixa na vitrine e no dashboard, turma nova recusada, aviso por email uma vez só e rota recusando sem segredo. No Docker com `ENCERRAMENTO_EM=2099-03-01`, 3 de 3. O `scripts/encerramento.sh` rodado duas vezes: 7 enviados, depois 0.
