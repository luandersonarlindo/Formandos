# ADR-0015: Leitor de tela nas telas de voto, presença e evento (item 3.5)

**Status:** Aceito
**Data:** 2026-11-14
**Decisores:** grupo do Formandos
**Origem:** `docs/simulacoes/levantamento.md`, item 3.5 (achado I, "acessibilidade não testada", em 4 de 10 simulações: 1, 2, 4 e 8). O levantamento marca o achado como "verificar": nenhuma persona provou um defeito, elas apontaram que ninguém tinha testado com leitor de tela.

## Contexto

### O que já existe

- Link "Pular para o conteúdo", `<main id="conteudo">`, um `h1` por página e `lang` no documento.
- Formulário de presença com `fieldset` e `legend`, rótulo em cada campo e botão "Remover o acompanhante N, {nome}".
- Opções de voto como `radio` e `checkbox` de verdade, dentro de um `fieldset` com o nome da pergunta.
- Gráfico do relatório com `role="img"` e o resumo dos resultados no `aria-label`, mais "Ver como tabela".
- Mensagens de erro e de sucesso em `role="alert"` e `role="status"`.
- `scripts/teste/auditoria.mjs` mede largura e tamanho do alvo de toque. Não mede nada de leitor de tela.

### O que foi medido

Em 14/11/2026 as telas foram abertas a 360 px no Chrome, com dados fictícios, e a **árvore de acessibilidade** foi lida pelo protocolo DevTools (`Accessibility.getFullAXTree`). É a mesma árvore que o TalkBack recebe do Chrome no Android. Telas: dashboard (card do evento e de presença), diálogo de presença, `/votacoes`, `/votacoes/[catalogoId]` e `/votacoes/relatorio`. A página pública do evento (`/evento/[token]`) e `/duvidas` não foram lidas; entram na sonda da seção 4.

| # | Achado | Onde | Efeito para quem usa leitor de tela |
|---|---|---|---|
| 1 | Título de card não é título. `CardTitle` é um `div` (53 usos). O dashboard inteiro tem 1 título, o `h1`. | `src/components/ui/card.tsx` | Navegar por títulos, que é o jeito comum de percorrer uma página, não acha "Você vai ao evento?", "Programação da festa" nem "Sua participação". |
| 2 | Título da pergunta não é título. | `enquete-card.tsx`, `/votacoes/relatorio` | Com 23 perguntas, a pessoa pula de categoria em categoria (`h2`), mas não de pergunta em pergunta. |
| 3 | Ao remover um acompanhante, o foco se perde: volta para a caixa do diálogo. | `form-presenca.tsx` | A pessoa volta para o começo do diálogo e precisa andar tudo de novo. |
| 4 | Ao adicionar um acompanhante, o foco fica no botão "Adicionar acompanhante". | `form-presenca.tsx` | O campo novo aparece **antes** do botão; a pessoa tem de voltar para achar. |
| 5 | Contagem regressiva em seis pedaços soltos: "39", "dias", "23", "horas", "59", "min". | `contagem-regressiva.tsx` | Seis toques para ouvir uma informação, com número separado da unidade. |
| 6 | "N de M votaram" é dito duas vezes em cada pergunta: no `aria-label` da barra e no texto ao lado. | `enquete-card.tsx`, cards de resumo do dashboard | Repetição em 23 perguntas. |
| 7 | Dois avisos a cada opção marcada: o selo "Respondida" (`role="status"`) e a barra do rodapé ("N de 23 respondidas · alterações não salvas"). | `enquete-card.tsx`, `form-votacao-catalogo.tsx` | O leitor fala duas coisas por cima da opção que a pessoa acabou de marcar. |
| 8 | O texto de dentro do gráfico ("1 · 100%", nome de cada opção) aparece de novo depois do resumo. | `grafico-enquete.tsx` | Resultado lido duas vezes. |
| 9 | "Ver como tabela" não diz de qual pergunta. | `/votacoes/relatorio` | 23 botões com o mesmo nome na lista de controles. |

O que a medição mostrou **funcionando**: nome e estado de todos os campos de voto e de presença, o diálogo de presença (nome, descrição e foco inicial na primeira opção), a lista de categorias como navegação com nome, e o resumo em texto do gráfico.

### Forças em jogo

- **A árvore do Chrome não é o TalkBack.** Ela prova estrutura, nome e foco. Não prova a ordem dos gestos, a fala em português, nem o comportamento do VoiceOver, que usa o Safari.
- **Ninguém do grupo usa leitor de tela no dia a dia.** O teste real feito por nós é de quem está aprendendo a ferramenta.
- **O voto é a tela mais longa do site** (23 perguntas no catálogo padrão). É onde o custo de cada repetição se multiplica.
- **Mudança em `CardTitle` atinge 53 lugares.**

## Decisão

### 1. Título de card vira título de verdade, escolhido em cada uso

- `CardTitle` ganha a propriedade `nivel` (`2`, `3` ou `4`). Com ela, vira `h2`, `h3` ou `h4`, com a mesma aparência. Sem ela, continua `div`.
- Nesta ADR recebem nível: os cards do dashboard (`h2`), a pergunta em `enquete-card.tsx` (`h3`, abaixo do `h2` da categoria) e a pergunta no relatório (`h3`).
- Os outros usos ficam como estão e entram na lista de pendências da seção 5. Trocar os 53 de uma vez criaria títulos fora de ordem em telas que não foram lidas.

### 2. O foco acompanha a lista de acompanhantes

- **Adicionar:** o foco vai para o campo "Nome do acompanhante N" que acabou de aparecer.
- **Remover:** o foco vai para o "Remover" da linha seguinte; se era a última, para o da linha anterior; se a lista ficou vazia, para "Adicionar acompanhante".
- O aviso "N acompanhantes na lista" (`role="status"`) continua.

### 3. Uma informação, uma leitura

- **Contagem regressiva:** o bloco visual fica escondido do leitor (`aria-hidden`) e um texto só para leitor de tela diz a frase inteira: "Faltam 39 dias, 23 horas e 59 minutos para o evento". Sem região viva: a contagem muda a cada minuto e não deve ser anunciada sozinha.
- **Barras de progresso com o mesmo texto ao lado:** a barra fica escondida do leitor e o texto visível é o que se lê. Vale para "N de M votaram" na pergunta e para os cards de resumo do dashboard.
- **Selo "Respondida":** perde o `role="status"`. O aviso de que algo mudou fica só na barra do rodapé.
- **Gráfico:** o conteúdo do SVG fica escondido do leitor; continuam o resumo no `aria-label` e a tabela.
- **"Ver como tabela":** ganha o nome da pergunta para o leitor ("Ver como tabela: {pergunta}"). Na tela, o texto não muda.

### 4. Sonda automática de leitor de tela

Arquivo novo `scripts/teste/leitor.mjs`, no molde de `auditoria.mjs` (mesmo `navegador.mjs`, sem dependência nova). Para cada tela pedida, lê a árvore de acessibilidade e **falha** quando encontra:

- controle (botão, link, campo, opção) sem nome;
- página sem `h1` ou com nível de título pulado;
- dois controles com o mesmo nome dentro do mesmo formulário ou lista;
- foco fora de um campo ou botão depois de adicionar e depois de remover um acompanhante.

Com `--ler`, imprime a tela na ordem de leitura, para revisão por uma pessoa. Entra um passo no grupo `participante` de `fluxos.mjs` que roda a sonda no dashboard, no catálogo, no relatório, em `/duvidas` e na página pública do evento.

### 5. Teste com leitor de tela de verdade, com roteiro

Documento novo `docs/acessibilidade/roteiro-leitor-de-tela.md`:

- como ligar e desligar o TalkBack (Android) e o VoiceOver (iPhone), e os cinco gestos necessários;
- o acesso pelo celular na rede local (`LAN_ORIGIN`, README);
- **seis tarefas**, cada uma com o que se espera ouvir: entrar com email e senha; achar a data e o local do evento; confirmar presença com um acompanhante e remover; votar em duas perguntas e salvar; ouvir o resultado de uma pergunta no relatório; abrir a página pública do evento;
- uma tabela para anotar, por tarefa: conseguiu ou não, onde travou, o que o leitor falou.

Quem faz: uma pessoa do grupo no TalkBack. O VoiceOver entra se alguém do grupo tiver iPhone; se não tiver, fica registrado como **não testado**. O resultado é anotado no próprio roteiro e o que aparecer vira correção nesta ADR ou pendência com dono.

O mesmo documento guarda a lista dos usos de `CardTitle` que ficaram sem nível.

### 6. Fora desta ADR

- Contraste de cor, Libras e baixa visão (o resto do achado I). Contraste e ampliação já têm medição parcial em `auditoria.mjs`; ficam para um item próprio.
- Telas da comissão (`/admin/...`) e do master. O achado veio de formandos e familiares.
- Teste com pessoa que usa leitor de tela no dia a dia. É a validação que vale, e fica na lista do que validar com pessoas reais (seção 6 do levantamento).
- Declaração de conformidade com a WCAG. O site não passa a dizer que é acessível.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Só o teste manual com TalkBack, como está escrito no item 3.5 | Nove defeitos já apareceram sem celular. Testar na mão antes de corrigir gasta o teste com o que a máquina já achou. |
| Só a sonda automática, sem celular | A árvore não mostra a ordem dos gestos, a fala nem o VoiceOver. O item pede teste real. |
| Trocar `CardTitle` para `h2` em todos os 53 usos | Card dentro de seção com `h2` viraria irmão do próprio pai. Título errado atrapalha mais do que título ausente. |
| Instalar `axe-core` ou Lighthouse | Dependência nova para regras que, nas três telas, se resumem a nome, título e foco. O `navegador.mjs` já lê a árvore. |
| Região viva na contagem regressiva | Falaria sozinha a cada minuto. |
| Tirar o aviso do rodapé e manter o selo "Respondida" como aviso | O rodapé é o único que diz "alterações não salvas", que é o que evita sair sem salvar. |

## Consequências

**Fica melhor**
- Dá para percorrer o dashboard e as 23 perguntas por títulos.
- O foco não se perde na lista de acompanhantes.
- Cada informação é lida uma vez.
- Regressão de nome, título e foco passa a quebrar o teste de fluxo.
- Existe um roteiro para repetir o teste real a cada mudança grande.

**Fica pior ou mais difícil**
- Quem criar card novo precisa escolher o nível do título. Esquecer não quebra nada, e a sonda só pega nas telas que ela lê.
- A sonda soma tempo ao grupo `participante`, que já é o bloco mais demorado.
- O teste real depende de uma pessoa do grupo aprender o TalkBack; o resultado é de iniciante.
- Sem iPhone no grupo, o VoiceOver continua sem teste.

**Arquivos**
- `src/components/ui/card.tsx`; `enquete-card.tsx`, `form-votacao-catalogo.tsx`, `form-presenca.tsx`, `contagem-regressiva.tsx`, `grafico-enquete.tsx`; `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/votacoes/relatorio/page.tsx`; `scripts/teste/leitor.mjs` (novo), `scripts/teste/fluxos.mjs`, `scripts/teste/README.md`; `docs/acessibilidade/roteiro-leitor-de-tela.md` (novo).
- Sem mudança de banco, de rota ou de texto visível.

**Entrega em duas partes**
1. Correções das seções 1 a 3 e a sonda da seção 4.
2. Roteiro, teste no celular e correção do que o teste achar.

**Teste de fluxo**
- Parte 1: a sonda passa no dashboard, no catálogo e no relatório; o foco vai para o campo novo ao adicionar e para o botão certo ao remover; o bloco `participante,app,admin` continua passando.
- Parte 2: roteiro preenchido para o TalkBack, com as seis tarefas.
