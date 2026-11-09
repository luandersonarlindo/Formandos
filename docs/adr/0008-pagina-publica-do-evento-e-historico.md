# ADR-0008: Página pública do evento e histórico visível (itens 2.2 e 2.5)

**Status:** Aceito
**Data:** 2026-11-09
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, itens 2.2 (achados F, A e D) e 2.5 (achado D, "sem histórico visível de alteração", em 7 simulações). Na simulação 8 (semana da festa), **convidados e família sem acesso** apareceu em 7 de 8 personas: na noite simulada, familiares foram ao portão errado e o fornecedor ficou sem o horário novo. As recomendações 3 e 4 foram uma **página pública do evento, sem login, com "atualizado em"** e **"mudou em dd/mm: entrada de 20h para 19h"** (`docs/simulacoes/2026-11-08-5/relatorio.md`). O item 2.4 (congelar o resultado ao fixar) já foi resolvido pela fotografia da ADR-0003.

## Contexto

### O que já existe

- Os dados do evento ficam em `turmas` (nome, data e término, local, endereço, link do mapa, traje, observações do local) e a programação em `programacao`. Só membros logados veem, no dashboard (`getDadosEvento`, `listarProgramacao`, `linkComoChegar`).
- `salvarEvento` (`src/actions/evento.ts`) já lê o estado anterior e calcula o que mudou em data, horário, local e endereço (`mudancasEvento`, ADR-0006), mas **só manda email**: a mudança não fica gravada em lugar nenhum.
- O código de convite **dá entrada na turma**. Não pode ser o link que circula entre família e fornecedores.
- `proxy.ts` só protege as rotas do `matcher`; uma rota fora dele é pública.
- A auditoria (`src/lib/auditoria.ts`) tem vocabulário fechado e a lista `ACOES_VISIVEIS_TURMA` (ADRs 0003 e 0005). Ela já registra decisões, regras, valores de opção, plano de parcelas, pagamentos, papéis, remoções, arquivamento e downloads. Não registra mudança no evento nem no valor de fornecedor.
- A turma já vê o histórico das decisões (dashboard) e as mudanças no plano (Minha situação). A comissão não tem uma tela com tudo junto.

### Forças em jogo

- **Alcance:** o link tem de funcionar para quem não tem conta: avó, tio, motorista, cerimonial.
- **Privacidade:** a página pública não pode ter nome de membro, quem vai, quanto alguém pagou nem nada da turma além do evento.
- **Controle:** a comissão decide se o link existe e pode trocá-lo se ele vazar.
- **Rastro:** quem já sabia o horário antigo precisa perceber que mudou.

## Decisão

### 1. Link público do evento, com código próprio

```sql
alter table turmas add column if not exists token_publico varchar(32) unique;  -- nulo = página desligada
alter table turmas add column if not exists evento_atualizado_em timestamptz;
```

- Código aleatório de 22 caracteres (128 bits, base64url), **diferente do código de convite**. Com ele, ninguém entra na turma nem vê nada além do evento.
- Rota nova **`/evento/[token]`** (`src/app/(publico)/evento/[token]/page.tsx`), sem login, só leitura. Fica fora do `matcher` do `proxy.ts`.
- Mostra: "Formatura {nome da turma}", data e horário (início e término), local, endereço, botão "Como chegar", traje, observações do local, programação, **"Atualizado em dd/mm às hh:mm"** e, quando houver, **a última mudança** ("Mudou em 08/11: horário era 20:00, agora é 19:00").
- **Não mostra:** membros, comissão, presença, votos, dinheiro, avisos, dúvidas.
- `robots: noindex, nofollow` e `referrer: no-referrer`: o link não aparece em busca nem vaza o endereço ao clicar em "Como chegar".
- Código inexistente ou página desligada: 404 com "Este link não existe ou foi desligado pela comissão." Turma arquivada: a página continua no ar, com a nota "Evento encerrado", até a turma ser excluída (o plano de fim, ADR-0009, decide quando).

### 2. A comissão liga, troca e desliga

- No card "Dados do evento" do dashboard da comissão (`evento-admin.tsx`), um bloco **"Link público do evento"**:
  - desligado: botão "Criar link para família e fornecedores";
  - ligado: o link, "Copiar link", "Gerar outro link" (o anterior para de funcionar) e "Desligar".
- Actions novas em `src/actions/evento.ts`: `ligarPaginaPublica`, `trocarLinkPublico`, `desligarPaginaPublica`, todas com auditoria (`evento.link_publico`).
- O texto "Mandar para o grupo" do evento (ADR-0004) passa a usar o link público quando ele está ligado, e o email "Mudou" (ADR-0006) também: são os dois lugares de onde o link chega à família.

### 3. Mudança no evento fica gravada e aparece

- `salvarEvento` grava `evento.alterado` na auditoria com as mudanças (`campo`, `antes`, `depois`) já calculadas por `mudancasEvento`. Essa ação entra em **`ACOES_VISIVEIS_TURMA`**: não tem dado de pessoa.
- `evento_atualizado_em` muda quando qualquer dado do evento ou da programação muda de fato (comparação no SQL, com `is distinct from`), não a cada clique em "Salvar".
- O card do evento no dashboard da turma e a página pública mostram a última mudança de data, horário, local ou endereço dos últimos 14 dias, em destaque. Mais antiga que isso, fica só o "Atualizado em".

### 4. Histórico visível

- **Valor e situação de fornecedor:** `atualizarFornecedor` (`src/actions/terceiros.ts`) grava `fornecedor.alterado` quando o valor ou a situação (cotando, contratado, descartado) mudam, com antes e depois. É restrito à comissão, como o próprio orçamento.
- **Tela "Histórico" da comissão:** `/admin/turma/historico`, com todas as ações da turma em ordem, filtro por assunto (decisões e votações, evento, dinheiro, membros e papéis, turma) e paginação. Cada linha é uma frase ("Maria fixou 'Buffet B' fora da regra. Motivo: …"), feita por uma função pura `descreverAcao(acao, detalhe)` (`src/lib/historico-texto.ts`, com teste) que substitui o switch de `historico-decisoes.tsx`.
- **Quem vê o quê no histórico:**

  | Ações | Turma (dashboard, Minha situação, página pública) | Comissão (`/admin/turma/historico`) | Tesouraria |
  |---|---|---|---|
  | decisão, regra, valor de opção, plano, evento | sim | sim | sim |
  | fornecedor, papel, tesouraria, membro removido, turma arquivada, planilha baixada, link público | não | sim | sim |
  | pagamentos (lançar, informar, confirmar, recusar, editar, excluir) | não | **não** | sim |

  A linha de pagamento fica só com a tesouraria pela mesma regra da ADR-0005: os outros admins não veem valores individuais.
- `conta.excluida` não aparece em nenhuma tela de turma (não tem turma e guarda email).

## Opções consideradas

### Endereço da página pública

| Opção | Prós | Contras |
|---|---|---|
| A. `/evento/{código de convite}` | um código só | quem tem o link entra na turma; o link vai circular entre família e fornecedores |
| B. `/evento/{id da turma}` | sem coluna nova | não dá para desligar nem trocar; o id aparece em outros lugares |
| **C. Código próprio, que a comissão liga, troca e desliga (escolhida)** | só leitura; vazou, troca | mais uma coluna e três botões |

### O que a página pública mostra

| Opção | Prós | Contras |
|---|---|---|
| **A. Só o evento e a programação (escolhida)** | serve à família e ao fornecedor; nada pessoal | o fornecedor não vê o número de pessoas confirmadas |
| B. Evento + total de pessoas esperadas | o buffet e o cerimonial pedem esse número (simulação 8) | o número muda e é da organização, não da família; a comissão manda pelo grupo ou pela planilha (ADR-0007). Pode virar opção depois |

### Onde guardar o histórico do evento

| Opção | Prós | Contras |
|---|---|---|
| A. Tabela `historico_evento` | consulta direta | duplica a auditoria, contra o mapa de reaproveitamento |
| **B. Auditoria (`evento.alterado`) + `evento_atualizado_em` (escolhida)** | mesmo lugar de todo o resto; a turma já lê parte da auditoria por lista fechada | a "última mudança" é uma consulta na auditoria |

## Análise de trade-offs

A página pública é o que faltou na noite simulada da simulação 8: o email e o grupo chegam a quem é da turma, mas não a quem vai à festa. Um link só de leitura, que a comissão controla, é o jeito mais barato de alcançar essas pessoas sem criar conta para ninguém e sem expor nada da turma.

O risco é o link circular além do previsto. Como ele só tem o que já seria dito no convite impresso (data, local, traje), o dano é pequeno, e a comissão pode trocar o código.

No histórico, a decisão importante é a tabela de quem vê o quê. Ela mantém as regras já tomadas (voto identificado só para a comissão, valor individual só para a tesouraria) e reúne o resto num lugar só, que é o que a comissão das simulações 3 e 9 pediu para provar "quem mudou o quê".

## Consequências

- **Fica mais fácil:** a família e o fornecedor sabem horário, local e traje sem depender de ninguém repassar; quem já sabia o horário antigo vê "Mudou"; a comissão prova quem mudou o quê.
- **Fica mais fácil também:** o plano de fim (ADR-0009) usa o mesmo histórico e decide o fim da página pública; o registro da turma (ADR-0007) ganha o histórico completo da comissão.
- **Fica mais difícil:** mais uma página pública para cuidar (sem dado pessoal, sem formulário); cada ação nova na auditoria precisa entrar na tabela de quem vê o quê.
- **Rever depois:** total de pessoas esperadas na página pública (opção da comissão); QR code do link para o convite impresso; aviso de mudança na própria página para quem já abriu antes.

## Ações

1. [x] Backup (`pg_dump`). `db/schema.sql`: `turmas.token_publico` (único) e `turmas.evento_atualizado_em`.
2. [x] `src/lib/auditoria-acoes.ts`: `evento.alterado` (visível à turma), `evento.link_publico` e `fornecedor.alterado` (comissão); conjuntos por público (`turma`, `comissao`, `tesouraria`) com teste.
3. [x] `src/lib/historico-texto.ts` (novo, puro, com teste): `descreverAcao` para todas as ações; `historico-decisoes.tsx` passa a usar.
4. [x] `salvarEvento`: grava `evento.alterado` e atualiza `evento_atualizado_em` só quando algo muda; ações da programação também atualizam. `atualizarFornecedor`: grava `fornecedor.alterado`.
5. [x] Link público: `ligarPaginaPublica`, `trocarLinkPublico`, `desligarPaginaPublica`; bloco no card "Dados do evento"; "Mandar para o grupo" e o email "Mudou" usam o link público quando ligado.
6. [x] `/evento/[token]`: página pública (dados, programação, "Atualizado em", última mudança, "Evento encerrado"), `noindex`, `no-referrer`, 404 próprio.
7. [x] Última mudança no card do evento do dashboard da turma.
8. [x] `/admin/turma/historico`: lista com filtro e paginação, respeitando a tabela de quem vê o quê; link no menu da comissão ou em `/admin/turma`.
9. [x] Textos revisados com `design:ux-copy`; página pública e histórico conferidos em 360px; `typecheck`, `npm test` e passo novo em `fluxos.mjs` (ligar o link, abrir sem login, mudar o horário e ver "Mudou", trocar o link e o antigo dar 404, histórico da comissão sem pagamentos para quem não é tesouraria).

### Andamento (2026-11-09)

Todas as ações feitas.

- `src/lib/auditoria-acoes.ts`: `evento.alterado` (visível à turma), `evento.link_publico` e `fornecedor.alterado`; `ACOES_SO_TESOURARIA`, `ACOES_FORA_DO_HISTORICO` e `acoesVisiveis(publico)`, com teste.
- `src/lib/historico-texto.ts` (`descreverAcao`, 7 testes, inclusive "toda ação tem frase" e "nunca mostra email"); `historico-decisoes.tsx` passou a usar.
- `salvarEvento` grava `evento.alterado` e só atualiza `evento_atualizado_em` quando algum campo muda (`is distinct from`); as três ações da programação também atualizam. `atualizarFornecedor` grava `fornecedor.alterado`.
- Link público: `ligarPaginaPublica`, `trocarLinkPublico`, `desligarPaginaPublica` (código de 128 bits em base64url); bloco `LinkPublicoEvento` no card "Dados do evento"; `textoEvento` e o email "Mudou" usam o link público quando ligado.
- `/evento/[token]` com `not-found` próprio, `robots: noindex, nofollow` e `referrer: no-referrer`; `src/lib/evento-publico.ts` (`getEventoPublico`, `getUltimaMudancaEvento`). Aviso "Mudou em" no dashboard da turma.
- `/admin/turma/historico` com `listarHistoricoTurma` (filtro por assunto, 30 por página, nome da pessoa citada), link em `/admin/turma`.
- Testes: `typecheck`, `npm test` (294). Passo "ADR-0008" no grupo `admin` de `fluxos.mjs`. Grupo `admin`: 30 de 37, só as 7 falhas que já existiam. Página pública e histórico conferidos em 360px.
- Ambiente: `.next/dev/types` (gerado por um `next dev` antigo no host e lido pelo `tsconfig`) tinha rotas velhas e quebrava o `tsc`; foi apagado (é gerado e ignorado pelo git).

