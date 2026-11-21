# Grupo B — telas do participante (`src/app/(app)/`)

Abreviação: `(app)` = `src/app/(app)`, `feat/` = `src/components/features`.

## Visão geral do grupo

- **Tudo é Card dentro de Card.** Quase toda informação vem numa caixa com borda (`rounded-xl border`) dentro de outro Card ou seção com borda: hero do dashboard com 4–5 caixas internas (`(app)/dashboard/page.tsx:179-248`), decisões (`:392`), mural (`:371`), presença em Card próprio. O DESIGN.md pede superfície plana e a distill.md diz "never nest cards inside cards". Isso deixa as telas mais longas e "barulhentas" do que o conteúdo pede.
- **O formulário do admin fica aberto por cima da lista da turma.** Avisos (`avisos/page.tsx:38-44`), Tarefas (`tarefas/page.tsx:137-153`), Terceiros (`terceiros/page.tsx:143-174`) e Dúvidas (aviso de admin em `duvidas/page.tsx:68-73` mais 4 botões por item em `:201-275`) põem as ferramentas da comissão antes do conteúdo. Para o participante a tela é boa; para o admin vira uma tela de gestão que empurra a lista para baixo. A mistura dá para resolver com **um padrão só**: um botão "Novo …" no cabeçalho (Dialog/Drawer) e as ações por item num menu "⋯" (DropdownMenu). Assim as duas versões têm o mesmo layout.
- **A mesma informação aparece duas ou três vezes.** Data do evento na contagem e no `dl` (`dashboard/page.tsx:146-155` e `:179-195`). Progresso do catálogo no hero e no rodapé fixo (`votacoes/[catalogoId]/page.tsx:67-82` e `feat/form-votacao-catalogo.tsx:142-143`). Avisos no dashboard com o texto inteiro, iguais aos de `/avisos` (`dashboard/page.tsx:370-375`). Status da tarefa em três sinais: faixa colorida, ícone e badge (`tarefas/page.tsx:50-69, 198-209`).
- **Os filtros em pílula não seguem o padrão de toque.** Os chips usam `px-3 py-1` (cerca de 28px de altura) sem a regra `pointer-coarse:` de 44px em Tarefas (`tarefas/page.tsx:165-166`), Dúvidas (`duvidas/page.tsx:101-102`), Terceiros (`terceiros/page.tsx:188`), Relatório (`votacoes/relatorio/page.tsx:55`) e nas categorias do catálogo (`votacoes/[catalogoId]/page.tsx:105`). As opções de voto também ficam em `py-2` sem regra de toque (`feat/enquete-card.tsx:117-123`). O DESIGN.md manda 44px no mínimo.
- **Efeitos da vitrine vazaram para o app.** `vitrine-cartao` (sobe 4px no hover, `src/app/globals.css:228-235`) aparece em cards do app: indicadores (`dashboard/page.tsx:70`), catálogos (`votacoes/page.tsx:36`) e fornecedores, que **nem são clicáveis** (`terceiros/page.tsx:220`). Também há texto em gradiente em números (`tarefas/page.tsx:125`, `feat/contagem-regressiva.tsx:47`). As duas coisas contrariam o DESIGN.md ("app cards never lift", "Don't set gradient text on… metrics").
- **Menu longo para quem só participa.** São 9 itens (`(app)/layout.tsx:16-27`), e para o formando "Relatório", "Terceiros" e "Tarefas" são telas só de leitura. "Relatório" é um irmão separado de "Votações" quando, na prática, é a aba de resultados delas.

---

## Por tela

### /dashboard — `(app)/dashboard/page.tsx` (prioridade)

- **Objetivo único:** responder "o que eu preciso fazer agora e o que já foi decidido sobre a festa?". Usam o formando (principal), o observador e o admin (que hoje vê outra tela por baixo).
- **Ordem atual para o participante:**
  1. Hero: nome da turma, badge de papel, descrição, nº de membros, contagem, alerta "Mudou em", 2 a 4 caixas (data, local, traje, observações) e a caixa de acessibilidade (`:126-249`).
  2. Card de presença (`:251-286`).
  3. 3 indicadores (`:331-352`).
  4. Mural com 3 avisos inteiros (`:356-378`).
  5. Decisões, mais o histórico recolhido (`:380-446`).
  6. Programação (`:451-486`).
  7. "Sair da turma" (`:489-499`).
- **Inventário:** cerca de 9 blocos visíveis e 12 a 18 caixas com borda. Ações: Responder presença, Como chegar, 3 indicadores-link, Ver todos (avisos), Ver documento (n), Ver histórico e Sair da turma. **Não há uma ação primária clara**: presença, voto pendente e "Sair" disputam a atenção.
- **Fricções:**
  - `:159-177`: o alerta de mudança no evento (data ou local trocou) fica **abaixo** da contagem, no meio do hero. É a informação mais urgente da tela e deveria abrir a página.
  - `:146-155` + `:179-195`: a data aparece duas vezes (contagem e "Data do evento"). A contagem ocupa cerca de 72px (`feat/contagem-regressiva.tsx:19`) e diz menos que a data.
  - `:131-133` + `:140-144`: o badge "Participante" e "N membros na turma" não ajudam o formando a decidir nada e ocupam a primeira dobra.
  - `:179-248`: entre 4 e 5 caixas com borda dentro de uma `section` com borda (card dentro de card). A acessibilidade vem numa caixa separada, solta abaixo do grid (`:246-248`).
  - `:251-286`: a presença é a **ação mais importante** do formando, mas vem depois de todo o hero (no celular, várias telas abaixo). A descrição (`:257-269`) é uma frase montada com 3 condições, difícil de ler. O botão abre um Dialog (`feat/form-presenca.tsx:38-52`), o que é bom.
  - `:331-352`: os indicadores do participante não levam a uma ação. "Dúvidas sem resposta" (`:346-350`) é um número da turma, não algo do formando. "Tarefas concluídas" é progresso da comissão. Só "Enquetes respondidas por você" pede ação, e aparece como número em vez de chamada ("Faltam 4 perguntas").
  - `:370-375`: os avisos mostram o `conteudo` inteiro (`whitespace-pre-wrap`). Com 3 recados longos, o mural empurra as decisões para baixo e repete `/avisos`.
  - `:392-430`: cada decisão é uma caixa com 5 a 6 linhas (categoria, pergunta, escolha, votantes, badge de regra, motivo, documento). A **escolha**, que é o que importa, fica no meio (`:395`).
  - `:489-499`: a ação destrutiva "Sair da turma" mora na tela inicial. Ela pertence a `/conta` (ou à seção da turma em Minha conta) e hoje é o último bloco que todo mundo rola.
  - `:448-450`: para o admin, a programação some e entra `EventoAdmin` (340 linhas, `feat/evento-admin.tsx`, com 2 Cards, edição do evento, programação editável, WhatsApp e link público), mais 6 indicadores (`:290-328`). O dashboard do admin vira uma tela de gestão do evento.
- **Proposta (ordem nova, uma ação primária):**
  1. **Faixa de alerta** (só quando existe): "Mudou em…" no topo (`Alert` com variante de atenção).
  2. **Cabeçalho enxuto:** nome da turma (h1), data e local numa linha, "Como chegar" e a contagem em texto curto ("faltam 42 dias") em vez das 3 caixas. Tirar o badge de papel e o nº de membros (o nº vai para o admin).
  3. **"Para você fazer"** como uma lista de `Item` com seta, mostrando só o que está pendente e na ordem: *Responder presença* (ou "Informar nomes de 2 acompanhantes", que hoje está em `:263-266`), *N perguntas sem seu voto → /votacoes*, e, se o dono aprovar, *Próxima parcela R$ X até dd/mm → /minha-situacao* (o dado existe em `getMinhaSituacao`, mas hoje não é buscado aqui). O primeiro item pendente é a **ação primária**. Sem pendências: "Tudo em dia ✓". Isso substitui o card de presença e os 3 indicadores.
  4. **Decisões da turma:** lista plana em que a escolha vem em destaque e a pergunta e a categoria vêm em texto pequeno. Votantes, regra, motivo e documento ficam atrás de um "detalhes" (Collapsible/Accordion por item). O histórico continua recolhido.
  5. **Últimos avisos:** título + 2 linhas (`line-clamp-2`) + "Ver todos".
  6. **Sobre o evento** (Accordion, fechado no celular e aberto a partir de md): traje, observações do local, acessibilidade, programação.
  7. Tirar "Sair da turma" do dashboard e levar para `/conta`.
- **Admin:** manter o mesmo layout do participante (a turma vê o que o admin vê), com uma faixa "Comissão" de 3 indicadores no máximo (participação, presença, dúvidas abertas) e o botão "Gerenciar evento" levando para `/admin/turma` ou abrindo um Sheet. `EventoAdmin` sai do dashboard.
- **Componentes:** caixas de `dl` → linhas de `Item` sem borda; indicadores `Card`+`Progress` → `Item` com `Badge` de contagem; alerta de mudança `div amber` → `Alert`; decisões → `Item` + `Collapsible`; seções inferiores → `Accordion`; tirar `vitrine-cartao` e `vitrine-fundo-hero` do app.
- **Esforço G · Impacto alto · Risco:** médio. A ordem de foco por Tab/D-pad muda (é bom revisar que "Para você fazer" seja o primeiro foco depois do skip-link). O `role="status"` do alerta precisa ser mantido. Testes de lib não quebram (não há teste de página), mas os roteiros de e2e/manuais que procuram "Você vai ao evento?" precisam de atualização. O admin perde o atalho direto de edição do evento no dashboard.

### /avisos — `(app)/avisos/page.tsx`

- **Objetivo:** ler os recados da comissão. Participante lê, admin publica.
- **Inventário (participante):** título, intro, lista de Cards e paginação. Admin: + formulário aberto e 3 botões por aviso (WhatsApp, Editar, Remover).
- **Fricções:**
  - `:34-36`: a intro repete o subtítulo do mural do dashboard (`dashboard/page.tsx:367`). Pode sair.
  - `:38-44`: o formulário do admin (título + recado + botão) fica sempre aberto em um Card acima da lista. Toda visita do admin começa por um formulário vazio.
  - `:57-100`: um Card por aviso. A separação por `divide-y` basta e encurta a tela.
  - `:64-98`: 3 botões outline lado a lado em cada aviso (o rótulo é repetido N vezes).
- **Proposta:** lista plana (`Item` ou `divide-y`) com título, recado e meta. Admin: o botão "Novo aviso" no cabeçalho abre um Dialog (Drawer no celular) com `FormNovoAviso`. Ações por item em `DropdownMenu` "⋯" (Mandar para o grupo, Editar, Remover). Avaliar se Avisos continua no menu lateral (ver Decisões).
- **Componentes:** Card por item → `Item`; formulário em Card → `FormDialog`/Drawer; 3 botões → `DropdownMenu`.
- **Esforço P · Impacto médio · Risco:** baixo. `ConfirmarExclusao` dentro de um DropdownMenu exige abrir o Dialog controlado fora do menu, porque o foco volta ao gatilho. É preciso testar com D-pad.

### /minha-situacao — `(app)/minha-situacao/page.tsx`

- **Objetivo:** "estou em dia? quanto falta e quando é a próxima?" e "já paguei, avise a tesouraria". Usa o formando (o observador é redirecionado, `:46`).
- **Inventário:** até 7 blocos (hero, botão "Já paguei", nota informativa, Parcelas, Seus lançamentos, Caixa da turma com saídas, Regras do dinheiro, Mudanças no plano). Uma ação primária ("Já paguei"), mais "Cancelar informe" por lançamento e 2 disclosures.
- **Fricções:**
  - `:216-232`: "Já paguei" fica **fora** do hero, sozinho entre o hero e a nota. O hero (`:186-214`) já responde à pergunta e o botão deveria morar nele.
  - `:234-241`: o parágrafo informativo junta 3 ideias (demora, última atualização, quem é a tesouraria). Fica solto entre a ação e a lista.
  - `:243-267` e `:271-324`: Parcelas e Lançamentos em Cards separados, com bastante cabeçalho. O informe "Aguardando confirmação" é o que a pessoa procura depois de clicar "Já paguei", e fica na terceira seção.
  - `:328-374`: o "Caixa da turma" é um bloco grande de transparência, com fórmula "Previsto = …" (`:348-351`), dl de saldo e um `<details>` nativo (`:362-369`), enquanto as "Mudanças" usam `PainelRecolhivel` (`:391`). São dois padrões de disclosure na mesma tela.
  - `:135-141`, `:257`, `:301`: emerald e amber fixos para o estado. O DESIGN.md só sanciona tokens (aceitável para status, mas não está no DESIGN.md).
- **Proposta:**
  1. Hero com valor pago / total, estado, próxima parcela e o botão **"Já paguei"** dentro dele (ação primária única).
  2. Logo abaixo, se houver informe pendente ou recusado: uma linha de status ("Seu informe de R$ X aguarda a tesouraria", com Cancelar no "⋯"). A nota de demora entra aqui como descrição.
  3. `Tabs`: **Parcelas | Lançamentos**.
  4. `Accordion` "Dinheiro da turma" com 3 itens fechados: Caixa e saídas, Regras do dinheiro, Mudanças no plano.
- **Componentes:** botão solto → dentro do `CardFooter` do hero; 2 Cards → `Tabs`; `details` e `PainelRecolhivel` → um `Accordion`; o Dialog do "Já paguei" vira Drawer no celular.
- **Esforço M · Impacto alto · Risco:** baixo/médio. O Accordion do Radix precisa navegar bem por teclado (navega). A transparência (ADR-0005) continua presente, só recolhida, e o dono precisa concordar (ver Decisões).

### /tarefas — `(app)/tarefas/page.tsx`

- **Objetivo:** participante acompanha o andamento da festa e atualiza a **própria** tarefa. Admin cria e gerencia.
- **Inventário:** hero de progresso, 4 chips de filtro, lista de Cards e paginação. Participante responsável: 1 botão por tarefa. Admin: formulário recolhível + 2 botões por tarefa (Dialog com 5 campos).
- **Fricções:**
  - `:115-135`: o hero com `%` em gradiente (`:125`) duplica "X de Y concluídas". O número e o percentual dizem a mesma coisa e o gradiente contraria o DESIGN.md.
  - `:155-174`: chips de ~28px, sem regra de toque.
  - `:198-209`: status em faixa colorida + ícone + badge. É ruído triplo.
  - O participante não tem como ver "**as minhas**": o filtro é só por status (`:71-74`) e a tarefa dele se perde no meio das outras.
  - `:316-336`: para mudar o andamento é preciso abrir um Dialog com um único `NativeSelect`, ou seja, 3 interações (abrir, escolher, Atualizar) para 1 campo.
  - `:137-153`: o painel "Nova tarefa" do admin fica dentro de um Card, entre o hero e os filtros.
  - `:241-304`: o Dialog de edição usa `<label>` envolvendo, enquanto o resto do app usa `Label`+`htmlFor`. A descrição usa `Input` aqui e `Textarea` na criação (`feat/form-nova-tarefa.tsx:37`).
- **Proposta:** trocar o hero por uma linha simples ("8 de 20 concluídas" + `Progress`). Filtros em `ToggleGroup`/`Tabs` com alvo de 44px, com o item **"Minhas"** primeiro quando a pessoa é responsável por alguma tarefa. Cada tarefa vira `Item` (título, responsável, prazo, badge de status, badge "Atrasada"), sem a faixa lateral. A mudança de andamento vira **um `Select` inline** que salva ao escolher (ou um `ToggleGroup` com 3 estados) e confirma com Sonner. Admin: botão "Nova tarefa" no cabeçalho → Dialog; "⋯" com Editar e Excluir.
- **Componentes:** hero → texto + `Progress`; chips → `ToggleGroup`; Card com faixa → `Item`; Dialog de 1 campo → `Select` inline + `Sonner`; `NativeSelect` dos formulários pode ficar (é bom com D-pad e no celular).
- **Esforço M · Impacto médio · Risco:** médio. Salvar ao escolher exige `useActionState`/transition e a mensagem de erro. O filtro "Minhas" é um novo parâmetro de URL que a query (`listarTarefas`) precisa aceitar (mexe em `src/lib/tarefas.ts`, sem tocar em regra).

### /votacoes — `(app)/votacoes/page.tsx`

- **Objetivo:** escolher um catálogo e votar. Formando e observador.
- **Inventário:** título, intro longa, grade de cards de catálogo (ícone, badge, título, progresso e CTA).
- **Fricções:**
  - `:25-28`: a intro junta instrução e o texto de visibilidade do voto (`AVISO_VISIBILIDADE_VOTO`, 3 frases, `src/lib/empresa.ts:24-26`). O texto se repete na tela do catálogo (`[catalogoId]/page.tsx:84-89`), que é onde a ADR-0001 pede que ele esteja.
  - `:46-48`: o badge "Padrão/Personalizado" é jargão da comissão e não muda nada para quem vota.
  - `:36`: `vitrine-cartao` faz o card subir no hover.
  - Não há ordenação por pendência: um catálogo completo e um ainda não começado têm o mesmo peso.
- **Proposta:** intro de uma frase ("Responda as perguntas da turma. Você pode mudar o voto até a decisão."). Tirar o badge Padrão/Personalizado. Ordenar com os catálogos **pendentes primeiro** e os completos depois, com estilo neutro. Cada catálogo vira um `Item` com título, "3 de 10" e `Progress`. Com 1 catálogo só, a lista pode levar direto para ele. Pôr "Resultados" como aba aqui (ver Relatório).
- **Componentes:** grid de Cards → lista de `Item`; badge → remover; `Tabs` "Votar | Resultados".
- **Esforço P · Impacto médio · Risco:** baixo. O texto de visibilidade continua na tela de voto (ADR-0001).

### /votacoes/[catalogoId] — `(app)/votacoes/[catalogoId]/page.tsx` + `feat/form-votacao-catalogo.tsx` + `feat/enquete-card.tsx`

- **Objetivo:** responder as perguntas de um catálogo e salvar.
- **Inventário:** voltar, h1 + badge, hero de progresso, aviso de visibilidade, nav de categorias fixa, N cards de enquete (cada um com 4 a 8 linhas de meta antes das opções) e o rodapé fixo com "Salvar tudo". Ação primária: Salvar tudo.
- **Fricções:**
  - `[catalogoId]/page.tsx:67-82` + `feat/form-votacao-catalogo.tsx:142-143`: o progresso aparece duas vezes (hero e rodapé fixo). O rodapé basta.
  - `:54-56`: o badge "Padrão/Personalizado" de novo.
  - `feat/enquete-card.tsx:62-111`: antes das opções, cada enquete empilha descrição, motivo, voto secreto, prazo/quórum e a barra de "X de Y votaram". Com 10 perguntas, a leitura fica pesada no celular. "Escolha uma opção." (`:67-69`) é redundante com o radio.
  - `feat/enquete-card.tsx:117-123`: opções em `py-2` (cerca de 36px), sem `pointer-coarse:`. O radio nativo tem `size-4`.
  - `feat/enquete-card.tsx:140`: "R$ X por pessoa, no total" ainda soa ambíguo (RF-61 recém-corrigido). Fica com o grupo de conteúdo, só registro aqui.
  - `feat/form-votacao-catalogo.tsx:149-156`: o "Salvar tudo" em lote exige que a pessoa lembre de salvar. Há o aviso "alterações não salvas" (`:144-146`), mas **nenhum `beforeunload`** (grep em `src` sem resultado): sair pelo menu perde os votos marcados.
  - `[catalogoId]/page.tsx:96-111`: chips de categoria de ~28px numa barra fixa que se soma ao cabeçalho fixo (`top-14`). No celular, duas barras fixas mais o rodapé fixo tomam ~30% da altura.
- **Proposta:** tirar o hero e o badge. Deixar o aviso de visibilidade numa linha com `Eye`, mantendo o texto completo num `Collapsible` "Quem vê meu voto?". No card da enquete, a meta vira **uma linha** ("fecha 12/12 · 18 de 40 votaram · voto secreto"), e o motivo só aparece quando a pergunta está decidida. Opções com alvo de 44px (`pointer-coarse:py-3`, como em `feat/form-presenca.tsx:118`). Usar `RadioGroup`/`Checkbox` do shadcn só se mantiverem o input nativo para D-pad; o nativo atual já funciona. Manter "Salvar tudo" e acrescentar `beforeunload` quando `sujo` (ou salvar automático, ver Decisões). Com até 2 categorias, tirar a nav fixa.
- **Componentes:** hero → nada (só o rodapé); meta empilhada → uma linha + `Badge`; aviso → `Collapsible`; feedback de salvo → `Sonner` (hoje é um texto no rodapé, `:157-169`).
- **Esforço M · Impacto alto · Risco:** médio. ADR-0015 (leitor de tela): o `role="status"` do rodapé precisa continuar. ADR-0010/0003: as informações de voto secreto e de regra **não podem sumir**, só ficar compactas. O observador também usa a tela (`somenteLeitura`).

### /votacoes/relatorio — `(app)/votacoes/relatorio/page.tsx`

- **Objetivo:** ver as preferências da turma (totais), por catálogo.
- **Inventário:** intro, chips de catálogo, 2 stats, chips de categoria fixos e um Card por enquete (líder + gráfico + tabela em details).
- **Fricções:**
  - `:47-65` + `:96-114`: duas fileiras de chips (catálogo e categoria) de ~28px.
  - `:71-90`: "Membros na turma" e "Enquetes com votos" são 2 caixas grandes com números de pouca decisão. "Membros" se repete em cada enquete (`:129-131`).
  - `:159-193`: o "Ver como tabela" em cada enquete é bom para acessibilidade, mas repete o gráfico. Aceitável.
  - O relatório é um item de menu separado (`(app)/layout.tsx:21`), longe de onde a pessoa vota. Depois de votar, ver o resultado exige ir ao menu.
- **Proposta:** virar a aba **"Resultados"** dentro de Votações, mantendo a rota `/votacoes/relatorio` para links existentes. O seletor de catálogo vira `Select` quando houver mais de 3 catálogos e `ToggleGroup` quando houver poucos. Tirar as 2 stats (no máximo uma linha de texto: "7 de 10 perguntas já têm votos"). Manter líder, gráfico e tabela.
- **Componentes:** chips de catálogo → `Select`/`ToggleGroup`; stats `dl` → texto; item de menu → `Tabs` em /votacoes.
- **Esforço P/M · Impacto médio · Risco:** baixo. O gráfico (recharts lazy) não muda.

### /duvidas — `(app)/duvidas/page.tsx`

- **Objetivo:** perguntar à comissão e apoiar a dúvida de colegas. Admin responde e modera.
- **Inventário:** intro, formulário aberto em Card, 3 chips, lista de Cards (upvote, badges, texto, autor, ações próprias, resposta) e paginação. Admin: + nota e 4 botões por item.
- **Fricções:**
  - `:68-73`: a nota "Você é administrador…" ocupa espaço e se explica sozinha pelos botões.
  - `:81-86`: o formulário vem **antes** da lista. A pessoa escreve sem ver se a dúvida já existe (o upvote é o fluxo desejado: "as mais votadas aparecem primeiro", `:65-66`).
  - `:168-200`: "Editar dúvida" e "Excluir dúvida" como 2 botões outline em cada dúvida própria.
  - `:201-275`: o admin tem 4 botões por item, e "Destacar" e "Marcar como respondida" abrem **Dialog de confirmação** para ações reversíveis (`:222-263`). São 2 cliques a mais por item.
  - `:101-102`: chips sem alvo de toque.
  - `feat/form-nova-duvida.tsx:28-33`: ícone decorativo no label. O contador `n/500` fica visível o tempo todo (`:60-62`).
- **Proposta:** a lista vem primeiro. O botão **"Perguntar"** no cabeçalho é a ação primária e abre um Dialog/Drawer com o formulário, que pode mostrar as 3 dúvidas parecidas mais votadas (se o dono quiser; sem isso, só o formulário). Ações próprias e do admin ficam num `DropdownMenu` "⋯": Editar, Excluir, Destacar/Tirar destaque, Marcar respondida/Reabrir e Apagar. Destacar e Marcar viram ação direta com `Sonner` e "Desfazer", sem Dialog (continuam auditáveis no servidor, sem mudar a regra). "Responder" continua como botão visível (é a ação principal do admin). Filtros em `ToggleGroup`/`Tabs`.
- **Componentes:** formulário em Card → `FormDialog`/`Drawer`; 2 a 5 botões → `DropdownMenu`; confirmação de toggles → `Sonner`; chips → `ToggleGroup`.
- **Esforço M · Impacto alto · Risco:** médio. A `rolar-para-pergunta-criada` (`feat/rolar-para-pergunta-criada.tsx`) e `data-duvida` (`:126`) dependem do envio pela página: é preciso testar se o scroll até a dúvida nova continua funcionando com o envio vindo do Dialog. O D-pad precisa alcançar o "⋯".

### /terceiros — `(app)/terceiros/page.tsx`

- **Objetivo:** participante consulta os fornecedores indicados (contato). Admin cadastra e acompanha o orçamento.
- **Inventário (participante):** intro, **15 chips** (Todas + 14 categorias, `:60-75`, `:180-198`), grade de 3 colunas de Cards e paginação. Admin: + hero de orçamento, formulário recolhível e Dialog de edição com 8 campos.
- **Fricções:**
  - `:180-198`: as 14 categorias aparecem **mesmo com 0 itens**, numa fileira que rola na horizontal. No celular a maioria fica fora da tela, e no D-pad são 15 paradas antes da lista.
  - `:220`: card com `vitrine-cartao` (sobe no hover) que **não é clicável**. É uma pista falsa.
  - `:224-230`: o ícone da categoria + `Badge` da categoria repetem o mesmo dado, e com filtro ativo repetem também o filtro.
  - `:215`: 3 colunas em md num app de coluna central de 56rem: os cards ficam estreitos para descrição e contato.
  - `:143-174`: orçamento e cadastro do admin antes da lista. Os valores são só do admin (correto), mas tornam a tela de leitura da turma numa tela de gestão.
  - `:262-316`: o Dialog de edição tem 8 campos num Dialog sem rolagem garantida no celular.
- **Proposta:** chips só para categorias com itens (`totais[c] > 0`). Com mais de 6, usar `Select` "Categoria". Lista de `Item` (ou 2 colunas), com o contato como ação (`Button` "Ligar", "E-mail", "Site") e sem o card que sobe. Admin: "Adicionar fornecedor" no cabeçalho → Sheet/Drawer. Editar/Remover no "⋯". O resumo do orçamento vira uma linha compacta só para o admin ou vai para `/admin` (ver Decisões).
- **Componentes:** 15 chips → `Select` ou chips filtrados; Card com hover → `Item`; formulário grande → `Sheet` (lateral no desktop, `Drawer` no celular) com `Field`.
- **Esforço M · Impacto médio · Risco:** baixo. Esconder categorias vazias não muda dados. O link `?categoria=` de uma categoria vazia precisa continuar funcionando, mesmo sem chip.

---

## Mudanças transversais sugeridas

1. **Padrão "lista da turma":** cabeçalho (h1 + 1 frase + **um** botão primário à direita, só se houver ação) → filtro (`ToggleGroup`, alvo de 44px) → lista de `Item` sem Card por linha → `Paginacao`. Ações por item num `DropdownMenu` "⋯" (com `aria-label` contendo o nome do item, como já faz `ConfirmarExclusao.descricao`). Serve para Avisos, Tarefas, Dúvidas, Terceiros e Votações.
2. **Padrão "criar algo":** todo formulário de criação vai para `FormDialog` (que já existe, `feat/form-dialog.tsx`), com variante `Drawer` abaixo de md, e deixa de ficar aberto na página. Some o `PainelRecolhivel`+Card de "Nova tarefa"/"Adicionar fornecedor" (`tarefas/page.tsx:137-153`, `terceiros/page.tsx:158-174`) e o formulário fixo de Avisos e Dúvidas.
3. **Admin e participante no mesmo layout:** o admin vê a mesma tela, mais o botão "Novo…" e o item "⋯". Nada de nota explicativa (`duvidas/page.tsx:68-73`) nem de bloco de gestão antes do conteúdo. Gestão pesada (evento, orçamento) vai para `/admin/*`.
4. **Feedback com `Sonner`:** hoje cada formulário mostra `estado.ok` num `<p role="status">` (ex.: `feat/form-novo-aviso.tsx:45-47`, `feat/form-votacao-catalogo.tsx:157-169`). Um toast padronizado, mantendo o `role="status"` do Sonner, libera espaço e permite "Desfazer" em toggles reversíveis.
5. **Remover estética de vitrine do app:** `vitrine-cartao`, `vitrine-fundo-hero` e `vitrine-texto-gradiente` fora das telas `(app)`. Isso traz o app de volta ao DESIGN.md (flat, um acento, sem gradiente em métricas).
6. **Alvo de toque:** um utilitário único para chips e opções (`pointer-coarse:min-h-11`), aplicado aos 5 lugares citados na visão geral.
7. **Disclosure único:** escolher `Accordion`/`Collapsible` **ou** `PainelRecolhivel` (`<details>`) e usar um só. Hoje convivem `<details>` cru (`minha-situacao/page.tsx:362`, `votacoes/relatorio/page.tsx:159`) e `PainelRecolhivel`. A justificativa do `PainelRecolhivel` (`feat/painel-recolhivel.tsx:14-16`) é válida. Se ele ficar, padronizar os `details` crus nele.
8. **Menu lateral do participante** de 9 para 6 itens: Início, Votações (com Resultados), Avisos, Dúvidas, Minha situação, Mais (Tarefas, Terceiros, Registro). Ver Decisões.

---

## Decisões que precisam do dono do produto

1. **O que o dashboard do formando mostra primeiro?**
   - (a) Lista "Para você fazer" (presença, votos pendentes, nomes de acompanhantes) logo abaixo do nome e da data. **← recomendo**
   - (b) Manter o hero do evento primeiro e a presença em segundo.
   - (c) Só a contagem e o evento; pendências ficam em cada tela.
2. **"Próxima parcela" entra no "Para você fazer" do dashboard?** O valor é privado (só a pessoa e a tesouraria, `minha-situacao/page.tsx:42`), e o dashboard é visto só pela própria pessoa.
   - (a) Sim, só data e valor da próxima, com link. **← recomendo**
   - (b) Só um link "Minha situação" sem valor.
   - (c) Não.
3. **"Sair da turma" sai do dashboard?**
   - (a) Vai para `/conta` (ou uma seção "Turma" em Minha conta). **← recomendo**
   - (b) Fica no dashboard, recolhido num "Mais opções".
   - (c) Fica como está.
4. **O que o admin vê no dashboard?**
   - (a) O mesmo do participante, mais 3 indicadores e um link "Gerenciar evento" para `/admin/turma`. **← recomendo**
   - (b) Como hoje (6 indicadores + `EventoAdmin` completo).
   - (c) O admin cai direto em `/admin`.
5. **Votos: salvar tudo ou salvar sozinho?**
   - (a) Manter "Salvar tudo" e acrescentar aviso ao sair com alterações não salvas. **← recomendo (menor risco)**
   - (b) Salvar automaticamente cada pergunta ao marcar (some o botão, mais requisições no pico).
   - (c) Como está.
6. **Relatório das votações:**
   - (a) Vira a aba "Resultados" dentro de Votações, mantendo a URL. **← recomendo**
   - (b) Continua item de menu separado.
7. **Menu lateral do participante:**
   - (a) 6 itens, com Tarefas, Terceiros e Registro dentro de "Mais". **← recomendo**
   - (b) Avisos sai do menu (só pelo dashboard), e o resto fica igual.
   - (c) Manter os 9.
8. **Transparência em Minha situação (caixa, regras, mudanças no plano):**
   - (a) Recolhida num Accordion "Dinheiro da turma", fechado por padrão. **← recomendo**
   - (b) Sempre aberta, como hoje.
   - (c) Mover para uma tela "Caixa da turma" própria.
9. **Orçamento e cadastro de fornecedores (admin) em /terceiros:**
   - (a) Ficam em /terceiros, mas atrás de botão/Sheet e linha compacta. **← recomendo**
   - (b) Vão para `/admin/fornecedores`, e /terceiros vira só leitura para todos.
10. **Toggles do admin em Dúvidas (Destacar, Marcar respondida):**
    - (a) Ação direta com toast e "Desfazer", sem Dialog. **← recomendo**
    - (b) Manter a confirmação em Dialog.
