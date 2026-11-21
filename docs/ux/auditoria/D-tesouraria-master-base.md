# Grupo D: Tesouraria, Master e base de componentes

Escopo lido: `src/app/(admin)/admin/tesouraria/{page,saidas/page,[usuarioId]/page}.tsx`, `src/app/(master)/master/{layout,page,loading,error,turmas/page,turmas/[turmaId]/page,usuarios/page}.tsx`, `src/components/features/{campos-lancamento,campos-saida,saidas-da-turma,form-importar-pagamentos,acoes-informe,botao-imprimir,form-dialog,form-acao,confirmar-exclusao,estado-vazio,pagina-vazia,painel-recolhivel,paginacao,erro-pagina,cartao-resumo}.tsx`, `src/components/ui/*`, além de DESIGN.md, PRODUCT.md e o roteiro de testes `scripts/teste/fluxos.mjs`. Nenhum arquivo foi editado.

## Visão geral do grupo

- **Tudo é Card, e cada linha de lista também.** A lista de membros da tesouraria, as turmas, os membros e os usuários do master renderizam um `<Card>` por `<li>` (tesouraria/page.tsx:307, master/turmas/page.tsx:177, turmas/[turmaId]/page.tsx:121, usuarios/page.tsx:310). O mesmo acontece em mais 7 páginas fora do grupo: são 11 arquivos com "lista de Cards". Com isso, cada linha ganha borda, sombra e padding, e a tela parece mais pesada do que é.
- **Rotina e configuração dividem a mesma tela.** A Tesouraria empilha 4 cards (informes, plano, importar, caixa e regras) antes da lista de membros (tesouraria/page.tsx:69–261). A tarefa de todo dia (conferir "já paguei", lançar, ver quem está atrasado) fica abaixo da dobra. Montar o plano, escrever as regras e importar são tarefas de uma vez só.
- **Toda linha mostra os botões com rótulo.** "Editar" e "Excluir" aparecem em cada saída e em cada lançamento, às vezes junto com Confirmar e Recusar (saidas/page.tsx:141–165, [usuarioId]/page.tsx:148–172). No master, "Promover" ou "Tornar participante" vem ao lado de "Remover" (turmas/[turmaId]/page.tsx:139–176), e cada usuário tem um "Excluir usuário" vermelho (usuarios/page.tsx:354–375). Contra a regra "One Voice" do DESIGN.md, o vermelho e os botões dominam a lista.
- **O sucesso não aparece para ninguém.** `FormDialog` fecha no sucesso (form-dialog.tsx:95), e a mensagem `estado.ok` do `FormAcao` (form-acao.tsx:187–188) some junto com o diálogo. `ConfirmarExclusao` faz o mesmo com o "Excluído." genérico (confirmar-exclusao.tsx:278, 287). São 35 usos de `FormDialog` e 17 de `ConfirmarExclusao` (52 ações) que terminam sem feedback. O app não tem Sonner nem toast.
- **O mesmo padrão é escrito de jeitos diferentes.** A busca aparece em 5 páginas: 3 com ícone e "Limpar" (master) e 1 sem nenhum dos dois (tesouraria/page.tsx:263–270). Os filtros em pílula estão copiados em 6 páginas. O link "voltar" com `ArrowLeft` se repete em 11 arquivos com a mesma className. O vazio às vezes é `EstadoVazio` e às vezes um `<p>` solto (saidas/page.tsx:119, [usuarioId]/page.tsx:121).
- **O hover de vitrine vazou para o app.** `.vitrine-cartao` (globals.css:228–235: sobe 4px, sombra índigo) aparece em 11 lugares do app, incluindo os cards de turma do master e o `CartaoResumo`. O DESIGN.md diz "app cards never lift".

## Por tela

### /admin/tesouraria — `src/app/(admin)/admin/tesouraria/page.tsx`

- **Objetivo:** ver quem pagou ou está atrasado e registrar ou conferir pagamentos. Quem usa: o membro marcado como tesouraria.
- **Inventário:** até 5 blocos na primeira carga (informes, plano, importar, caixa e regras, busca + filtros + lista). São cerca de 9 ações globais: Montar/Refazer plano, Ajustar por parcela, Ver prévia, Importar, Situação por pessoa, Baixar membros, Saídas do caixa, Editar regras e Buscar. Os 5 filtros são pílulas. Cada membro tem 1 ação (Lançar) e cada informe tem 2 (Confirmar, Recusar). Há 4 diálogos diferentes nesta página.
- **Fricções:**
  - A lista de membros, que é o motivo de abrir a página, só começa depois de 4 cards (:69–261). No celular, isso são várias telas de rolagem.
  - O card "Importar da planilha" fica sempre aberto. Ele traz um textarea de 6 linhas e um parágrafo de ajuda de 4 linhas (form-importar-pagamentos.tsx:247–265), mas é usado uma vez, na migração.
  - Há dois downloads em lugares diferentes. "Baixar a lista de membros" é um link no meio da descrição (:198), e "Situação por pessoa" é um botão (:206).
  - Os números do caixa estão escritos dentro de uma frase (`CardDescription`, :223–226), sem o destaque que a página de saídas dá aos mesmos valores (saidas/page.tsx:45–56).
  - O plano lista todas as parcelas, até 60 (:117–153, `max={60}` em :172), sempre abertas, e cada uma tem um botão "Ajustar".
  - Busca e filtro são dois controles separados. A busca exige clicar em "Buscar" e não tem "Limpar" (:263–270), ao contrário das buscas do master.
  - Cada membro é um `Card` inteiro (:307). Os badges de estado usam âmbar fixo (:328), fora dos tokens.
  - "Confirmar" é um `<form>` sem estado de carregamento nem feedback (acoes-informe.tsx:180–185). Com dois cliques, o pedido sai duas vezes, e a linha só some quando a página revalida.
  - O cabeçalho repete a regra de acesso em 2 linhas com cadeado (:62–66). A pessoa só chega aqui se for tesouraria.
- **Proposta:**
  1. A ação primária é a lista: cabeçalho com busca, filtros e membros.
  2. Mostrar o caixa numa faixa de 3 números logo abaixo do título (Arrecadado de Previsto, Saídas, Saldo), com o link "Saídas" ao lado. Ela substitui o card "Caixa e regras".
  3. "Aguardando sua confirmação" continua no topo quando houver informes (é a fila de trabalho), mas como `Alert` ou seção com lista `Item`, sem card destacado.
  4. Plano, regras e importação saem da página principal. Pode ser (a) uma página `/admin/tesouraria/plano` com o plano, as regras e a importação, ou (b) `Tabs` "Membros | Plano e regras". Ver Decisões.
  5. Um botão "Planilhas ▾" (`DropdownMenu`) reúne "Situação por pessoa", "Lista de membros com email" e "Importar pagamentos…", que abre a importação num `Dialog` ou `Sheet`.
  6. Plano: mostrar o resumo ("10 parcelas, R$ 1.500 por pessoa, 1ª em 10/03") e deixar a lista recolhida num `Collapsible` "Ver parcelas".
  7. Juntar busca e filtros numa linha: `Input type=search` com ícone e limpar (Input Group), filtros como pílulas num componente compartilhado.
- **Componentes:** lista de Cards → um contêiner com `Item`s (avatar, nome, "pagou · falta", Badge, Lançar). Card de importar → `Dialog` ou `Sheet` aberto pelo `DropdownMenu` "Planilhas". Texto do caixa → faixa de estatística (sem Card ou com um Card só). Confirmar → botão com `useFormStatus` (pendente) e `Sonner` "Pagamento confirmado". Badge âmbar → variante `warning` no `badge.tsx`, se o dono aceitar um token novo (ver Decisões).
- **Esforço:** G. **Impacto:** alto. **Risco:** `fluxos.mjs` usa `li[data-membro]`, `li[data-informe]` e os textos "Lançar", "Confirmar" e "Recusar" (fluxos.mjs:1460, 1519, 1528), então os atributos `data-*` e os rótulos precisam ficar iguais. Se o plano mudar de rota, os passos ADR-0005 que montam o plano mudam junto. Os itens do `DropdownMenu` precisam ser alcançáveis por D-pad (o Radix trata isso, mas é preciso testar na TV).

### /admin/tesouraria/saidas — `src/app/(admin)/admin/tesouraria/saidas/page.tsx`

- **Objetivo:** registrar o que foi pago em nome da turma e acompanhar o saldo. Quem usa: a tesouraria.
- **Inventário:** 3 cards (saldo, por fornecedor, saídas). A ação primária é "Lançar saída". Cada linha tem 2 ações (Editar, Excluir), e há uma tabela.
- **Fricções:**
  - O saldo e o detalhamento repetem a informação do card "Caixa e regras" da página principal (tesouraria/page.tsx:223) com outro visual.
  - O card do saldo usa `vitrine-fundo-hero`, um gradiente radial (:45; globals.css:223–226), numa tela de trabalho, e a regra Flat-By-Default não permite isso.
  - Cada linha mostra "Editar" e "Excluir" com rótulo (:141–165). Em listas longas o vermelho se repete; o próprio `ConfirmarExclusao` já prevê `somenteIcone` para esse caso (confirmar-exclusao.tsx:223–226).
  - A tabela "Por fornecedor" é um `<table>` escrito à mão (:86–105).
  - O vazio é um `<p>` (:119), e não o `EstadoVazio`.
  - `CamposSaida`: o checkbox é um `Input type=checkbox` (campos-saida.tsx:148). Os rótulos estão no tamanho padrão, enquanto `CamposLancamento` usa `text-xs` (campos-lancamento.tsx:26), então os dois formulários irmãos parecem diferentes.
  - O "voltar" é escrito à mão (:33–38), e o mesmo bloco aparece em 11 arquivos.
- **Proposta:** a faixa de números fica igual à da página principal (um componente, os dois lugares) e sem gradiente. A ação primária "Lançar saída" vai para o cabeçalho, alinhada à direita. As ações de linha viram um `DropdownMenu` "⋯" (Editar, Excluir…), ou Editar fica como clique na linha. "Por fornecedor" vira uma seção recolhível abaixo das saídas, ou fica como está se houver fornecedores, já que é consulta e não ação.
- **Componentes:** `<table>` → `Table` do shadcn. Linhas → `Item`. `<p>` vazio → `Empty`. Checkbox → `Checkbox` (ou `Switch`) com `Field`. Voltar → `Breadcrumb` ("Tesouraria › Saídas") ou um `LinkVoltar` compartilhado.
- **Esforço:** M. **Impacto:** médio. **Risco:** os testes usam `li[data-saida]` e os textos "Editar" e "Excluir" (fluxos.mjs:1678, 1686). Se essas ações forem para um menu, o roteiro precisa abrir o "⋯" antes. O `Checkbox` do Radix não é um `<input>` nativo e envia `"on"` por um input oculto, então é preciso conferir o parse de `soComissao` na action.

### /admin/tesouraria/[usuarioId] — `src/app/(admin)/admin/tesouraria/[usuarioId]/page.tsx`

- **Objetivo:** ver a situação de uma pessoa e corrigir os lançamentos dela. Quem usa: a tesouraria.
- **Inventário:** 3 cards (situação, parcelas, lançamentos). A ação primária é "Lançar". Cada lançamento tem 2 ações, ou 4 quando está "informado" (Confirmar, Recusar, Editar, Excluir).
- **Fricções:**
  - Um lançamento informado mostra 4 botões empilhados em duas linhas (:323–347). Confirmar ou Recusar é a decisão; Editar e Excluir são correção rara.
  - Os metadados da linha ficam espalhados em 3 linhas de texto (:301–322).
  - O cabeçalho de situação usa gradiente (:230), como na página de saídas.
  - Os vazios são `<p>` soltos (:121).
- **Proposta:** a ação primária "Lançar" vai no cabeçalho, junto do nome. Um lançamento informado mostra só Confirmar e Recusar, e Editar e Excluir ficam no "⋯". As parcelas viram uma `Table` compacta (Parcela · Valor · Vencimento · Estado) ou uma lista recolhida quando tudo estiver pago. A descrição "Do mais recente para o mais antigo" sai: a ordem fica implícita.
- **Componentes:** linhas → `Item` com `ItemActions` (botões de decisão) e `DropdownMenu`. Recusar segue em `FormDialog` (tem campo). Excluir → `AlertDialog`. Feedback → `Sonner`.
- **Esforço:** M. **Impacto:** médio. **Risco:** o `CamposLancamento` é compartilhado com `minha-situacao` (minha-situacao/page.tsx:121, `semTipo`), então qualquer mudança nos campos aparece para o formando. Mantenha os ids com prefixo.

### Componentes da tesouraria (campos-lancamento, campos-saida, saidas-da-turma, form-importar-pagamentos, acoes-informe, botao-imprimir)

- **`CamposLancamento`:** a grade tem 2 colunas fixas (campos-lancamento.tsx:23), sem quebrar para 1 coluna no celular, então 4 controles ficam espremidos em 2 colunas numa tela de 360px. Os rótulos são longos ("Quem pagou, se foi outra pessoa (opcional)", "Referência: id do Pix ou observação (no ajuste, o motivo)", :61, :65–68). "Tipo" tem 3 opções (pagamento, devolução, ajuste; lib/pagamentos.ts:28–32) num `NativeSelect`. **Proposta:** `grid-cols-1 sm:grid-cols-2`. Tipo como `ToggleGroup` ou `RadioGroup` de 3 opções, com "Pagamento" marcado. "Quem pagou" e "Referência" ficam num `Collapsible` "Mais detalhes" que vem aberto quando o tipo for ajuste. Os textos de ajuda vão para `FieldDescription`. Esforço P, impacto médio.
- **`CamposSaida`:** o checkbox é feito à mão dentro de um box `bg-muted/50` (:147–165) → `Field` com `Checkbox`. Os rótulos devem seguir o mesmo tamanho de `CamposLancamento`. Esforço P.
- **`SaidasDaTurma`:** é simples e bom (:7–21). Só vale padronizar com o futuro `Item` em versão densa, ou deixar como está. Esforço P, impacto baixo.
- **`FormImportarPagamentos`:** tem duas etapas no mesmo form, com "Ver prévia" outline e "Importar" primário lado a lado (:267–275). Dá para importar sem ver a prévia, e o texto de ajuda tem 4 linhas. **Proposta:** dentro de um `Dialog` ou `Sheet`, o primeiro passo mostra só "Ver prévia". "Importar N lançamentos" aparece depois da prévia sem erro, porque o botão sabe quantos são. A ajuda fica recolhida em "Formato das colunas". Esforço M, impacto médio. O risco é que a regra "com qualquer linha com problema, nada é importado" não pode mudar.
- **`AcoesInforme`:** "Confirmar" não mostra carregamento nem feedback (:180–185), e o diálogo "Recusar" não tem "Cancelar" (vale para todo `FormDialog`). **Proposta:** botão com estado pendente + Sonner. Ver o "Cancelar" nas mudanças transversais. Esforço P.
- **`BotaoImprimir`:** está ok (:7–13). É usado em presenca/lista e conta/meus-dados, não na tesouraria. Nenhuma mudança.

### /master — `src/app/(master)/master/page.tsx`

- **Objetivo:** dar ao master um panorama da plataforma. Quem usa: o master (ADMIN_MASTER_EMAILS).
- **Inventário:** título + badge "Master" + subtítulo + 4 `CartaoResumo` com link. Não há ação.
- **Fricções:**
  - 4 cartões levam a apenas 2 destinos (:41–44). "Usuários sem turma" abre a lista inteira de usuários, sem filtro. "Dúvidas sem resposta" abre a lista de turmas, que não mostra dúvidas. O próprio `CartaoResumo` diz que "um número sem tela própria não deve virar link mentiroso" (cartao-resumo.tsx:7–10).
  - O badge "Master" (:53–55) repete o título da página e o título do shell ("Gestão da plataforma", layout.tsx:18).
  - Os cartões usam `vitrine-cartao` (cartao-resumo.tsx:23), que sobe e ganha sombra índigo no hover, contra o DESIGN.md.
- **Proposta:** tirar o `href` dos cartões sem destino filtrado ("Dúvidas sem resposta" e "Usuários sem turma") e remover o badge. Mais radical: acabar com a rota de Resumo, mostrar os 4 números numa faixa no topo de /master/turmas e deixar o menu com 2 itens (ver Decisões).
- **Componentes:** `CartaoResumo` sem `vitrine-cartao` dentro do app. Badge removido.
- **Esforço:** P. **Impacto:** médio (corrige links enganosos). **Risco:** `fluxos.mjs:784, 2728` abre `/master` e espera que responda. Se a rota sumir, ela precisa redirecionar para `/master/turmas`.

### /master/turmas — `src/app/(master)/master/turmas/page.tsx`

- **Objetivo:** achar uma turma e abrir. Quem usa: o master.
- **Inventário:** busca (input + Buscar + Limpar), linha de status, grade de 2 colunas com cards-link (ícone, nome, data, 2 badges) e paginação.
- **Fricções:**
  - O cartão é decorativo: tem um tile de ícone `School` (:180–182), uma seta e hover de vitrine (:177). A informação útil é nome, membros e "0 admins".
  - A grade de 2 colunas (:173) dificulta comparar e navegar por D-pad, porque a ordem visual (em Z) não acompanha a lista.
  - A busca exige clicar em "Buscar" (:150) e o "Limpar" é um botão separado (:153–157).
- **Proposta:** uma coluna com `Item` como link (nome; "criada em · por"; badges à direita). Destacar só "sem admin" (`destructive`), que é o sinal que o master precisa ver. Busca num campo só com limpar embutido.
- **Componentes:** cards em grade → lista de `Item`s (`asChild` com `Link`). Busca → `InputGroup` (ícone + `type=search` + botão limpar) num componente `CampoBusca` compartilhado. Vazio → `Empty`.
- **Esforço:** P. **Impacto:** médio. **Risco:** baixo, porque os testes navegam por URL (fluxos.mjs:2755).

### /master/turmas/[turmaId] — `src/app/(master)/master/turmas/[turmaId]/page.tsx`

- **Objetivo:** gerir os membros de uma turma (papel e remoção) ou excluir a turma. Quem usa: o master.
- **Inventário:** cabeçalho (código, criador), busca, lista de Cards de membro com até 2 ações cada, nota sobre o último admin e zona de perigo com exclusão por digitação.
- **Fricções:**
  - "Promover" e "Tornar participante" abrem um `FormDialog` sem nenhum campo (:139–164). É um diálogo de formulário usado como confirmação, sem "Cancelar" e com o botão de enviar sozinho.
  - O botão vermelho "Remover" aparece em todas as linhas (:165–176).
  - Para o único admin, os botões somem sem explicação na linha. A explicação fica no rodapé da lista (:187–192), longe do item.
  - A lista não tem paginação: `getTurma` devolve todos os membros (lib/plataforma.ts:103–129). Numa turma grande isso dá dezenas de Cards.
  - A zona de perigo repete o mesmo parágrafo duas vezes, na `CardDescription` (:200) e no `aviso` do diálogo (:209).
  - O `aviso` é `""` para admin (:171), então a confirmação cai no texto genérico "Não dá para desfazer.", que não diz o que acontece com a pessoa.
- **Proposta:** as ações da linha vão para um `DropdownMenu` "⋯" (Promover a admin / Tornar participante / Remover da turma…). A troca de papel é reversível, então pode ser direta, com toast e sem diálogo, ou usar `AlertDialog` se o dono preferir confirmar. No único admin, mostrar na linha o texto mudo "Único admin" no lugar do menu. Paginar com `Paginacao` como nas outras listas. Na zona de perigo, deixar o texto só no diálogo e uma linha curta no card.
- **Componentes:** Cards → `Item`. `FormDialog` vazio → `DropdownMenuItem` + `AlertDialog` (ou ação direta + `Sonner`). Exclusão da turma → `AlertDialog` com campo de confirmação (mantém a digitação).
- **Esforço:** M. **Impacto:** alto (é a tela mais densa do master). **Risco:** `fluxos.mjs:2762–2767` opera esta tela, então conferir os textos que o roteiro clica. RBAC: as regras "não rebaixar o último admin" e "master não se exclui" ficam na action. Só a apresentação muda.

### /master/usuarios — `src/app/(master)/master/usuarios/page.tsx`

- **Objetivo:** achar uma conta, ver em que turmas está e, raramente, excluir. Quem usa: o master.
- **Inventário:** busca, lista de Cards com 3 faixas cada (identidade + badges; pílulas de turma; rodapé com "Excluir usuário" separado por `border-t`) e paginação.
- **Fricções:**
  - Cada card tem uma faixa só para um botão vermelho rotulado (:354–375). Em 20 usuários, são 20 botões vermelhos.
  - As pílulas de turma são links feitos à mão com `rounded-full border` (:341–347), um estilo que se repete em 11 arquivos.
  - O subtítulo explica a navegação ("para mudar o papel… abra a turma", :261), um sinal de que a ação não está onde a pessoa procura.
- **Proposta:** uma linha `Item` por usuário (avatar, nome, email, badges e turmas como texto com link) e Excluir no "⋯". Manter a confirmação por email, que é LGPD e ação irreversível. Cada turma no "⋯" leva direto para o membro dentro da turma, o que torna o subtítulo desnecessário.
- **Componentes:** Cards → `Item`. Excluir → `DropdownMenuItem variant="destructive"` + `AlertDialog` com campo. Pílulas → `Badge variant="outline" asChild` com `Link`.
- **Esforço:** P/M. **Impacto:** médio. **Risco:** testes de paginação (fluxos.mjs:2745–2753). A digitação do email precisa continuar obrigatória.

### Estados de carregamento e erro do master — `master/loading.tsx`, `master/error.tsx`

- O skeleton usa `max-w-3xl` (loading.tsx:8), mas as páginas usam `max-w-4xl 2xl:max-w-6xl`, então o conteúdo pula ao terminar de carregar. Os blocos de `h-32` também não parecem a lista que vem depois. **Proposta:** um skeleton de lista (título + busca + 5 linhas de `Item`) com a mesma largura. Esforço P.
- O `error.tsx` usa `ErroPagina` com `voltarPara="/dashboard"` (padrão de erro-pagina.tsx:168), e o texto diz "avise a comissão organizadora" (:185–186). Para o master os dois estão errados: deveria voltar para `/master` e não citar a comissão. **Proposta:** passar `voltarPara="/master"` e tornar a frase final opcional. Esforço P.

## Mudanças transversais sugeridas

### Contagens (grep em `src/**/*.tsx`)

| Padrão | Arquivos | Ocorrências | Observação |
|---|---|---|---|
| `window.confirm` / `confirm(` | 0 | 0 | Não há confirmação nativa. Tudo passa por `ConfirmarExclusao`. |
| `<FormDialog` | 18 | 35 | Fecha no sucesso e perde o `estado.ok`, sem "Cancelar". |
| `<ConfirmarExclusao` | 13 | 17 | É um `Dialog` comum fazendo papel de AlertDialog. |
| `<FormAcao` solto (inline na página) | 6 | 9 | O status de sucesso fica inline, sem toast. |
| `useActionState` | 11 | 23 | Cada form trata o próprio feedback. |
| `role="status"` / `role="alert"` | 25 / 9 | 28 / 9 | São mensagens de sucesso e erro inline. Nenhuma usa toast. |
| `<NativeSelect` | 12 | 15 | 4 são filtros em página e 8 estão em formulários. |
| `<Card` (total) | 29 | 74 | |
| Lista de Cards (`<li>` → `<Card>`) | 11 | 11 | membros, presença, tesouraria, votações (2), avisos, tarefas, terceiros, master (3). |
| `<Link>` envolvendo `<Card>` | 4 | 4 | |
| Card dentro de Card | 0 | 0 | Nenhum aninhamento direto foi encontrado. |
| `vitrine-cartao` no app (hover que sobe) | 8 | 11 | Viola "app cards never lift". |
| `vitrine-fundo-hero` em telas do app | 14 | 14 | O gradiente contraria Flat-By-Default. |
| `<EstadoVazio` | 14 | 14 | Há também vazios como `<p>` solto (saidas:119, [usuarioId]:121). |
| `<PaginaVazia` | 0 | 0 | **Código morto.** |
| `<PainelRecolhivel` / `<details` | 6 / 4 | 6 / 8 | |
| `<Paginacao` | 10 | 10 | Falta em master/turmas/[turmaId]. |
| Busca `role="search"` | 5 | 5 | Em 3 variações (com e sem ícone, com e sem "Limpar"). |
| Filtros em pílula (`aria-current={ativo`) | 6 | 6 | Copiados, cada um com sua className. |
| Pílula `rounded-full border … px-` | 11 | 13 | |
| Link "voltar" com `ArrowLeft` | 17 | 17 | 11 com a className idêntica. |
| `<table>` à mão | 4 | 5 | |
| `type="checkbox"` / `type="radio"` à mão | 4 / 3 | 5 / 6 | |
| `<Label>` dentro de `flex flex-col gap-1.5` | | 73 | É o padrão "Field" sem componente. |
| `LoaderCircle` (spinner à mão) | 13 | 28 | |
| `text-amber-700` fixo | | 12 | O "aviso" não tem token. |
| `<Badge` | | 49 | |
| `ui/` subutilizados | | | `sheet`, `separator`: só no sidebar. `dropdown-menu`: só no alternador de tema. `tooltip`: só no shell. `collapsible`: só no shell. |

### Kit de padrões mínimo

**Adicionar:**
```
npx shadcn@latest add sonner alert-dialog item empty field input-group table checkbox toggle-group breadcrumb spinner
```
(Opcional, se o dono escolher Drawer no celular: `drawer`.) Leia `node_modules/next/dist/docs/` antes de instalar, como pede o AGENTS.md. O Sonner exige um `<Toaster />` no root layout.

**Remover ou fundir:**
- `pagina-vazia.tsx`: 0 usos, apagar.
- `ConfirmarExclusao`: manter a API (`alvo`, `nome`, `aviso`, `confirmacao`) e trocar o miolo `Dialog` por `AlertDialog`. O foco vai para "Cancelar", Esc fecha e o papel ARIA vira `alertdialog`. No sucesso, chamar `toast()` em vez de retornar "Excluído." para ninguém.
- `FormDialog`: incluir o botão "Cancelar" (`DialogClose`) ao lado do submit e chamar `toast(estado.ok)` no `onSucesso`. Opcional: `Drawer` abaixo de 640px quando o form passar de 3 campos.
- `FormAcao`: o sucesso vira toast. O erro continua inline (`role="alert"`) e perto do botão. O spinner vira `Spinner`.
- `EstadoVazio` → base `Empty` (`EmptyMedia` com a ilustração, `EmptyTitle`, `EmptyDescription`, `EmptyContent` para uma ação). Manter o nome `EstadoVazio` como wrapper para não quebrar 14 usos.
- `PainelRecolhivel`: manter. O argumento do `<details>` nativo para teclado e leitor de tela é válido (painel-recolhivel.tsx:68–70). Usar `Collapsible` só onde o conteúdo precisa de animação ou de estado controlado de fora.
- `NativeSelect`: **manter** como select padrão. Ele funciona sem JS com Server Actions, abre o seletor nativo no celular e é o mais previsível no D-pad da TV. Para 2–4 opções, trocar por `ToggleGroup`/`RadioGroup`. Não adotar o `Select` do Radix.
- `Paginacao`: manter (Link + `scroll={false}` está correto). Não trocar pelo `Pagination` do shadcn, que só daria números de página.
- `ErroPagina`: manter, mas parametrizar o texto e o `voltarPara`.
- Criar 3 componentes pequenos de feature: `CampoBusca` (InputGroup: ícone, `type=search`, limpar, submit no Enter), `FiltrosPilula` (links com `aria-current` e contagem) e `LinkVoltar` (ou `Breadcrumb` de 2 níveis).
- `.vitrine-cartao` e `.vitrine-fundo-hero`: restringir à vitrine (`components/vitrine`, layouts de auth/onboarding) e tirar das telas do app.

### Padrão → componente → onde aplicar

| Padrão | Componente | Regra de uso | Onde aplicar primeiro |
|---|---|---|---|
| **Lista** (pessoas, saídas, turmas, lançamentos) | `Item` / `ItemGroup` dentro de um só contêiner (ou nenhum), com `divide-y` | Uma linha por registro, uma ação visível no máximo (a primária da linha) e o resto em "⋯". Nada de um Card por linha. | tesouraria (membros, informes, lançamentos), saídas, master/turmas, master/turmas/[id], master/usuarios, depois as outras 7 listas de Cards. |
| **Ações secundárias da linha** | `DropdownMenu` (botão `icon-sm` "⋯" com `aria-label` = "Ações de {nome}") | Editar, Excluir, trocar papel. O destrutivo vai por último, com `variant="destructive"`. | saidas:141, [usuarioId]:324, [turmaId]:137, usuarios:354. |
| **Tabela de números** | `Table` | Só quando há 3 ou mais colunas numéricas comparáveis, dentro de `overflow-x-auto`. | saidas "Por fornecedor" (:86), parcelas em [usuarioId] (:273). |
| **Form curto** (1–4 campos) | `FormDialog` (Dialog + `Field`) com Cancelar | A abertura é um botão com verbo. Sucesso fecha e mostra toast; erro fica inline. | Ajustar parcela, Recusar informe, Regras do dinheiro. |
| **Form longo** (5 campos ou mais, ou com ajuda extensa) | `FormDialog` → `Drawer` no celular / `Sheet` lateral no desktop, campos com `Field` + `FieldDescription`, opcionais em `Collapsible` "Mais detalhes" | Obrigatórios primeiro e opcionais recolhidos. Uma coluna abaixo de 640px. | `CamposLancamento`, `CamposSaida`, importar pagamentos. |
| **Campo de formulário** | `Field` (`FieldLabel`, `FieldDescription`, `FieldError`) | Substitui as 73 ocorrências de `div.flex-col.gap-1.5 > Label + Input`, com tamanho de rótulo único. | campos-lancamento, campos-saida, acoes-informe e todos os forms. |
| **Escolha de 2–4 opções** | `ToggleGroup` (ou `RadioGroup`) | Mostra todas as opções de uma vez, sem abrir lista. Para 5 ou mais, `NativeSelect`. | Tipo do lançamento (3), Forma (4). |
| **Sim/não** | `Checkbox` + `Field` | Substitui o `Input type=checkbox`. | campos-saida:148 e os outros 4 arquivos. |
| **Confirmação destrutiva** | `AlertDialog` (dentro de `ConfirmarExclusao`) | Sempre mostrar o nome do item. Pedir digitação só quando apaga em cascata (turma, usuário). Foco inicial em "Cancelar". | Os 17 usos de `ConfirmarExclusao`. |
| **Confirmação não destrutiva e reversível** | Ação direta + `toast` com "Desfazer" quando a action permitir; senão `AlertDialog` | Não abrir um `FormDialog` sem campos. | Promover/Tornar participante (master/turmas/[turmaId]:139). |
| **Feedback de sucesso** | `Sonner` (`toast.success`) | Toda ação que fecha diálogo ou muda a lista. O texto vem de `estado.ok`. | `FormDialog`, `ConfirmarExclusao`, `AcoesInforme`, `FormAcao`. |
| **Erro de formulário** | Inline: `FieldError` no campo ou `role="alert"` junto do botão | Nunca em toast: o erro precisa ficar visível enquanto a pessoa corrige. | `FormAcao`, `ConfirmarExclusao`. |
| **Aviso de contexto na página** | `Alert` | Fila de pendências ("3 pagamentos aguardando"), turma arquivada, "único admin". | tesouraria informes (:69), [turmaId] (:187). |
| **Vazio** | `Empty` (via `EstadoVazio`) | Título + 1 frase + no máximo 1 ação. A ilustração é opcional; em sub-seções, usar `Empty` sem ilustração. | saidas:119, [usuarioId]:121 e os 14 usos atuais. |
| **Carregando (página)** | `Skeleton` no formato da tela (`loading.tsx` por grupo) | Mesma largura máxima da página e com a forma de lista. | master/loading.tsx, admin/loading.tsx. |
| **Carregando (botão)** | `Spinner` + rótulo no gerúndio + `disabled` | Substitui os 28 `LoaderCircle` à mão. Todo submit precisa ter. | `AcoesInforme` "Confirmar" (que hoje não tem). |
| **Busca** | `CampoBusca` (`InputGroup` + `type=search`) | Envia no Enter e tem limpar embutido. A frase "N encontrados" fica com `role="status"`. | Os 5 `role="search"`. |
| **Filtro por estado** | `FiltrosPilula` (Links com `aria-current` e contagem) | Estado na URL, rolagem horizontal no celular. | Os 6 arquivos com pílulas. |
| **Números-chave** | Faixa de estatística (`dl` em grade, sem gradiente) | Até 3 ou 4 números, `tabular-nums`. Clique só se houver destino filtrado. | tesouraria (caixa), saidas, [usuarioId], /master. |
| **Voltar / hierarquia** | `Breadcrumb` (2 níveis) ou `LinkVoltar` | Só em sub-rotas. | Os 17 `ArrowLeft`. |
| **Downloads e ações raras** | `DropdownMenu` "Planilhas ▾" ou "Mais ▾" | Agrupa exportações e importação fora do fluxo principal. | Tesouraria (3 links). |

## Decisões que precisam do dono do produto

1. **Onde ficam plano, regras e importação da tesouraria?**
   - (a) Sub-rota `/admin/tesouraria/plano`, irmã de `/saidas`.
   - (b) `Tabs` "Membros | Plano e regras | Saídas" numa só rota (as abas viram links de rota).
   - (c) Continua na mesma página, mas recolhido (`Collapsible`) abaixo da lista.
   - **Recomendo (b):** as três partes da tesouraria ficam visíveis e a lista volta ao topo. Com abas que são rotas, os links atuais continuam funcionando.
2. **Sucesso com toast (Sonner)?**
   - (a) Sim, em todas as ações que fecham diálogo ou mudam a lista.
   - (b) Só nas destrutivas e financeiras.
   - (c) Não; manter a mensagem inline e deixar o diálogo aberto mostrando "Salvo".
   - **Recomendo (a).** Hoje 52 ações terminam sem feedback. O toast precisa ser anunciado por leitor de tela (o Sonner usa `aria-live`) e não pode roubar o foco na TV.
3. **Ações de linha nas listas.**
   - (a) Menu "⋯" com tudo menos a ação primária.
   - (b) Botões só com ícone e tooltip.
   - (c) Manter os botões com rótulo.
   - **Recomendo (a).** Ícone sem rótulo é ruim no D-pad e no toque, e o "⋯" deixa uma parada de foco por linha.
4. **Trocar papel no master.**
   - (a) Ação direta + toast com "Desfazer".
   - (b) `AlertDialog` de confirmação.
   - (c) Manter como está.
   - **Recomendo (b) por enquanto,** porque a action não devolve um "desfazer". Migrar para (a) se isso ganhar suporte.
5. **Resumo do master (/master).**
   - (a) Manter a página e tirar os links que não filtram.
   - (b) Acabar com a rota (redirect para /master/turmas, números numa faixa no topo, menu com 2 itens).
   - (c) Criar filtros reais (`?semTurma=1`, `?semAdmin=1`) para os cartões apontarem para algo.
   - **Recomendo (a) agora** (esforço P) **e (c) depois,** se o master pedir. A opção (b) quebra `fluxos.mjs:2728` sem ganho grande.
6. **Cor de "atrasado/aviso".**
   - (a) Criar um token `--warning` e uma variante `Badge warning` (12 usos de âmbar fixo).
   - (b) Usar `destructive` para atraso.
   - (c) Manter neutro (outline) sem cor.
   - **Recomendo (a).** Atraso não é erro, e o DESIGN.md hoje não tem esse papel. O valor precisa passar no contraste nos dois temas.
7. **Form longo no celular.**
   - (a) `Drawer` (bottom sheet) abaixo de 640px e `Dialog` acima.
   - (b) `Dialog` sempre, com rolagem interna.
   - (c) Página própria para forms longos.
   - **Recomendo (b) e uma coluna no celular,** com opcionais recolhidos. Isso já resolve o lançamento e a saída sem trazer um componente novo. O `Drawer` (arrastar) não tem equivalente no D-pad.
8. **Cards no app.**
   - (a) Card só para agrupar uma seção (no máximo 3 por tela), e listas com `Item`.
   - (b) Manter Card por item.
   - **Recomendo (a),** coerente com "Flat-By-Default" e com o distill.md ("Cards aren't needed for basic layout"). Junto disso, tirar `vitrine-cartao` e `vitrine-fundo-hero` das telas internas.
