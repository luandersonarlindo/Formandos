# C-admin — auditoria de simplificação UX/UI (área `/admin`)

Escopo lido: `src/app/(admin)/admin/` (layout, page, membros, presenca, presenca/lista, turma, turma/historico, turma/registro, votacoes, votacoes/nova, votacoes/[catalogoId], votacoes/votos/[enqueteId]) e os componentes que essas telas usam. `evento-admin`, `link-publico-evento`, `acessibilidade-local`, `form-sair-turma` e `mudancas-plano` **não aparecem em nenhuma rota `/admin`**: são usados em `/dashboard` e `/minha-situacao` (`src/app/(app)/dashboard/page.tsx:24,26,449,497`; `minha-situacao/page.tsx:8,288`). Eles aparecem só nas "Mudanças transversais", porque isso já mostra um problema de arquitetura da informação: a comissão edita o evento no dashboard e a presença em `/admin`.

Caminhos abaixo são relativos a `src/app/(admin)/admin/` ou a `src/components/features/`.

## Visão geral do grupo

- **Fileira de botões repetida em cada item da lista.** No editor de catálogo, cada pergunta tem até 9 controles visíveis (`votacoes/[catalogoId]/page.tsx:324-531`). Cada membro tem até 4 botões, mais os badges (`membros/page.tsx:240-328`). Multiplicado pelo tamanho da lista, isso vira a maior fonte de ruído da área admin, e no D-pad são dezenas de paradas de foco por tela.
- **A ação principal do produto fica escondida atrás do nome errado.** "Fixar decisão", que é o diferencial citado em PRODUCT.md (Positioning), só existe na página que o catálogo chama de "Ver quem votou" (`[catalogoId]/page.tsx:325-328`). Depois de fixada, a decisão **não diz qual opção foi escolhida** (`votos/[enqueteId]/page.tsx:102-185, 188-225`). Isso vai contra o princípio 3, "Decisão explícita".
- **Configuração em Card + parágrafo longo + botão que abre um Dialog com um campo só.** Isso acontece no limite de acompanhantes, no prazo de presença (`presenca/page.tsx:95-185`), no uso do catálogo padrão (`votacoes/page.tsx:44-90`, um booleano num NativeSelect dentro de um Dialog) e na regra da votação. São 2–3 cliques e muito texto para mudar um valor.
- **O mesmo padrão aparece em versões diferentes.** As pílulas de filtro são copiadas à mão com classes iguais (`presenca/page.tsx:187-209`, `turma/historico/page.tsx:213-234`). Para confirmar algo destrutivo há três jeitos: `ConfirmarExclusao` em dialog, `FormAcao` inline com o campo de digitar o nome sempre à vista (`turma/page.tsx:146-159`) e submit direto sem confirmação (`membros/page.tsx:252-258`). O `FormDialog` não tem "Cancelar" (`form-dialog.tsx:79-88`), e o `ConfirmarExclusao` tem (`confirmar-exclusao.tsx:160-168`).
- **Texto explicativo repetido**: no card, no Dialog e no aviso fixo da página. Exemplos: `membros/page.tsx:217-221` repete o aviso que o diálogo de remover já mostra (`:316-322`). `turma/page.tsx:80-84` repete `:121`. `presenca/page.tsx:102-106` repete `:121`.
- **Accent (`--vitrine-a`, o indigo) usado como enfeite**: em ícones de estatística (`membros/page.tsx:64-74`), em ícones de título de card (`[catalogoId]/page.tsx:100-105,121,156`) e no fundo `vitrine-fundo-hero` em telas internas (`membros:79`, `presenca:59`, `votos:85`). Isso fere a "One Voice Rule" de DESIGN.md.

## Por tela

### `/admin` — `page.tsx`
- **Objetivo:** nenhum. A rota só faz `redirect("/dashboard")` (`page.tsx:9-11`) para quem guardou o endereço antigo.
- **Inventário:** 0 elementos.
- **Fricções:** nenhuma para o usuário. O único efeito é que o título do layout, "Administração · turma" (`layout.tsx:28`), não tem página inicial própria.
- **Proposta:** manter como está. Se a área admin ganhar um "início" (ver Decisões, D1), esta rota é o lugar natural para ele.
- **Componentes:** —
- **Esforço P · Impacto baixo · Risco nenhum.**

### `/admin/membros` — `membros/page.tsx`
- **Objetivo:** pôr a turma para dentro (convidar) e ajustar o papel de quem já entrou. Quem usa: a comissão.
- **Inventário:** cabeçalho com 3–4 estatísticas. Card do código com 3 botões (`:102-114`). Card "Convidar por lista" com textarea, 2 botões e um painel recolhível com 2 botões por convidado (`:119-174`). Busca com 2–3 controles (`:176-201`). Aviso fixo (`:217-221`). Lista de Cards com até **4 botões por membro** (`:251-327`). Paginação. São cerca de 8 controles fixos mais 4 por membro.
- **Fricções:**
  - `:240-328`: por membro aparecem "Pôr/Tirar da tesouraria", "Promover/Tornar participante", "Tornar observador/Voltar a participante" e "Remover", lado a lado e todos com o mesmo peso. Numa lista de 40 pessoas são cerca de 160 botões. No D-pad isso fica impraticável.
  - `:252-258`: tesouraria muda com um clique e sem confirmação. Papel pede Dialog (`:261-285`). Dois pesos diferentes para mudanças de poder parecidas.
  - `:217-221`: o aviso sobre remover fica sempre na tela. A mesma informação já está no diálogo (`:316-322`).
  - `:79-174`: convidar ocupa dois cards grandes acima da lista. Em visitas repetidas, quando a turma já entrou, a lista de membros fica fora da primeira dobra.
  - `:59-77`: as estatísticas têm ícones no accent, um por número.
- **Proposta:**
  - **Ação primária: "Convidar".** Juntar código, mensagem e lista num único bloco com `Tabs` ("Código e link" | "Por email"). Quando a turma já tem membros, o bloco pode ficar recolhido: mostra só o código compacto e o botão "Copiar mensagem de convite", que é o caminho mais comum (`botao-convite.tsx`). "Gerar novo código" vai para um menu "…" porque é raro e destrutivo.
  - A lista de "Convidados que ainda não entraram" continua recolhível. Pode virar um contador com link, abrindo um `Sheet` ou `Drawer`.
  - **Linha de membro:** avatar, nome e email, badge de papel e badge de tesouraria, e **um** botão "…" (`DropdownMenu`) com: Promover/Tornar participante, Tornar observador/Voltar a participante, Pôr/Tirar da tesouraria, separador, "Remover" em destructive. Todas as ações continuam abrindo os mesmos dialogs (as regras de negócio não mudam). Pôr ou tirar da tesouraria passa a confirmar em Dialog, como o papel.
  - Remover o aviso fixo `:217-221`.
  - Estatísticas como texto neutro numa linha ("32 membros · 3 administradores · 28 participantes · 1 observador"), sem ícones no accent.
- **Componentes:** lista de `Card` → `Item` (ou `Table` em telas ≥ md) + `DropdownMenu`. Os 2 cards de convite → um `Card` com `Tabs`. Busca → `Input Group` (ícone embutido) e a busca dispara ao enviar o formulário. O botão "Limpar" pode virar o ícone X dentro do campo. `EstadoVazio` → `Empty`.
- **Esforço M · Impacto alto · Risco:** `scripts/teste/fluxos.mjs:792,2608-2610,2763` clicam em "Promover" e "Tornar observador" como `button` dentro do escopo do nome. Num `DropdownMenu` eles viram `menuitem` e esses fluxos precisam de ajuste. Os seletores `ul[data-grupo] > li` (`fluxos.mjs:637,2263`) e `data-convidado` (`:139`) também precisam continuar existindo. A11y: o gatilho "…" precisa de `aria-label="Ações de {nome}"`. O D-pad funciona com as setas do Radix.

### `/admin/presenca` — `presenca/page.tsx`
- **Objetivo:** saber quantas pessoas vão (para o buffet e o espaço) e quem falta responder.
- **Inventário:** card de destaque com o número, 3 linhas de texto e 2 botões (`:59-93`). 2 cards de configuração, cada um com um parágrafo longo e um botão que abre Dialog (`:95-185`). 5 pílulas de filtro (`:187-209`). Lista de Cards com 1–3 badges e texto (`:219-265`). Paginação.
- **Fricções:**
  - `:95-185`: limite e prazo ocupam dois cards cheios entre o número e a lista. Quem abre a tela para ver quem confirmou precisa rolar por dois parágrafos de regra. O texto de `:102-106` se repete no Dialog (`:121`).
  - `:67-79`: o mesmo número aparece em três frases diferentes (membros + acompanhantes, talvez/pendente, adultos/crianças). É informação densa e solta.
  - `:187-209`: o código das pílulas é o mesmo do histórico (`turma/historico/page.tsx:213-234`), copiado e colado.
  - `:242-246`: o aviso "acima do limite" usa `amber-*` direto, fora dos tokens (DESIGN.md, Don't, "hardcode").
- **Proposta:**
  - **Ação primária:** "Lista da portaria" (já é `default`, `:82-86`). "Baixar planilha" continua secundário.
  - Juntar limite e prazo numa linha-resumo: "Até 2 acompanhantes por pessoa · respostas até 10/12, 18h", com **um** botão "Regras da presença". Ele abre um Dialog (Drawer no celular) com os dois campos. Como são duas Server Actions (`salvarLimiteAcompanhantes`, `salvarPrazoPresenca`), há duas saídas: um Dialog com duas seções e dois botões de salvar, ou uma action combinada. A segunda mexe no servidor, então só com o aval do dono.
  - O aviso "N respostas acima do limite" sai da descrição do card e vira um `Alert` curto acima da lista, que só aparece quando existe (`:107-113`).
  - Números: o grande fica. As outras três frases viram uma linha de "chips" de contagem (Vão / Talvez / Sem resposta / Adultos / Crianças). Os chips de status podem ser **os próprios filtros**: as contagens já estão nas pílulas (`:205`). Então dá para tirar `:67-72` sem perder nada.
- **Componentes:** 2 `Card` de configuração → 1 linha + `Dialog`/`Drawer`. Pílulas → componente compartilhado `FiltroPilulas` (links com `aria-current`, no visual do `Toggle Group`). Lista → `Item` (ou `Table` com colunas Nome / Resposta / Acompanhantes no desktop). Badge "acima do limite" → `Badge` com uma variante semântica de aviso definida em token.
- **Esforço M · Impacto alto · Risco:** `fluxos.mjs:2263` lê `ul[data-grupo] > li`. A combinação dos dois formulários num só tem risco de regra (as duas actions têm validação própria). A11y: o Dialog novo precisa de dois `fieldset` com `legend`.

### `/admin/presenca/lista` — `presenca/lista/page.tsx`
- **Objetivo:** imprimir a lista de entrada para a portaria.
- **Inventário:** voltar, título, 1 botão "Imprimir", 3 linhas de resumo e uma tabela.
- **Fricções:**
  - `:58-59`: o estado vazio é um `<p>` solto, diferente do `EstadoVazio` usado no resto. Aceitável, porque esta tela é para imprimir.
  - `:44-55`: o resumo repete o de `/admin/presenca`. Aqui faz sentido, porque o papel impresso precisa disso.
- **Proposta:** quase nada. É a tela mais enxuta do grupo. Só aplicar o estilo do `Table` do shadcn (cabeçalho, zebra opcional) para combinar com o resto, mantendo `print:`.
- **Componentes:** `<table>` → `Table` do shadcn (mesma semântica, `caption` mantido).
- **Esforço P · Impacto baixo · Risco:** o CSS de impressão (`print:hidden`, `break-inside-avoid`, `:24,73`) precisa sobreviver à troca.

### `/admin/turma` — `turma/page.tsx`
- **Objetivo:** encerrar o ciclo da turma: exportar o registro, arquivar ou excluir.
- **Inventário:** 3 cards. Exportar tem 2 botões grandes e **até 9 botões de planilha** (`:60-69`; 7 tipos + 2 só da tesouraria, `lib/exportacao.ts:12-26`). Arquivar tem um aviso âmbar e 1–2 botões com Dialog. Excluir mostra o campo "digite o nome" **sempre visível** e um botão destructive (`:146-159`). São cerca de 14 controles.
- **Fricções:**
  - `:59-70`: até 9 botões "X (planilha)" lado a lado. Visualmente pesam mais que o PDF, que é a ação principal.
  - `:55-57`: "Histórico: quem mudou o quê" fica dentro do card de exportação. Não é exportação, e o subtítulo da página (`:33-35`) nem cita o histórico.
  - `:146-159`: a exclusão usa `FormAcao` inline com o campo de confirmação sempre exposto. O resto do app usa `ConfirmarExclusao`, que já suporta `confirmacao={{rotulo, esperado}}` (`confirmar-exclusao.tsx:157-162,254-268`) e só libera o botão quando o texto bate.
  - `:80-84` e `:121`: a explicação de arquivar aparece no card e de novo no Dialog.
- **Proposta:**
  - **Ação primária: "Ver e salvar o registro em PDF".** As planilhas viram **um** botão "Baixar planilha ▾" (`DropdownMenu` com os tipos permitidos e o mesmo filtro de tesouraria).
  - "Histórico" sai do card de exportação e vira um link próprio, ou vai para a sidebar (ver D2).
  - Arquivar e Excluir vão para uma única seção "Encerrar a turma", com dois botões. "Excluir turma" passa a usar `ConfirmarExclusao` com `confirmacao`, então o campo só aparece no Dialog.
  - O card de arquivar guarda só o estado (o aviso da data, `:87-93`) e uma frase. A explicação longa fica no Dialog.
- **Componentes:** botões de planilha → `DropdownMenu`. Card de excluir com `FormAcao` → `ConfirmarExclusao` (que pode ganhar a base do `Alert Dialog`). Aviso âmbar `:88` → `Alert`.
- **Esforço P · Impacto médio · Risco:** os links `download` dentro do `DropdownMenuItem asChild` precisam continuar sendo `<a>`, para o download e o registro de auditoria funcionarem. O id `confirmacao` de `:157` sai da página, então não há colisão com o do `ConfirmarExclusao`.

### `/admin/turma/historico` — `turma/historico/page.tsx`
- **Objetivo:** consultar quem mudou o quê, sem editar nada.
- **Inventário:** voltar, título, 6 pílulas de filtro, contagem, lista (`HistoricoDecisoes`) e paginação.
- **Fricções:**
  - `:213-234`: as pílulas repetem o código de presença.
  - `:205-207`: ícone no accent no h1, enfeite.
- **Proposta:** já está simples. Usar o `FiltroPilulas` compartilhado. No celular, 6 pílulas roláveis funcionam, mas um `Select` de "Assunto" ocuparia menos espaço. Recomendo manter as pílulas, que são melhores no D-pad. Tirar o ícone do h1.
- **Componentes:** pílulas → `FiltroPilulas` (visual do `Toggle Group`, semântica de links). `HistoricoDecisoes` vazio → `Empty`.
- **Esforço P · Impacto baixo · Risco:** baixo.

### `/admin/turma/registro` — `turma/registro/page.tsx` (fora da lista, mas existe)
- Só renderiza `RegistroTurma` com o link de voltar (`:10-13`). Não foi auditado a fundo, porque o mesmo componente serve `/registro` (ADR-0020) e cabe ao grupo que cobre essa rota.

### `/admin/votacoes` — `votacoes/page.tsx`
- **Objetivo:** escolher qual catálogo gerenciar, ou criar um novo.
- **Inventário:** h1 + "Novo catálogo" (`:32-37`). Parágrafo (`:38-42`). Card "Catálogo padrão" com um parágrafo longo e um botão que abre Dialog com `NativeSelect` sim/não (`:44-90`). Grid de cards de catálogo (`:92-120`).
- **Fricções:**
  - `:60-87`: ligar ou desligar o catálogo padrão leva 3 passos (abrir o Dialog, escolher no select, salvar) para um booleano. O texto de `:54-56` se repete em `:64`.
  - `:44-90` + `:93-119`: o catálogo padrão aparece duas vezes, no card de configuração e como card no grid, com o badge "Padrão".
  - `:113-115`: a "chamada" de cada card fica no accent. Com N catálogos, o indigo se repete N vezes.
  - O card mostra só "N perguntas" (`:110-112`). Não diz quantas já foram decididas, que é o que a comissão precisa saber. O dado `decidida` existe por pergunta (`lib/admin.ts:63,160`) mas não chega agregado. Propor isso exige mudar a query, então fica para o dono decidir (D4).
- **Proposta:**
  - **Ação primária: "Novo catálogo".**
  - Tirar o card de configuração. No card do catálogo padrão, dentro do grid, pôr um `Switch` "Mostrar para a turma" (um clique, com a mesma `alternarCatalogoPadrao`). O aviso "desligar não apaga votos" vira a descrição curta do switch.
  - Cards de catálogo → `Item` clicável (nome, badge, "N perguntas"), sem a frase "Editar e ver votos" no accent.
- **Componentes:** `FormDialog` + `NativeSelect` → `Switch` + `Label` (um form pequeno que envia na mudança, ou um botão "Desligar/Ligar"). Grid de `Card` → `Item`.
- **Esforço P · Impacto médio · Risco:** um `Switch` que envia na mudança precisa de um componente de cliente e de feedback (`aria-live`). Sem JS, a alternativa é um botão de submit.

### `/admin/votacoes/nova` — `votacoes/nova/page.tsx`
- **Objetivo:** criar um catálogo, a partir de um modelo ou do zero.
- **Inventário:** voltar, h1, parágrafo, h2, um card por modelo com botão próprio (`:32-57`), h2 "do zero" e um card com input e botão (`:59-76`).
- **Fricções:**
  - O caminho "do zero" usa um formato diferente dos modelos (card com ícone e label redundante "Nome do catálogo" / "Nome", `:65,71`).
  - É uma rota inteira para uma escolha entre N+1 opções.
- **Proposta:** manter a rota, porque é bom poder linkar direto, mas fazer de "Em branco" mais um card no mesmo grid, com o input de nome dentro. Assim o padrão é um só: escolher um card e clicar no botão dele. Opcional: abrir como `Dialog` direto de `/admin/votacoes`, com `Radio Group` de modelos + "Em branco" + campo de nome que só aparece com "Em branco". Fica um passo a menos, mas o esforço é M.
- **Componentes:** card "do zero" → mesmo `Card` dos modelos. `Radio Group` se virar Dialog.
- **Esforço P · Impacto baixo · Risco:** baixo.

### `/admin/votacoes/[catalogoId]` — `votacoes/[catalogoId]/page.tsx` (prioridade)
- **Objetivo:** montar o catálogo (categorias e perguntas) e levar cada pergunta até a decisão.
- **Inventário (catálogo personalizado):**
  - Topo: 2 cards, "Nome do catálogo" (rename + zona de exclusão) e "Nova categoria" (form) (`:116-174`).
  - Navegação sticky de categorias (`:180-195`).
  - Por categoria: título renomeável, "Adicionar pergunta", ↑, ↓ e lixeira (`:229-262`). São 5 controles.
  - **Por pergunta: até 9 controles** (`:324-531`): Ver quem votou, Ver como o formando vê, Mandar para o grupo, Avisar a turma por email (ou o texto "avisada em"), Regra da votação, Editar pergunta, ↑, ↓ e lixeira.
  - Um catálogo com 10 categorias × 4 perguntas passa de **400 controles focáveis** numa página só.
- **Fricções:**
  1. **O caminho até a decisão está escondido.** O link que leva a "Fixar decisão" se chama "Ver quem votou" (`:325-328`), e a pergunta não mostra se já foi decidida. `e.decidida` existe e só é usado para esconder botões (`:339,358`). A comissão não consegue ver de relance o que falta decidir.
  2. **Tudo tem o mesmo peso por pergunta** (`:324-531`): as 6 primeiras ações são `outline`/`ghost` `sm` lado a lado e quebram em 2–3 linhas no celular. O comentário de `:321-323` mostra que já tentaram enxugar, mas a fileira continua longa.
  3. **"Regra da votação" é um Dialog por pergunta** (`:376-440`), com checkbox nativo `Input type=checkbox` (`:415-423`) e quórum em texto livre (`:400-408`). Configurar prazo para 10 perguntas significa 10 dialogs.
  4. **Topo duplicado:** o card "Nome do catálogo" (`:118-149`) renomeia o que já é o h1 (`:93`), e a zona de exclusão do catálogo fica no topo, na área mais vista.
  5. **Texto do estado vazio errado:** "Crie a primeira categoria no formulário **abaixo**" (`:200`), mas o formulário está **acima** (`:153-172`). O comentário de `:150-152` confirma que ele foi movido para o topo.
  6. **Prévia separada da edição:** "Ver como o formando vê" (`previa-enquete.tsx:53-60`) abre um Dialog próprio, mas quem precisa da prévia é quem está **escrevendo** a pergunta, dentro de `dialogo-nova-pergunta` e de "Editar pergunta". Além disso, ela duplica o `EnqueteCard` à mão (`previa-enquete.tsx:29-33`).
  7. **Editor de opções inconsistente** (`editor-opcoes.tsx`):
     - Ao criar, "Exclusiva" é checkbox (`:303-313`). Ao editar, é radio, com um radio a mais "Nenhuma opção exclusiva" (`:246-256,346-357,369-380`).
     - Ao editar, só dá para acrescentar **uma** opção nova por vez (`:334-358`). Ao criar, há "Adicionar opção" e colar uma lista (`:181-196,399-404`).
     - Os checkboxes e radios nativos não têm tamanho de toque de 44px (`:247-256,305-312,405-411`).
     - O "R$ total por pessoa / Link" fica escondido atrás de um checkbox global (`:405-412`) e abre dois campos para **todas** as linhas de uma vez.
  8. **Tipo da pergunta**: radios nativos sem área de toque (`form-enquete.tsx:143-167`) num formulário, `NativeSelect` no de edição (`[catalogoId]/page.tsx:478-481`). São dois controles diferentes para o mesmo dado.
  9. `FormDialog` não tem "Cancelar" (`form-dialog.tsx:79-88`). No celular, fechar depende do X ou de tocar fora.
- **Proposta:**
  - **A pergunta vira o centro.** A página do catálogo passa a ser uma **lista compacta** (`Item`) por categoria. Cada pergunta mostra o título, um badge de estado ("Aberta" / "Decidida: {opção}" / "Oculta"), "N de M votaram", o prazo quando houver, e **uma ação primária**: "Resultado e decisão" (o link atual para `votos/[id]`, renomeado). O badge "Decidida" usa `e.decidida`, que já existe. Mostrar a opção escolhida exige trazer `decisao` para `getCatalogoAdmin` (D4).
  - **O resto vai para um menu "…" por pergunta** (`DropdownMenu`): Editar pergunta, Regra da votação, Mandar para o grupo, Avisar a turma por email (ou "Avisada em …" desabilitado), Ocultar/Mostrar (no catálogo padrão), Subir, Descer, separador, Excluir. Os dialogs atuais continuam os mesmos, só muda o gatilho. Com isso, de 9 controles por pergunta ficam **2** (link + "…").
  - **Alternativa mais forte (D3):** mover Regra, Mandar para o grupo e Avisar para a página `votos/[enqueteId]`, que vira a "página da pergunta". Aí o catálogo fica só com estrutura (editar, mover, excluir) e a página da pergunta reúne tudo do ciclo da votação: regra → avisar → acompanhar → fixar → mandar para o grupo.
  - **Topo:** o h1 vira `RenomearInline`, como já acontece nas categorias (`:211-217`). "Excluir catálogo" vai para um "…" ao lado do h1. "Nova categoria" vira um botão que abre um Dialog de um campo, ou uma linha inline no fim da lista. Sem categorias, o `Empty` traz o botão "Criar primeira categoria" (corrige o "abaixo" de `:200`).
  - **Categoria:** "Adicionar pergunta" continua visível, porque é a ação de criação mais usada. ↑, ↓ e excluir categoria vão para um "…" ao lado do nome.
  - **Prévia dentro do formulário:** no Dialog de nova pergunta e no de editar, uma seção "Como o formando vê" (`Collapsible` no celular, coluna ao lado no desktop ≥ lg) que se atualiza enquanto a pessoa digita. Sai o botão "Ver como o formando vê" da linha.
  - **Editor de opções unificado:** as mesmas linhas nos dois modos, com "Adicionar opção" e colar lista também na edição. "Exclusiva" vira um `Toggle` por linha, com rótulo "Nenhuma das outras", e o radio "Nenhuma opção exclusiva" deixa de existir: desmarcar o toggle já resolve. Valor e link ficam por linha, atrás de um botão "+ valor/link" (`Collapsible` da linha) em vez do checkbox global. Os contratos de campo (`opcoes`, `exclusiva`, `exclusivaId`, `opcao-<id>`, `remover-<id>`) podem ser mantidos, porque a mudança é só de apresentação.
  - **Regra da votação:** `Checkbox` (ou `Switch`) do shadcn para "Voto secreto", `Input` numérico com sufixo "%" (`Input Group`) para o quórum e `Date Picker` + hora, ou o `datetime-local` mesmo, para o prazo. Mais simples e testado no D-pad: manter o nativo.
  - **Tipo:** `Radio Group` do shadcn (ou `Toggle Group` de 2 itens) nos dois formulários.
- **Componentes:** `Card` por pergunta → `Item` + `Badge` + `DropdownMenu`. Cards do topo → h1 com `RenomearInline` + `DropdownMenu`. `EstadoVazio` → `Empty` com ação. Checkbox/radio nativos → `Checkbox`, `Radio Group`, `Toggle`. `PreviaEnquete` em Dialog → painel inline dentro do form. `FormDialog` ganha "Cancelar" (`DialogClose`). No celular, `Dialog` → `Drawer` para "Nova pergunta" e "Editar pergunta", que são longos.
- **Esforço G · Impacto alto · Risco:**
  - Testes: `fluxos.mjs` usa como escopo `#enq-${id}` e clica pelos rótulos "Regra da votação" (`:1204,1888,1937,1948`), "Editar pergunta" (`:1236`), "Mandar para o grupo" (`:1274`), "Avisar a turma por email" (`:1325-1353`) e "Ver quem votou" como `a` (`:1138`). Tudo isso muda com o menu. "Adicionar pergunta" (`:115-137,952-1078`) pode ficar igual.
  - O `id="enq-…"` e o `tabIndex=-1` do `<li>` (`:270`) precisam continuar, por causa do `RolarParaPerguntaCriada`.
  - `BotaoMover` devolve o foco ao próprio botão depois de mover (`botao-mover.tsx:40-45`). Dentro de um `DropdownMenu` o menu fecha e o foco precisa voltar ao gatilho "…" da pergunta movida, e o anúncio `aria-live` precisa ser preservado.
  - WCAG 2.5.7 continua atendido, porque o mover segue sendo por clique.

### `/admin/votacoes/votos/[enqueteId]` — `votacoes/votos/[enqueteId]/page.tsx`
- **Objetivo:** ver o resultado de uma pergunta e **fixar a decisão da turma** (ou reabrir).
- **Inventário:** voltar, h1, parágrafo, badge de secreto. Card de participação com Progress. Card "Decisão da turma" com 1–3 botões (Fixar/Trocar, Mandar para o grupo, Reabrir) (`:102-185`). Um Card por opção com badges, Progress e chips de nomes (`:188-225`). Card "Já votaram" (se secreto), card "Ainda não votaram" e card "Histórico" (`:227-282`). São de 5 a 15 cards.
- **Fricções:**
  1. **Depois de fixar, a página não diz o que foi decidido.** O card da decisão só fala "Esta escolha aparece no dashboard…" (`:111-113`), sem nomear a opção. Os cards de opção marcam apenas "Mais votada" (`:198-202`), nunca "Decisão da turma". `dados.decisao` só é usado para pré-selecionar no Dialog (`:60-62`) e no texto do WhatsApp (`:164`). Isso fere o princípio 3 de PRODUCT.md.
  2. **As opções aparecem duas vezes:** nos cards da página e de novo como radio/checkbox no Dialog (`campos-fixar-decisao.tsx:257-280`), com a contagem de votos repetida.
  3. O título "Quem votou" (`:37`) e o link "Ver quem votou" do catálogo descrevem a função secundária. A principal é decidir.
  4. Com muitos membros, os chips de nome (`:216-220,263-267`) fazem cada card de opção crescer sem limite, e o botão de decidir fica longe dos números no celular.
  5. O histórico é um card fixo no fim (`:272-282`), sempre aberto.
  6. Detalhes visuais: `text-emerald-600` hardcoded (`:260`), `vitrine-fundo-hero` no card de participação (`:85`) e borda no accent no card da decisão (`:102`). São dois destaques competindo.
- **Proposta:**
  - **Ação primária: "Fixar decisão"** (botão `default`, hoje é `outline` por padrão do `FormDialog`, `form-dialog.tsx:352`). "Reabrir" e "Mandar para o grupo" ficam secundários.
  - **Estado decidido explícito:** o card do topo passa a dizer "Decisão da turma: **{opção(ões)}**", com o motivo e o link do documento. A opção decidida ganha o badge "Decisão" (accent) na lista, e "Mais votada" passa a neutro.
  - **Uma lista de resultado só:** juntar participação e opções num `Card` "Resultado", com uma linha por opção (`Item`: texto, contagem, `Progress`). Os nomes de cada opção ficam num `Collapsible` "Ver nomes (N)", fechado por padrão quando N for grande. "Ainda não votaram" vira uma linha final do mesmo card, também recolhível.
  - Considerar (D5) fazer do próprio resultado o formulário de decisão: opções como `Radio Group`/`Checkbox` com contagem, aviso de "fora da regra" e motivo abaixo, num formulário só e sem Dialog. Isso elimina a duplicação 2. O risco é baixo porque `CamposFixarDecisao` já é autocontido, mas fixar vira um ato menos "cerimonial". Recomendo **manter o Dialog** (decisão é ato explícito, princípio 1) e só aplicar a proposta anterior.
  - Histórico → `Accordion`/`Collapsible` "Histórico desta pergunta (N)".
  - Se D3 for aceita, esta página também recebe "Regra da votação" e "Avisar a turma por email". Aí ela vira o painel completo da pergunta, com título "Pergunta: {título}".
- **Componentes:** vários `Card` → um `Card` com `Item` + `Progress` + `Collapsible`. Histórico → `Accordion`. `Badge` "Decisão". `CamposFixarDecisao`: radio/checkbox nativos → `Radio Group`/`Checkbox` (área de 44px), aviso âmbar (`campos-fixar-decisao.tsx:83-97`) → `Alert`.
- **Esforço M · Impacto alto · Risco:** `fluxos.mjs:1155-1160,1258,1372-1377,1816-1821` clicam em "Fixar decisão" fora e dentro do Dialog. Manter os rótulos. `fluxos.mjs:1912-1917,2645` leem `[data-grupo] > :first-child ul` e `[data-grupo] li` com nomes de votantes. Com nomes recolhidos num `Collapsible`, o texto pode não estar no DOM (o `Collapsible` do Radix desmonta o conteúdo fechado), então é preciso `forceMount` ou ajustar o teste. Em voto secreto (ADR-0010), nenhum nome por opção deve vazar ao reorganizar.

## Mudanças transversais sugeridas

1. **Padrão "linha com uma ação primária e menu …".** `Item` + `DropdownMenu` para membros, perguntas, categorias e catálogos. As ações destrutivas ficam sempre por último, depois de um `DropdownMenuSeparator`, com variante destructive. Isso corta a maior parte dos controles repetidos e das paradas de foco no D-pad.
2. **`FiltroPilulas` compartilhado** (presença, histórico e, provavelmente, telas de outros grupos): links com `aria-current`, rolagem horizontal, contagem opcional e o visual do `Toggle Group`. Substitui o código copiado em `presenca/page.tsx:187-209` e `turma/historico/page.tsx:213-234`.
3. **`FormDialog` com rodapé padrão** (`form-dialog.tsx`): "Cancelar" (`DialogClose`), primário à direita e `variante` do gatilho configurável (hoje `outline` fixo, `:352`). Usar `Drawer` abaixo de `md` para os formulários longos ("Editar pergunta", "Nova pergunta", "Dados do evento").
4. **Confirmação destrutiva única:** tudo passa por `ConfirmarExclusao` (de preferência baseado em `Alert Dialog`), inclusive "Excluir turma" (com `confirmacao`) e a tesouraria (sem digitação). Fim do submit direto em mudança de poder.
5. **`Empty` com ação** no lugar de `EstadoVazio` (`estado-vazio.tsx:22-38`, que não tem espaço para botão). O estado vazio passa a ter o próximo passo ("Criar primeira categoria").
6. **Feedback com `Sonner`** para as ações de um clique (mover, reenviar convite, tesouraria, avisar por email, copiar), em vez das mensagens inline espalhadas (`form-acao.tsx:466-476`, `botao-mover.tsx:181-183`). Os `role="status"` atuais podem continuar para leitores de tela.
7. **Controles nativos → shadcn com 44px:** `Checkbox`, `Radio Group`, `Switch` e `Select` onde houver `input type=checkbox/radio` cru (`editor-opcoes.tsx`, `form-enquete.tsx`, `campos-fixar-decisao.tsx`, `[catalogoId]/page.tsx:415`). `NativeSelect` pode ficar onde há muitas opções e o D-pad nativo ajuda (`campo-prazo-exclusao.tsx`).
8. **Accent e cores:** tirar `--vitrine-a` de ícones decorativos e de `vitrine-fundo-hero` nas telas internas. Criar um token semântico de aviso para substituir `amber-*`/`emerald-*` hardcoded (`presenca:108,243`, `turma:88`, `votos:260`, `campos-fixar-decisao.tsx:89-92`).
9. **Evento dentro do admin (IA):** `EventoAdmin` (dados do evento, link público, programação) mora no `/dashboard` (`dashboard/page.tsx:449`), enquanto presença e portaria moram em `/admin/presenca`. Sugestão: uma rota `/admin/evento` (ou "Evento" no lugar de "Presença" na sidebar, `layout.tsx:12-17`) com `Tabs`: Dados · Programação · Presença. Dois problemas do componente que valem para qualquer lugar onde ele fique:
   - `evento-admin.tsx:139-172`: o diálogo "Dados do evento" tem cerca de 15 campos. Dá para dividir em `Field` sets recolhíveis (Quando / Onde / Acessibilidade / Traje).
   - **Bug de a11y:** ids duplicados. "Editar item" usa `id="horario"`/`"titulo"` (`:267,278`), os mesmos do formulário "Adicionar item" (`:323,327`), que fica sempre no DOM dentro de `<details>`. O `<Label htmlFor>` do Dialog aponta para o campo errado.
   - `link-publico-evento.tsx:56-80`: 4 botões. "Gerar outro link" e "Desligar" podem ir para um "…".

## Decisões que precisam do dono do produto

- **D1. Início da área admin.** `/admin` hoje redireciona para `/dashboard` (`page.tsx:9-11`).
  (a) Manter o redirect. (b) `/admin` vira "Pendências da comissão" (perguntas sem decisão, convites pendentes, respostas acima do limite), montado só com dados que já existem. (c) Mandar direto para `/admin/votacoes`.
  **Recomendo (a)** agora. (b) só depois de validar com a comissão real, porque é uma tela nova.

- **D2. Onde fica o Histórico.**
  (a) Continua dentro de "Turma". (b) Item próprio na sidebar. (c) Aba dentro de "Turma" (`Tabs`: Registro · Histórico · Encerrar).
  **Recomendo (c):** menos itens na sidebar, e o histórico deixa de se misturar com exportação.

- **D3. Ciclo da pergunta.**
  (a) Catálogo com menu "…" por pergunta e todas as ações nele. (b) Catálogo só com estrutura (editar, mover, excluir). Regra, Avisar e Mandar para o grupo vão para a página da pergunta, renomeada "Resultado e decisão".
  **Recomendo (b):** uma pergunta, uma página, um ciclo. O catálogo fica leve. Custo: reescrever cerca de 10 passos de `fluxos.mjs`.

- **D4. Mostrar o estado da decisão nas listas** ("Decidida: Buffet A" na pergunta; "3 de 12 decididas" no card do catálogo).
  (a) Só o badge "Decidida", com o dado que já existe (`e.decidida`). (b) Badge + opção escolhida, ajustando as queries `getCatalogoAdmin`/`listarCatalogosAdmin` (só leitura, sem mudar regra).
  **Recomendo (b).** É o que torna visível o diferencial "decisão fixada".

- **D5. Fixar decisão: Dialog ou inline.**
  (a) Manter o Dialog, nomeando a opção decidida na página. (b) O resultado vira o próprio formulário de decisão.
  **Recomendo (a):** fixar é um ato explícito e atribuído (princípio 1), e o Dialog marca isso.

- **D6. Regras da presença num único formulário.**
  (a) Um Dialog com duas seções e dois botões de salvar (sem mexer no servidor). (b) Uma action combinada e um botão só.
  **Recomendo (a)** para não tocar na validação e na auditoria das duas actions.

- **D7. Evento na área admin** (transversal 9).
  (a) Deixar `EventoAdmin` no dashboard. (b) Criar `/admin/evento` com Dados · Programação · Presença e tirar do dashboard. (c) Criar a rota e deixar no dashboard só um resumo com o link "Editar".
  **Recomendo (c):** o dashboard continua mostrando o evento a todos, e a edição fica junto da presença.
