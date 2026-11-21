# Grupo A: shell, público e conta (auditoria UX, só leitura)

Caminhos relativos a `src/`. Nenhum arquivo do repo foi alterado.

## Visão geral do grupo

- **Duas "casas" para quem é da comissão.** Participante e admin usam o mesmo `AppShell`, mas cada um com seu menu (`app/(app)/layout.tsx:16-27` e `app/(admin)/admin/layout.tsx:12-17`). O admin troca de menu inteiro ao ir de "Administrar a turma" para "Voltar para a turma" (rodapé, `app/(app)/layout.tsx:46-48` e `admin/layout.tsx:40`). Além disso, as tarefas de admin ficam espalhadas: avisos, dúvidas, tarefas e terceiros ele administra nas páginas do participante (os controles aparecem por papel em `avisos`, `duvidas`, `tarefas` e `terceiros`). Membros, presença, catálogos e turma ficam na outra área. Os cards do dashboard levam o admin para a outra área sem avisar (`app/(app)/dashboard/page.tsx:291-327`).
- **Navegação secundária repetida e sem padrão.** Cada página ou layout fora do shell tem o seu "← Voltar": `(conta)/layout.tsx:28-33`, `meus-dados/page.tsx:245-250`, `registro-turma.tsx:66-71`, `termos/page.tsx:13-18`, `privacidade/page.tsx:14-19` e `layout-auth.tsx:53-58`. Em `/conta/meus-dados` aparecem dois "voltar" um embaixo do outro.
- **Ações pouco usadas ocupam lugar nobre.** O tema fica no header de todas as telas logadas (`app-shell.tsx:213`). A lista de turmas abre expandida no topo da sidebar (`app-shell.tsx:103`). Já "Minha conta" e "Sair" somem quando a sidebar fica só com ícones (`app-shell.tsx:175` e `196`).
- **Texto explicativo longo e repetido.** O aviso legal do Google e o checkbox de aceite aparecem juntos no cadastro (`botao-google.tsx:52-62` e `form-email-senha.tsx:174-196`). "Não dá para desfazer" aparece duas vezes no mesmo card (`conta/page.tsx:150` e `177`). Descrições de 3 linhas aparecem antes de um único botão (`conta/page.tsx:76` e `form-senha.tsx:73`).
- **Escolhas iguais sem uma ação primária.** No onboarding, "Entrar na turma" e "Criar turma" têm o mesmo peso (`convite/page.tsx:52-55`). No login, "Entrar/Criar conta" aparece duas vezes (`form-email-senha.tsx:109-128` e `213-222`). Em `/conta` há 5 cards com o mesmo peso visual (`conta/page.tsx:43-189`).
- **Conteúdo duplicado.** `/registro` e `/admin/turma/registro` renderizam o mesmo componente (`registro/page.tsx:14` e `admin/turma/registro/page.tsx:13`). "Relatório" e "Registro da turma" são dois itens de menu e os dois mostram resultado de votações (`registro-turma.tsx:124-154` e `votacoes/relatorio/page.tsx:38-44`).

## Por tela

### Navegação global (shell), em `components/features/app-shell.tsx` + layouts dos grupos

- **Objetivo:** levar participante, comissão e master à tarefa certa da turma ativa, em celular, tablet e TV.
- **Inventário:**
  - Participante: 9 itens principais (`(app)/layout.tsx:16-27`), 8 para observador (`:41`).
  - Rodapé: até 3 links ("Administrar a turma", "Gestão da plataforma", "Minha conta"; `:45-53`).
  - Grupo "Minhas turmas": N turmas + "Outra turma" (`app-shell.tsx:101-158`).
  - Footer: avatar, nome, email e Sair (`:189-200`).
  - Header: trigger, logo, nome da turma e tema (`:205-214`).
  - Admin: 4 a 5 itens (`admin/layout.tsx:12-17`, Tesouraria condicional em `:31-35`) + 3 rodapés.
  - Master: 3 itens + "Voltar para a turma" (`master/layout.tsx:5-9` e `:21`).
- **Fricções:**
  - 9 itens planos sem agrupamento (`(app)/layout.tsx:16-27`). "Votações" e "Relatório" são a mesma área dividida em dois itens (`:21-22`). "Registro da turma" é material de consulta e disputa espaço com ações do dia a dia (`:24`).
  - O admin tem dois menus. "Votações" aparece nos dois com destinos diferentes (`/votacoes` e `/admin/votacoes`; `(app)/layout.tsx:21` e `admin/layout.tsx:15`), mas o título real da página admin é "Catálogos de enquetes" (`admin/votacoes/page.tsx:21`).
  - O caminho de volta para a área do participante fica no rodapé, escondido no modo só ícones (`app-shell.tsx:175`). Quem recolhe a sidebar perde "Administrar a turma", "Minha conta" e "Sair" (`:196`).
  - Trocar de turma é um Collapsible aberto por padrão (`:103`) acima do menu principal, o que empurra a navegação para baixo. Cada turma é um `<form>` (`:118-138`). O selo "arquivada" usa `text-[10px]` (`:132`), abaixo da escala tipográfica do DESIGN.md (label = 0.75rem).
  - O avatar do footer não é clicável (`:191`). A conta só abre pelo link de texto no rodapé.
  - Master: "Voltar para a turma" aparece sempre (`master/layout.tsx:21`), mesmo para master sem turma. Nesse caso `/dashboard` cai no fluxo sem turma.
  - Header mobile: logo + nome da turma em `text-xs` alinhado à direita e truncado (`app-shell.tsx:207-212`). O nome da página não aparece, e o tema ocupa o único lugar livre (`:213`).
  - `/admin` só redireciona (`admin/page.tsx:9-11`). Não existe "início do admin", o que confirma que o admin vive no dashboard comum.
- **Proposta (arquitetura):**
  1. **Um shell só, menu por papel.** O layout `(admin)` passa a usar o mesmo menu do `(app)`, com um `SidebarGroup` rotulado **"Comissão"** que só aparece para `papel === "admin"`:
     - Membros
     - Presença
     - Tesouraria (se tesouraria)
     - Catálogos (`/admin/votacoes`)
     - Configurações da turma (`/admin/turma`)

     As rotas e os guards `exigirAdmin()` continuam iguais, então o RBAC não muda. Saem "Administrar a turma" e "Voltar para a turma".
  2. **Participante: de 9 para 7 itens em 2 grupos.**
     - Grupo sem rótulo: Início, Avisos, Votações, Dúvidas, Tarefas.
     - Grupo "Você" (ou sem rótulo): Minha situação, Terceiros.

     "Relatório" vira uma aba dentro de Votações. "Registro da turma" vai para o seletor de turma e para um card do Início (decisão abaixo).
  3. **Seletor de turma no `SidebarHeader`** (padrão "team switcher" do bloco sidebar do shadcn): um `DropdownMenu` com o nome da turma ativa e o papel, a lista de turmas (`DropdownMenuRadioGroup`, ainda chamando `trocarTurma`), "Entrar em outra turma" e "Registro da turma". Fica visível em qualquer estado da sidebar.
  4. **Menu do usuário no `SidebarFooter`** (padrão "nav-user"): o avatar abre um `DropdownMenu` com Minha conta, Tema (submenu de rádio, reaproveitando a lógica de `alternador-tema.tsx`), Gestão da plataforma (só master) e Sair. Remove o grupo de rodapé (`app-shell.tsx:174-186`) e tira o tema do header.
  5. **Celular (<768px):** `bottom nav` fixo com 4 destinos + "Menu", que abre a sidebar já existente em Sheet. Destinos: Início, Votações, Avisos, Dúvidas. O header fica com trigger + nome da turma. TV e tablet continuam com a sidebar fixa, que já funciona com D-pad.
  6. Master sem turma: esconder "Voltar para a turma" quando não há vínculo.
- **Componentes:**
  - Rodapé de links → `DropdownMenu` (nav-user).
  - `Collapsible` de turmas → `DropdownMenu` + `DropdownMenuRadioGroup` (team switcher).
  - Selo `text-[10px]` → `Badge variant="outline"`.
  - Itens planos → `SidebarGroup` + `SidebarGroupLabel`.
  - `bottom nav` → componente novo com `Link` + `aria-current`, `print:hidden` e `pb-[env(safe-area-inset-bottom)]`.
- **Esforço G · Impacto alto · Riscos:**
  - Os rótulos mudam (não há testes em `src/**/*.test.*` que referenciem esses rótulos; conferido com grep).
  - `CAMINHOS_LIVRES` (`conteudo-turma.tsx:10`) continua valendo.
  - DropdownMenu do Radix navega por setas (bom para D-pad), mas é preciso testar o foco ao fechar.
  - O `bottom nav` exige compensar o padding do `main` e não pode cobrir botões de envio nem o teclado virtual.
  - `SidebarNavLink` (`sidebar-nav-link.tsx:25`) precisa de `exato` em "Votações" quando a aba Resultados for `/votacoes/relatorio`, senão os dois destinos acendem juntos (hoje já usa `exato`, em `(app)/layout.tsx:21`).

### `/` (vitrine), em `app/(publico)/page.tsx`

- **Objetivo:** visitante entende o produto e entra. Quem já está logado vai para o painel.
- **Inventário:**
  - 8 seções (`page.tsx:32-39`).
  - Header com 4 âncoras (só a partir de `md`), tema e Entrar (`secoes.tsx:57-84`).
  - Hero com 2 CTAs (`:131-139`).
  - CTA final (`:512-534`).
  - Rodapé com 5 links (`:546-561`).
- **Fricções:**
  - Hero com duas ações de peso parecido ("Entrar" e "Conhecer os recursos", `secoes.tsx:133-138`). A segunda só rola a página.
  - "Equipe", "Ilustração" e os links "Código no GitHub" e "Guia do projeto" (`:552-557`) falam com avaliadores/desenvolvedores, não com formandos.
  - Para o logado, a página inteira é desvio: o único destino útil é "Abrir meu painel" (`secoes.tsx:39-40`).
  - No celular as âncoras somem (`:70`) e não são substituídas por nada. Isso é aceitável, porque a página é linear.
- **Proposta:**
  - Uma ação primária ("Entrar"). "Conhecer os recursos" vira link de texto ou sai.
  - Juntar "Equipe" e "Ilustração" numa única seção, ou levar para o rodapé (decisão do dono, porque é trabalho acadêmico).
  - Opcional: logado em `/` → redirect para `/dashboard`. Hoje o código escolhe mostrar a vitrine com "Abrir meu painel"; também é decisão do dono.
- **Componentes:** sem troca relevante. A âncora secundária vira `Button variant="link"`, ou sai.
- **Esforço P · Impacto baixo · Risco:** as animações de `VitrineAnimada` dependem de `data-hero`/`data-reveal`. Remover uma seção não quebra nada, mas é preciso conferir o caminho sem JS (DESIGN.md "Do": safety timer).

### `/entrar`, em `app/(publico)/entrar/page.tsx` + `form-email-senha.tsx`, `botao-google.tsx`, `campo-senha.tsx`, `layout-auth.tsx`

- **Objetivo:** entrar ou criar conta, inclusive vindo de um link de convite (`?voltar=`).
- **Inventário:**
  - Alternância Entrar/Criar duas vezes (`form-email-senha.tsx:109-128` e `:213-222`).
  - Botão Google + texto legal (`botao-google.tsx:42-62`), divisor (`form-email-senha.tsx:133-137`).
  - 2 a 3 campos, checkbox de aceite no cadastro (`:174-196`), "Esqueci a senha" (`:156-161`), submit.
  - Header do layout com Voltar, logo e tema (`layout-auth.tsx:52-63`).
  - No desktop, painel com 4 benefícios (`:24-49`).
- **Fricções:**
  - **Alternância duplicada:** o segmented no topo e o "Ainda não tem conta? Criar conta" embaixo fazem a mesma coisa.
  - O segmented é feito à mão com `aria-pressed` (`:109-127`), não é o componente de abas.
  - Título "Bem-vindo de volta" (`:100`) para quem chega pela primeira vez via convite. O modo padrão é sempre "Entrar" (`:26`), mas quem vem de convite provavelmente vai criar conta.
  - No modo Criar, o aviso de aceite aparece duas vezes: o parágrafo do Google (`botao-google.tsx:52-62`) e o checkbox (`form-email-senha.tsx:174-196`).
  - Os links de Termos/Privacidade abrem na mesma aba (`:186-192`) e perdem o formulário já preenchido.
  - O checkbox é um `Input type="checkbox"` (`:176-182`) em vez do componente Checkbox.
  - "Mínimo de 8 caracteres." (`:171`) aparece no cadastro, mas na redefinição o mesmo texto vem de outro componente. Isso é consistente, só fica registrado.
  - Painel de benefícios no desktop (`layout-auth.tsx:24-49`): repete a vitrine, mas não atrapalha no celular.
- **Proposta:**
  - Manter uma única alternância: `Tabs` no topo ("Entrar" | "Criar conta") e remover a linha de baixo, ou o contrário (decisão abaixo).
  - Quando `destino` vier de convite (`/convite?codigo=`), abrir em "Criar conta" com o título "Crie sua conta para entrar na turma".
  - Mostrar o aviso legal uma vez só: no modo Criar, esconder o parágrafo do Google, porque o checkbox já cobre o aceite. Para o Google no modo Entrar, o parágrafo continua.
  - Termos/Privacidade com `target="_blank"`, ou num `Dialog`/`Drawer` de leitura.
- **Componentes:**
  - Segmented manual → `Tabs`.
  - `Input type=checkbox` → `Checkbox` + `Field`.
  - Mensagens `role=alert` → `Alert` (variante destructive).
  - Blocos label+input → `Field`.
- **Esforço P · Impacto alto · Riscos:**
  - Abrir em "Criar" depende de detectar o convite pelo `destino` (só leitura do parâmetro, sem mudança de regra).
  - `Tabs` do Radix usa setas, o que funciona com D-pad. O aceite legal continua obrigatório (LGPD), muda só a apresentação.

### `/esqueci-senha`, em `app/(publico)/esqueci-senha/page.tsx` + `form-senha.tsx:29-88`

- **Objetivo:** receber por email o link para definir ou redefinir a senha.
- **Inventário:** 1 campo, 1 botão, Voltar ao login. Estado de sucesso com 1 botão.
- **Fricções:**
  - O link diz "Esqueci a senha" (`form-email-senha.tsx:160`), mas a página se chama "Definir senha" (`esqueci-senha/page.tsx:5`, `form-senha.tsx:72`). O nome muda no meio do caminho.
  - A descrição tem 3 frases e 2 perguntas (`form-senha.tsx:73`) para um formulário de 1 campo. O caso "entrei com Google e quero senha" é raro e domina o texto.
  - O email digitado em `/entrar` não é levado adiante, então a pessoa digita de novo.
- **Proposta:**
  - Título "Esqueci a senha", descrição de uma frase ("Enviamos um link para criar uma nova senha.").
  - O caso Google vai para uma linha de ajuda (`FieldDescription`) ou para `/conta`.
  - Pré-preencher o email via `?email=` vindo do link de `/entrar`.
- **Componentes:** `Field` + `Alert` para o erro.
- **Esforço P · Impacto médio · Risco:** o pré-preenchimento põe o email na URL (fica no histórico). Avaliar se vale, por LGPD; a alternativa é `sessionStorage`.

### `/redefinir-senha`, em `app/(publico)/redefinir-senha/page.tsx` + `form-senha.tsx:90-145`

- **Objetivo:** definir a nova senha a partir do link.
- **Inventário:** 1 campo com olho, 1 botão. Estados de sucesso e de link inválido (`page.tsx:20-33`).
- **Fricções:**
  - Depois de salvar, a pessoa precisa ir ao login e digitar tudo de novo (`form-senha.tsx:121-123`). É limitação do fluxo; não proponho login automático porque mudaria o fluxo de autenticação.
  - O cabeçalho/ícone de sucesso e de erro é montado à mão em dois lugares (`page.tsx:21-28`, `form-senha.tsx:52-58` e `114-117`).
- **Proposta:** levar o email para `/entrar` (`/entrar?email=`), para a pessoa só digitar a senha. Unificar os estados "resultado" num único componente.
- **Componentes:** estados de resultado → `Empty` (ícone, título, descrição, ação). Erro → `Alert`.
- **Esforço P · Impacto baixo · Risco:** baixo.

### `/termos` e `/privacidade`, em `app/(publico)/termos/page.tsx` e `privacidade/page.tsx`

- **Objetivo:** leitura legal pública.
- **Inventário:** 8 seções (termos) e 9 seções (privacidade), em texto corrido, mais "← Início".
- **Fricções:**
  - "← Início" sempre leva para `/` (`termos/page.tsx:13-18`, `privacidade/page.tsx:14-19`). Quem veio do checkbox de cadastro ou de `/conta` perde o contexto.
  - Caminho interno de repositório no texto público: "(`docs/auditoria-direitos/PSI.md`)" (`privacidade/page.tsx:127`). É jargão sem utilidade para o titular.
  - Sem índice. No celular, chegar em "Seus direitos" (`privacidade/page.tsx:93`) exige rolar muito.
  - Sem tema e sem header comum às outras páginas públicas (não usam `LayoutAuth`).
- **Proposta:**
  - O "voltar" usa o histórico quando houver (com fallback para `/`), ou o link de origem abre em nova aba (ver `/entrar`).
  - Trocar a citação do arquivo por "nossa Política de Segurança da Informação" (o significado legal se mantém; o dono confirma).
  - Pôr um índice curto de âncoras no topo.
- **Componentes:** índice → lista de links simples. **Não** usar `Accordion`: texto legal precisa estar todo visível e imprimível.
- **Esforço P · Impacto baixo · Risco:** muda a redação de texto legal. Precisa de aprovação do dono e talvez nova versão do documento (as linhas de versão estão em `termos:20` e `privacidade:23`).

### `/evento/[token]`, em `app/(publico)/evento/[token]/page.tsx`

- **Objetivo:** família e convidados veem quando, onde e como chegar, sem login.
- **Inventário:** título, aviso de mudança, `dl` com 4 itens, acessibilidade, descrição, programação, rodapé. 1 ação ("Como chegar").
- **Fricções:**
  - "Como chegar" com `py-1.5` (`:86`), abaixo dos 44px de toque exigidos pelo DESIGN.md ("Do: floor 44px"), justo na página mais usada no celular.
  - A única ação está enterrada dentro do item "Onde" (`:80-91`).
  - O aviso de mudança usa `amber-*` direto (`:41-43`). É coerente com `conteudo-turma.tsx:39`, mas não é token.
- **Proposta:** "Como chegar" como `Button` de tamanho padrão, com área de toque de 44px, perto do topo (logo depois de "Quando/Onde"). O resto está enxuto. Mudar pouco.
- **Componentes:** `<a>` estilizado → `Button asChild variant="outline"`. Aviso → `Alert`.
- **Esforço P · Impacto médio · Risco:** baixo. A página é pública e sem JS de cliente.

### `/convite` (onboarding), em `app/(onboarding)/convite/page.tsx` + `convite-forms.tsx` + `(onboarding)/layout.tsx`

- **Objetivo:** quem não tem turma entra por código (caso comum) ou cria uma turma (caso raro, só comissão).
- **Inventário:**
  - Header com logo, "Minha conta", email e Sair (`layout.tsx:24-37`).
  - Até 2 links de volta/master (`:39-59`).
  - Selo, título, descrição, card "você foi convidado" (`page.tsx:42-47`) e aviso institucional (`:48-50`).
  - 2 cards-formulário com o mesmo peso (`:52-55`, `convite-forms.tsx:96-174`).
- **Fricções:**
  - **Duas ações primárias iguais.** Mesmo quando o código veio do link e a turma já foi identificada (`page.tsx:25-27`, `42-47`), "Criar turma" aparece do lado com o mesmo destaque. O participante convidado pode criar uma turma por engano.
  - O texto do card explica o que fazer com o código já preenchido (`convite-forms.tsx:107-108`) em vez de apenas confirmar.
  - Aviso institucional longo (`empresa.ts:16-18`) entre o título e a ação.
  - Selo + título + parágrafo dizem a mesma coisa (`page.tsx:31-41`).
  - O header não tem o tema, que só se troca nas telas logadas, no `LayoutAuth` e na vitrine.
- **Proposta:**
  - **Com código do link:** um único card "Entrar na turma X" (nome da turma no título, botão primário). "Criar uma turma" vira link de texto abaixo.
  - **Sem código:** card do código como primário. "Quero criar uma turma" fica num `Collapsible` ("Sou da comissão e quero criar a turma") que abre o campo de nome.
  - Remover o selo e encurtar a descrição. O aviso institucional vai para o rodapé da página.
- **Componentes:**
  - 2 Cards → 1 Card + `Collapsible`.
  - Input do código → `InputOTP` de 8 casas, com o mesmo visual dos "Invite-Code Tiles" do DESIGN.md e aceitando colar.
  - Erro → `Alert`.
- **Esforço M · Impacto alto · Riscos:**
  - `InputOTP` precisa aceitar colar o código inteiro e funcionar com teclado e D-pad. Se for arriscado, manter o Input atual.
  - A regra "só admin/observador entra em outra turma" (`vinculos.ts:11-13`) não muda.

### `/conta`, em `app/(conta)/conta/page.tsx` + `(conta)/layout.tsx`

- **Objetivo:** ajustar nome e emails, baixar os dados e excluir a conta.
- **Inventário:**
  - Header próprio (`layout.tsx:16-26`) + "← Voltar para a turma" (`:28-33`).
  - Avatar/nome/email e 5 cards (`page.tsx:43-189`).
  - 7 a 8 botões: Salvar nome, alternar emails, Ver PDF, Baixar JSON, Falar com DPO, Política, Termos, Excluir.
- **Fricções:**
  - Fora do shell: para ir de `/conta` a qualquer outra tela é preciso o "Voltar" e depois o menu. São dois layouts quase iguais (`(onboarding)/layout.tsx:24-37` e `(conta)/layout.tsx:16-26`).
  - 5 cards com o mesmo peso e `mt-8` cada. Ícones decorativos em caixinha (`:94`, `:115`, `:143`) aumentam o ruído.
  - Emails da turma: a descrição tem cerca de 60 palavras (`:76`) e a ação é um botão de texto longo que inverte o estado (`:84-87`). O estado atual só aparece no texto.
  - Excluir: "Não dá para desfazer" duas vezes (`:150` e `:177`). O formulário de exclusão fica sempre aberto no fim da página (`:169-186`).
  - O card "Privacidade e DPO" mistura contato, aviso institucional e 2 links legais (`:118-137`).
  - Tema não está aqui, apesar de ser preferência da conta.
- **Proposta:**
  - Uma página em 3 seções planas, sem cards aninhados:
    - **Perfil:** nome e salvar.
    - **Preferências:** emails da turma com `Switch` e descrição de 1 linha; tema.
    - **Seus dados:** ver/PDF como primário, JSON como link; DPO numa linha com `mailto`; Termos e Privacidade como links.
  - **Zona de perigo** no fim: botão "Excluir minha conta" que abre um `AlertDialog` com o impacto (`:148-154`) e a confirmação por email (`:179-185`).
  - Quando o usuário tem turma, renderizar dentro do `AppShell` (como item do menu do usuário). Para quem não tem turma, manter o layout simples.
- **Componentes:**
  - Cards → seções com `Separator` + `Item` (título, descrição, ação à direita).
  - Botão alternar → `Switch` (é um form; precisa de submit automático ou de um pequeno client component).
  - Exclusão inline → `AlertDialog`.
  - Mensagens de `FormAcao` → `Sonner` para "Nome salvo".
- **Esforço M · Impacto médio · Riscos:**
  - A exclusão continua exigindo digitar o email (regra atual), e só a moldura muda. `AlertDialog` precisa de foco inicial e retorno de foco testados (D-pad).
  - O `Switch` não deve salvar sem feedback.
  - Pôr `/conta` no shell exige que o shell funcione sem turma para quem não tem vínculo; é por isso que a proposta mantém o layout simples nesse caso.

### `/conta/meus-dados`, em `app/(conta)/conta/meus-dados/page.tsx`

- **Objetivo:** ver e imprimir tudo o que o sistema guarda sobre a pessoa (LGPD, art. 18).
- **Inventário:** 1 + 12 seções (`:206-219`), botão Imprimir, 2 links de volta (layout + página).
- **Fricções:**
  - **Dois "voltar" seguidos:** o "Voltar para a turma" do layout (`(conta)/layout.tsx:28-33`) e o "Minha conta" da página (`meus-dados/page.tsx:245-250`).
  - Rótulos são nomes de coluna do banco com `_` trocado por espaço (`:222`, ex.: "registrado em").
  - Objetos aparecem como JSON cru (`:228`).
  - Seções vazias ocupam um título inteiro cada (`:282-283`). Com 12 seções, a maioria vazia para um participante novo, a página fica longa e sem informação.
- **Proposta:**
  - Um só "voltar" (o da página, para Minha conta). O layout esconde o seu quando a rota for `/conta/meus-dados`, ou a página passa a viver no shell.
  - Juntar as seções vazias numa linha só no fim: "Sem registros: Pagamentos, Tarefas…".
  - Dicionário de rótulos para as chaves mais comuns. Não altera o dado, só o rótulo.
- **Componentes:** seções → `Accordion type="multiple"` com contagem no gatilho. **Na impressão, forçar tudo aberto** (`print:` + `forceMount`).
- **Esforço M · Impacto médio · Risco:** a impressão é o objetivo da página (ADR-0007). O Accordion fechado não pode sumir do PDF; testar `window.print()`.

### `/registro` (participante), em `app/(app)/registro/page.tsx` + `components/features/registro-turma.tsx`

- **Objetivo:** consultar e imprimir o que a turma decidiu (ADR-0020).
- **Inventário:** "← Início", título, Imprimir, texto de ajuda, até 7 seções (`registro-turma.tsx:84-218`).
- **Fricções:**
  - "← Início" (`registro/page.tsx:14`, `registro-turma.tsx:66-71`) repete o que a sidebar já faz e não aparece em outras páginas do shell.
  - É item fixo do menu principal (`(app)/layout.tsx:24`) para algo consultado raramente (impressão, fim da turma).
  - "Resultado das votações" (`registro-turma.tsx:124-154`) repete o "Relatório" (`/votacoes/relatorio`), que também é item de menu.
  - O texto de ajuda (`:79-82`) explica a janela de impressão em toda visita.
- **Proposta:**
  - Remover o "voltar" quando a página está dentro do shell.
  - Tirar o item do menu principal (decisão abaixo): fica no seletor de turma, num card do Início e na faixa de turma arquivada (que já linka, `conteudo-turma.tsx:52` e `60`).
  - A dica de impressão vai para o `Tooltip`/`title` do botão Imprimir, ou fica só a frase de privacidade.
  - A URL `/registro` **tem que continuar**: os emails apontam para ela (`lib/email.ts:656` e `682`) e ela está no `matcher` do proxy (`proxy.ts:53-54`).
- **Componentes:** sem troca. As tabelas simples (`:135-149`, `:168-178`) podem virar `Table` do shadcn, já que o visual é de impressão.
- **Esforço P · Impacto médio · Risco:** baixo. Conferir se `CAMINHOS_LIVRES` (`conteudo-turma.tsx:10`) continua cobrindo `/registro`.

### `/admin/turma/registro`, em `app/(admin)/admin/turma/registro/page.tsx`

- **Objetivo:** o mesmo registro, para a comissão.
- **Inventário:** idêntico ao de `/registro` (mesmo componente, `:13`). Só muda o "voltar" para "Turma".
- **Fricções:** é uma rota duplicada sem diferença de conteúdo. O próprio comentário diz "O mesmo conteúdo, sem mudança" (`:8-9`), e o mesmo vale para `registro-turma.tsx:41-43`. São duas URLs para manter e dois itens em `CAMINHOS_LIVRES`.
- **Proposta:** `/admin/turma/registro` → `redirect("/registro")`, no mesmo padrão já usado em `admin/page.tsx:9-11`. O botão em `admin/turma/page.tsx:52` passa a apontar para `/registro`.
- **Componentes:** nenhum.
- **Esforço P · Impacto baixo (manutenção) · Risco:** links guardados continuam funcionando por causa do redirect. Dá para tirar `/admin/turma/registro` de `CAMINHOS_LIVRES` depois.

## Mudanças transversais sugeridas

1. **`AppShell` com menu por papel** (`SidebarGroup` "Comissão"), **team switcher** no header e **nav-user** no footer, todos com `DropdownMenu`. Isso acaba com os rodapés de links e com a troca de shell.
2. **Abas para subáreas** (`Tabs` ou links com `aria-current`): Votações → "Votar | Resultados" (absorve Relatório). O mesmo padrão serve para Presença (`/admin/presenca` e `/lista`) e Tesouraria (`/saidas`), a confirmar pelos outros grupos.
3. **Um único "voltar":** dentro do shell, nenhuma página de primeiro nível tem "← Voltar". Subpáginas usam `Breadcrumb` (ex.: Configurações da turma › Histórico). Fora do shell, só o layout tem o "voltar".
4. **Um layout simples compartilhado** para `(onboarding)` e `(conta)` sem turma: hoje são dois headers quase idênticos (`(onboarding)/layout.tsx:24-37` e `(conta)/layout.tsx:16-26`). Esse layout inclui o tema (hoje ausente nos dois).
5. **Formulários:** `Field` (label, descrição, erro) no lugar de `div flex-col gap-1.5` + `<p className="text-xs">`. Erros com `Alert`. Sucesso rotineiro com `Sonner` (não está instalado; adicionar).
6. **Destrutivo sempre em `AlertDialog`**, mantendo as confirmações exigidas pela regra (digitar o email).
7. **Estados de resultado** (link enviado, senha salva, link inválido) num só padrão `Empty`.
8. **Toque de 44px** nos links-botão soltos (`evento/[token]/page.tsx:86`, links "voltar" com `py-1`) usando o padrão `pointer-coarse:` que já existe.

## Decisões que precisam do dono do produto

1. **Como o admin navega?**
   - (a) Um menu só, com o grupo "Comissão" visível para admin. **Recomendo.**
   - (b) Manter duas áreas, renomeando "Votações" do admin para "Catálogos".
   - (c) Um interruptor "Modo comissão" no topo.
2. **Navegação no celular?**
   - (a) `bottom nav` com Início, Votações, Avisos, Dúvidas e Menu. **Recomendo para participante.**
   - (b) Manter só a gaveta, com header melhorado (nome da turma como seletor).
   - (c) `bottom nav` também para o admin, trocando Dúvidas por Membros.
3. **"Relatório" das votações?**
   - (a) Aba "Resultados" dentro de Votações. **Recomendo.**
   - (b) Manter como item de menu.
   - (c) Absorver no Registro da turma.
4. **Onde fica "Registro da turma"?**
   - (a) No seletor de turma + card no Início. **Recomendo.**
   - (b) Manter no menu principal.
   - (c) Grupo "Arquivo" no fim do menu.
5. **Alternância Entrar/Criar conta no login?**
   - (a) `Tabs` no topo, sem o link de baixo. **Recomendo.**
   - (b) Só o link de baixo (modo Entrar por padrão).
   - (c) Rotas separadas `/entrar` e `/cadastro`.
6. **Onboarding sem código de link?**
   - (a) Código como ação primária e "Criar turma" num `Collapsible`. **Recomendo.**
   - (b) Manter os dois cards iguais.
7. **Tema (claro/escuro)?**
   - (a) No menu do usuário + `/conta`, fora do header. **Recomendo.**
   - (b) Continua no header.
8. **Rótulo "Terceiros"?** PRODUCT.md e a tela de login falam em "fornecedores" (`layout-auth.tsx:10`).
   - (a) Renomear para "Fornecedores".
   - (b) Manter "Terceiros".

   Recomendo (a), se a tela só trata de fornecedores; quem audita `/terceiros` confirma.
9. **Logado que abre `/`?**
   - (a) Redirect direto para `/dashboard`.
   - (b) Manter a vitrine com "Abrir meu painel". **Recomendo (b)** se a vitrine faz parte da avaliação acadêmica.
10. **Página `/conta` dentro do shell quando há turma?**
    - (a) Sim. **Recomendo.**
    - (b) Não, mantém o layout separado.
