# Plano de simplificação de UX/UI — todas as telas

> **Escopo:** as 38 rotas do app e a navegação global (shell). Nenhuma tela ficou de fora: a tabela de cobertura no fim
> mostra onde cada rota entra no plano.
> **Base:** auditoria de 4 frentes em 21/11/2026, só leitura, com o método das skills `impeccable`
> (`distill`, `clarify`, `critique`, `component-review`) e as regras de UX da `ui-ux-pro-max`, contra `PRODUCT.md`,
> `DESIGN.md` e o catálogo de componentes do shadcn/ui. Os relatórios completos, com `arquivo:linha`, estão em
> [`auditoria/`](auditoria/).
> **Objetivo:** menos interação e menos coisa na tela para o usuário, sem mudar regra de negócio, RBAC, LGPD/auditoria nem
> visibilidade admin-only.

---

## 1. Diagnóstico em uma página

Os mesmos problemas aparecem em quase todas as telas.

1. **Duas áreas para o admin.** O participante tem um menu com 9 itens, e o admin tem outro menu separado. O admin vai e
   volta entre os dois por "Administrar a turma" / "Voltar para a turma". "Votações" aparece nos dois menus com destinos
   diferentes.
2. **Um Card para cada item da lista.** A palavra `<Card` aparece 74 vezes no código. O dashboard tem de 12 a 18 caixas com
   borda. 11 arquivos de lista usam um Card por linha.
3. **Botões com texto em toda linha.** Em Membros há até 4 botões por pessoa, o que dá cerca de 160 numa turma de 40. No
   editor de catálogo há até 9 controles por pergunta, o que passa de 400 paradas de foco no D-pad.
4. **Ferramentas de admin antes do conteúdo.** Em Avisos, Tarefas, Terceiros e Dúvidas, os formulários de criação ficam
   abertos acima da lista. A Tesouraria mostra 4 blocos de configuração antes da lista de membros.
5. **Sucesso invisível.** 52 ações terminam sem retorno visível: `FormDialog` (35 usos) e `ConfirmarExclusao` (17 usos)
   fecham e a mensagem some junto. O app não tem toast.
6. **Informação repetida.** A data do evento aparece duas vezes, o progresso do catálogo aparece no topo e no rodapé, e o
   status da tarefa aparece de três formas. O Relatório repete parte do Registro.
7. **Estética da vitrine dentro do app.** `vitrine-cartao` (11 usos) e `vitrine-fundo-hero` (14 usos) deixam cards que
   sobem no hover e números em gradiente. Isso vai contra o *Flat-By-Default* do DESIGN.md.
8. **Alvos de toque pequenos.** Chips de filtro, opções de voto e checkbox/radio nativos ficam com 28 a 36px, abaixo do
   mínimo de 44px.
9. **O diferencial do produto está escondido.** Depois de fixar uma decisão, a página da pergunta não diz qual opção
   ganhou, e o catálogo não mostra quais perguntas já foram decididas. Isso contraria o princípio 3 do PRODUCT.md.

---

## 2. Decisões

### 2.1 Decididas pelo dono do produto (21/11/2026)

| # | Tema | Decisão |
|---|---|---|
| D-01 | Navegação do admin | **Menu único.** O admin vê um grupo extra "Comissão" (Membros, Evento e presença, Catálogos, Tesouraria, Turma). Rotas e guards não mudam. |
| D-02 | Celular | **Só a gaveta, melhorada**, sem barra inferior. O header ganha o nome da turma como seletor. |
| D-03 | Dashboard do formando | **"Para você fazer" primeiro**, logo abaixo de uma linha com nome, data e local. |
| D-04 | Forms longos | **Dialog sempre**, com uma coluna no celular e opcionais recolhidos em "Mais detalhes". Sem Drawer. |
| D-05 | Ações por linha | **Uma ação visível + menu "⋯"** (`DropdownMenu`). |
| D-06 | Feedback | **Toast (Sonner) em todo sucesso.** O erro continua inline. |
| D-07 | Ciclo da pergunta (admin) | **Página "Resultado e decisão"**: regra, avisar, mandar para o grupo e fixar ficam na página da pergunta. O catálogo fica só com a estrutura. |
| D-08 | Gestão do evento | **`/admin/evento`** com abas Dados · Programação · Presença. O dashboard mostra só um resumo com o link "Editar". |
| D-09 | Menu do participante | **6 itens + "Mais"**: Início, Votações (com a aba Resultados), Avisos, Dúvidas, Minha situação, Mais (Tarefas, Fornecedores, Registro). |
| D-10 | "Terceiros" | **Renomear só o rótulo** para "Fornecedores". A URL `/terceiros` continua. |
| D-11 | Votos do catálogo | **Manter "Salvar tudo"** e avisar ao sair da página com votos não salvos. |
| D-12 | Tesouraria | **Abas que são rotas**: Membros \| Plano e regras \| Saídas. "Planilhas ▾" agrupa downloads e importação. |

### 2.2 Adotadas por padrão (recomendação da auditoria; o dono pode mudar)

| # | Tema | Padrão adotado |
|---|---|---|
| P-01 | Relatório das votações | Vira a aba "Resultados" dentro de Votações. A URL `/votacoes/relatorio` continua. |
| P-02 | Registro da turma | Fica dentro de "Mais" e também como card no Início. `/admin/turma/registro` redireciona para `/registro`. |
| P-03 | Troca de turma | Menu suspenso no topo da sidebar, sempre visível. Substitui o bloco que abre expandido. |
| P-04 | Menu do usuário | O avatar no rodapé abre um menu com Minha conta, Tema, Gestão da plataforma e Sair. O tema sai do header. |
| P-05 | `/conta` | Passa a usar o shell quando a pessoa tem turma. "Sair da turma" sai do dashboard e vai para `/conta`. |
| P-06 | Dashboard do admin | Igual ao do participante, mais até 3 indicadores clicáveis e o resumo do evento. |
| P-07 | Próxima parcela | Entra em "Para você fazer" com data e valor. O valor só é visto pela própria pessoa. |
| P-08 | Transparência em Minha situação | Bloco recolhível "Dinheiro da turma", fechado por padrão. |
| P-09 | Orçamento e cadastro de fornecedores | Continuam em `/terceiros`, atrás do botão "Novo…" e de uma linha compacta. |
| P-10 | "Destacar" e "Respondida" em Dúvidas | Ação direta + toast com "Desfazer", sem Dialog. |
| P-11 | `/admin` | Mantém o redirect atual. |
| P-12 | Histórico | Vira a aba de Turma: Registro · Histórico · Encerrar. |
| P-13 | Estado da decisão nas listas | Badge com a opção decidida ("Decidida: Buffet A") e "3 de 12 decididas" no catálogo. Muda só a leitura das queries. |
| P-14 | Fixar decisão | Continua em Dialog, porque é um ato explícito e atribuído. |
| P-15 | Regras da presença | Dialog com duas seções e dois botões de salvar. As actions não mudam. |
| P-16 | Trocar papel (master e membros) | `AlertDialog` de confirmação, porque a action não tem "desfazer". |
| P-17 | `/master` | A página continua, mas os links que não filtram nada saem. |
| P-18 | Cor de atraso ou aviso | Novo token `--warning` + `Badge` warning, validado em contraste nos dois temas. Substitui 12 usos de `amber-*`. |
| P-19 | Cards | Card só para agrupar uma seção, no máximo 3 por tela. Listas usam `Item`. `vitrine-*` só na vitrine e nas telas de auth. |
| P-20 | Login | `Tabs` Entrar/Criar conta no topo, sem a troca duplicada embaixo. Termos e Privacidade abrem em nova aba. |
| P-21 | Onboarding | O código é a ação primária. "Criar turma" fica em `Collapsible`. Com código vindo do link, só "Entrar na turma" aparece. |
| P-22 | Logado que abre `/` | Mantém a vitrine com "Abrir meu painel", porque ela faz parte da avaliação acadêmica. |
| P-23 | Selects | `NativeSelect` continua sendo o padrão (funciona sem JS, abre o seletor nativo no celular e é previsível no D-pad). Para 2–4 opções, `ToggleGroup`/`RadioGroup`. Não adotar o `Select` do Radix. |
| P-24 | Disclosure | `PainelRecolhivel` (`<details>`) é o padrão único. Os `<details>` crus passam a usá-lo. `Accordion` só quando o estado precisa ser controlado de fora. |

---

## 3. Kit de padrões (vale para todas as telas)

Instalar uma vez, na Fase 0:

```bash
npx shadcn@latest add sonner alert-dialog item empty field input-group table checkbox toggle-group switch spinner
```

| Situação | Componente | Regra |
|---|---|---|
| Lista de registros | `Item`/`ItemGroup` com `divide-y` | Uma linha por registro, sem Card por linha. No máximo uma ação visível. |
| Ações secundárias da linha | `DropdownMenu` "⋯" (`aria-label="Ações de {nome}"`) | O destrutivo fica por último, depois de um separador, com `variant="destructive"`. |
| Números comparáveis | `Table` | Só com 3 ou mais colunas numéricas, dentro de `overflow-x-auto`. |
| Criar ou editar | `FormDialog` + `Field` + botão "Cancelar" | O gatilho é um botão "Novo…" no cabeçalho da página. Uma coluna no celular. |
| Campo | `Field` (`FieldLabel`, `FieldDescription`, `FieldError`) | Substitui as 73 ocorrências de `div > Label + Input`. |
| 2–4 opções | `ToggleGroup` / `RadioGroup` | Com 5 ou mais opções, `NativeSelect`. |
| Sim/não | `Checkbox` + `Field`, ou `Switch` quando aplica na hora | Sem `input type=checkbox` cru. |
| Excluir | `ConfirmarExclusao` com miolo `AlertDialog` | Sempre mostra o nome do item. Digitação só em exclusão em cascata. Foco inicial em "Cancelar". |
| Sucesso | `toast.success` (Sonner) | O texto vem de `estado.ok`. Não pode roubar o foco. |
| Erro | `FieldError` ou `role="alert"` junto do botão | Nunca em toast. |
| Aviso de contexto | `Alert` | Por exemplo: "3 pagamentos aguardando", turma arquivada, único admin. |
| Vazio | `EstadoVazio`, reescrito sobre `Empty` | Título + 1 frase + no máximo 1 ação (o próximo passo). |
| Carregando a página | `Skeleton` no formato da tela | Mesma largura máxima da página. |
| Carregando o botão | `Spinner` + rótulo no gerúndio + `disabled` | Substitui os 28 `LoaderCircle` feitos à mão. |
| Busca | `CampoBusca` (novo, sobre `InputGroup`) | Envia no Enter, tem botão de limpar e "N encontrados" com `role="status"`. |
| Filtro | `FiltrosPilula` (novo) | Links com `aria-current`, estado na URL, 44px no toque. |
| Voltar | `LinkVoltar` (novo) | Um padrão só, no lugar dos 17 `ArrowLeft` soltos. |
| Downloads e ações raras | `DropdownMenu` "Planilhas ▾" / "Mais ▾" | Fora do fluxo principal. |
| Toque | Utilitário `pointer-coarse:min-h-11` | Em todo chip, opção e controle pequeno. |

**Regras de ouro em cada tela:** um título, no máximo uma frase de apoio e **uma** ação primária. O conteúdo vem antes
da gestão. Nada se repete se já está dito em outro lugar. O admin vê a mesma tela que o participante, mais o botão
"Novo…" e o menu "⋯".

---

## 4. Fases

Cada fase termina com `npm run build`, `npm test` e `scripts/teste/fluxos.mjs` passando (atualizar os seletores que a
fase mudar). Também é preciso verificar a fase com teclado, com toque a 375px e na largura de TV.
**Antes de escrever código:** ler o guia relevante em `node_modules/next/dist/docs/` (regra do AGENTS.md).
**Sugestão:** trabalhar numa branch própria (por exemplo `ux-simplificacao`), com um commit por item.

### Fase 0 — Fundação e correções rápidas (P · desbloqueia todo o resto)

**Kit**
- [ ] Instalar os componentes da seção 3. Pôr o `<Toaster />` no `src/app/layout.tsx`.
- [ ] `FormDialog`: botão "Cancelar" (`DialogClose`), toast no sucesso e variante do gatilho configurável.
- [ ] `ConfirmarExclusao`: miolo `AlertDialog`, toast no sucesso. A API continua igual.
- [ ] `FormAcao`: sucesso por toast, `Spinner` no lugar de `LoaderCircle`. O erro continua inline.
- [ ] `EstadoVazio` reescrito sobre `Empty`, com espaço para uma ação. Apagar `pagina-vazia.tsx` (0 usos).
- [ ] Criar `CampoBusca`, `FiltrosPilula` e `LinkVoltar`.
- [ ] Token `--warning` + `Badge` warning, com contraste validado nos dois temas.
- [ ] Utilitário de toque de 44px para chips e opções.

**Bugs e textos errados encontrados na auditoria**
- [ ] `evento-admin.tsx:267,278` × `:323,327`: ids `horario`/`titulo` duplicados, e o label do Dialog aponta para o campo errado.
- [ ] `admin/votacoes/[catalogoId]/page.tsx:200`: o texto diz "formulário abaixo", mas o formulário fica acima.
- [ ] `votacoes/votos/[enqueteId]`: mostrar qual opção foi fixada (hoje só aparece "Mais votada").
- [ ] `admin/votacoes/[catalogoId]/page.tsx:325`: "Ver quem votou" leva, na verdade, ao resultado e à decisão. Renomear.
- [ ] `privacidade/page.tsx:127`: o texto público cita o caminho interno `docs/auditoria-direitos/PSI.md`. **O texto legal precisa do OK do dono.**
- [ ] `evento/[token]/page.tsx:86`: "Como chegar" está abaixo de 44px.
- [ ] `master/page.tsx:41-44`: os cartões levam para links que não filtram. Tirar os links.
- [ ] `master/loading.tsx:8`: o skeleton usa `max-w-3xl` e a página usa `4xl`, então o conteúdo pula. `master/error.tsx` volta para `/dashboard` com um texto de comissão.
- [ ] `esqueci-senha`: o link diz "Esqueci a senha", mas a página se chama "Definir senha". Alinhar o título.

### Fase 1 — Navegação global (G · maior impacto) — D-01, D-02, D-09, D-10, P-01–P-05

- [ ] Um `AppShell` só para os grupos `(app)`, `(admin)` e `(conta)` com turma. Os itens seguem a D-09, e o grupo "Comissão" aparece só para admin. Os guards de cada layout continuam.
- [ ] "Mais" como `Collapsible` na sidebar (Tarefas, Fornecedores, Registro da turma).
- [ ] Seletor de turma num `DropdownMenu` no topo da sidebar e também no header do celular.
- [ ] Menu do avatar: Minha conta, Tema, Gestão da plataforma (master) e Sair. Nada pode sumir na sidebar recolhida (`app-shell.tsx:175,196`).
- [ ] Rótulo "Fornecedores" no menu, nos títulos e nos textos. A URL continua `/terceiros`.
- [ ] `/admin/turma/registro` passa a redirecionar para `/registro`. `/registro` continua, porque os emails apontam para ela (`lib/email.ts:656,682`).
- [ ] Os cards do dashboard que levam à área admin deixam de mudar de "área": agora é tudo um menu só.
- [ ] Registrar a mudança como **ADR-0025 (navegação única por papel)**.
- Risco: foco e retorno de foco no D-pad dentro dos menus suspensos. `CAMINHOS_LIVRES` (`conteudo-turma.tsx:10`).

### Fase 2 — Telas do participante (G) — D-03, D-06, D-11, P-06–P-10

| Tela | O que muda | Componentes | Esforço |
|---|---|---|---|
| `/dashboard` | Ordem: alerta de mudança → linha com turma, data e local → **"Para você fazer"** (presença, acompanhantes, votos pendentes, próxima parcela) → decisões em lista plana → avisos resumidos em 2 linhas → "Sobre o evento" recolhido. Os indicadores sem ação saem. "Sair da turma" vai para `/conta`. O admin vê o mesmo, mais 3 indicadores e o resumo do evento (o `EventoAdmin` sai, ver Fase 3). | `Item`, `Badge`, `PainelRecolhivel` | G |
| `/avisos` | Lista primeiro. "Novo aviso" vira um botão no cabeçalho que abre `FormDialog`. Editar e excluir ficam no "⋯". | `Item`, `DropdownMenu` | P |
| `/minha-situacao` | Um bloco principal (situação + "Já paguei" dentro dele) → abas Parcelas/Lançamentos → "Dinheiro da turma" recolhido. Um tipo só de recolhível. | `Tabs`, `Table`, `PainelRecolhivel` | M |
| `/tarefas` | Lista de `Item` sem a faixa colorida, o ícone e o badge repetidos (fica só o badge). "Nova tarefa" vai para o cabeçalho. Filtro "Minhas" na URL. | `Item`, `FiltrosPilula`, `FormDialog` | M |
| `/votacoes` | Lista de catálogos sem hover nem gradiente, com o progresso de cada um. Abas Votar · Resultados. | `Tabs`(links), `Item`, `Progress` | P |
| `/votacoes/[catalogoId]` | O progresso aparece só no rodapé fixo. As opções de voto ficam com 44px. Aviso ao sair com votos não salvos (`beforeunload` + interceptar links internos). | `RadioGroup`/`Checkbox`, `Alert` | M |
| `/votacoes/relatorio` | Vira a aba "Resultados". Sem o conteúdo repetido do Registro. | `Tabs`, `Table` | P/M |
| `/duvidas` | Uma caixa "Pergunte à comissão" no topo e a lista em seguida. A nota de admin sai. As ações de admin vão para o "⋯". Destacar e Respondida passam a ser diretas + toast com "Desfazer". | `Item`, `DropdownMenu`, Sonner | M |
| `/terceiros` (Fornecedores) | Some o chip de categoria vazia. O cadastro e o orçamento ficam atrás de "Novo…". Cards sem hover. | `FiltrosPilula`, `Item`, `FormDialog` | M |
| `/registro` | Sem mudança de estrutura. Só o acesso pelo "Mais" e o card no Início. | — | P |

Risco: `rolar-para-pergunta-criada` e `data-duvida` dependem do envio pela página. O `role="status"` do rodapé de votação precisa continuar (ADR-0015). Os textos de voto secreto e de regra continuam visíveis (ADR-0001/0003/0010).

### Fase 3 — Telas da comissão (G) — D-05, D-07, D-08, P-11–P-16

| Tela | O que muda | Componentes | Esforço |
|---|---|---|---|
| **`/admin/evento` (nova)** | Abas Dados · Programação · Presença. Leva o `EventoAdmin` do dashboard para cá. O Dialog "Dados do evento" (cerca de 15 campos) fica dividido em Quando / Onde / Acessibilidade / Traje. "Gerar outro link" e "Desligar" vão para o "⋯". | `Tabs`(links), `Field`, `DropdownMenu` | G |
| `/admin/presenca` | Uma linha-resumo + o botão "Regras da presença" (um Dialog com 2 seções). A lista vem logo em seguida. Usa `FiltrosPilula`. Passa a ser a aba Presença de Evento. | `Dialog`, `Item`, `FiltrosPilula` | M |
| `/admin/presenca/lista` | Mantém a impressão. Só padronizar o cabeçalho e o `LinkVoltar`. | — | P |
| `/admin/membros` | `Item` por pessoa + "⋯" (Promover, Observador, Tesouraria, Remover). Tesouraria passa a pedir confirmação. O aviso fixo de remoção sai. | `Item`, `DropdownMenu`, `AlertDialog` | M |
| `/admin/votacoes` | O catálogo padrão vira um `Switch` (hoje são 3 passos). Badge "3 de 12 decididas" em cada catálogo. | `Switch`, `Item`, `Badge` | P |
| `/admin/votacoes/nova` | Form num `Field` só. Sem mudança de fluxo. | `Field` | P |
| `/admin/votacoes/[catalogoId]` | Uma linha `Item` por pergunta, com badge de estado ("Decidida: X"), a ação primária "Resultado e decisão" e o "⋯" (Editar, Mover, Excluir). Regra, Avisar e Grupo saem daqui. `editor-opcoes`: igual entre criar e editar, "Exclusiva" sempre como checkbox, permite adicionar várias opções. | `Item`, `DropdownMenu`, `Checkbox` | G |
| `/admin/votacoes/votos/[enqueteId]` → "Resultado e decisão" | Mostra no topo a decisão fixada e qual opção foi escolhida. Regra da votação, Avisar por email e Mandar para o grupo ficam aqui. Fixar continua em Dialog. | `Alert`, `Badge`, `Dialog` | M |
| `/admin/turma` | Abas Registro · Histórico · Encerrar. As 9 planilhas vão para um "Baixar planilha ▾". "Excluir turma" passa a usar `ConfirmarExclusao` com `confirmacao`, sem o campo sempre visível. | `Tabs`(links), `DropdownMenu` | P/M |
| `/admin/turma/historico` | Vira a aba Histórico. Usa `FiltrosPilula`. | `FiltrosPilula` | P |
| `/admin/turma/registro` | Redirect (Fase 1). | — | P |
| `/admin` | Mantém o redirect. | — | — |

Risco: `scripts/teste/fluxos.mjs` clica por rótulo dentro de `#enq-${id}` ("Regra da votação", "Editar pergunta", "Mandar para o grupo", "Avisar a turma por email", "Ver quem votou", "Promover", "Tornar observador") e lê nomes do DOM (`:1912-1917,2645`). Os passos precisam ser reescritos para abrir o "⋯" primeiro e usar `forceMount` onde o teste lê os nomes. O `BotaoMover` precisa devolver o foco ao "⋯" e manter o anúncio para leitor de tela. Os links de download continuam como `<a>`, para a auditoria funcionar.

### Fase 4 — Tesouraria (G) — D-12

| Tela | O que muda | Esforço |
|---|---|---|
| `/admin/tesouraria` | Abas-rota Membros \| Plano e regras \| Saídas. Membros fica no topo, com a faixa de 3 números do caixa e um `Alert` "N informes aguardando". "Planilhas ▾" agrupa as 2 exportações e a importação. `CampoBusca` + `FiltrosPilula`. "Confirmar" do informe com `Spinner` e toast. | G |
| `/admin/tesouraria/plano` (nova aba) | Plano, regras do dinheiro e importação. A importação exige ver a prévia antes de "Importar". | M |
| `/admin/tesouraria/saidas` | `Table` para "Por fornecedor", `Item` + "⋯" (Editar/Excluir) nas saídas, `Empty` no vazio, sem gradiente. | M |
| `/admin/tesouraria/[usuarioId]` | Num lançamento "informado", ficam visíveis só Confirmar e Recusar; o resto vai para o "⋯". As parcelas usam `Table`. | M |
| `CamposLancamento` / `CamposSaida` | Uma coluna no celular. "Tipo" vira `ToggleGroup`. Os opcionais vão para "Mais detalhes". `Checkbox` + `Field`. **Também muda o form da `/minha-situacao`.** | M |

Risco: `fluxos.mjs` usa `li[data-membro]`, `li[data-informe]` e `li[data-saida]` e os textos "Lançar", "Confirmar", "Recusar", "Editar" e "Excluir". É preciso manter os `data-*` e atualizar os passos que passarem para o "⋯".

### Fase 5 — Master (M) — P-16, P-17

| Tela | O que muda | Esforço |
|---|---|---|
| `/master` | Faixa de números sem os links enganosos e sem o badge "Master". | P |
| `/master/turmas` | Lista `Item` em uma coluna (a grade de 2 colunas atrapalha o D-pad). Sem o ícone decorativo. | P |
| `/master/turmas/[turmaId]` | `Item` + "⋯" por membro. Promover passa a usar `AlertDialog` (hoje é um `FormDialog` sem campos). Paginação. O aviso de "único admin" vira um `Alert` junto da linha. A zona de perigo sem o texto repetido. | M |
| `/master/usuarios` | "Excluir usuário" vai para o "⋯". A digitação do email continua obrigatória. | P/M |
| `master/loading` e `master/error` | Corrigidos na Fase 0. | — |

### Fase 6 — Público, onboarding e conta (M) — P-05, P-20–P-22

| Tela | O que muda | Esforço |
|---|---|---|
| `/` (vitrine) | Mantém. Revisar seções redundantes (opcional). Logado vê "Abrir meu painel". | P |
| `/entrar` | `Tabs` Entrar/Criar conta. Um aviso legal só. Quem chega por convite vê "Entre para participar da turma", e não "Bem-vindo de volta". Termos e Privacidade abrem em nova aba. | P |
| `/esqueci-senha` | Título alinhado e descrição de 1 frase. | P |
| `/redefinir-senha` | Padronizar com `Field` e `CampoSenha`. | P |
| `/termos`, `/privacidade` | Sumário com âncoras e leitura mais fácil. **Mudar a redação exige o OK do dono e talvez uma nova versão.** | P |
| `/evento/[token]` | Alvo de toque (Fase 0). Ordem: quando → onde → como chegar. | P |
| `/convite` | O código é o primário. "Criar turma" fica em `Collapsible`. Com código no link, só "Entrar na turma". | M |
| `/conta` | Dentro do shell. Seções Perfil · Notificações (`Switch` para os emails da turma) · Turma ("Sair da turma") · Zona de perigo (exclusão em `AlertDialog`, mantendo a digitação do email). | M |
| `/conta/meus-dados` | Um "voltar" só. Rótulos legíveis no lugar dos nomes de coluna, sem JSON cru. Seções recolhíveis **abertas na impressão** (o PDF é o objetivo, ADR-0007). | M |

### Fase 7 — Limpeza visual e documentação (M)

- [ ] Tirar `vitrine-cartao`, `vitrine-fundo-hero` e `vitrine-texto-gradiente` de todas as telas internas.
- [ ] Trocar os Cards de lista que sobraram por `Item` (7 arquivos fora das fases acima, listados em `auditoria/D-…md`).
- [ ] Tirar o indigo dos ícones decorativos (regra *One Voice* do DESIGN.md).
- [ ] Atualizar `DESIGN.md`, `docs/design-system/formandos/MASTER.md` e `.impeccable/design.json` com o kit da seção 3 e o token `--warning`.
- [ ] Atualizar `docs/Organograma da Aplicação.md` com a navegação nova.

---

## 5. Como validar

- **Contagem antes e depois** em cada tela: número de botões visíveis, paradas de Tab e caixas com borda. Meta: cair pela metade nas telas G (dashboard, catálogo admin, membros, tesouraria).
- **Roteiro `fluxos.mjs`** verde no fim de cada fase.
- **Acessibilidade:** foco visível, retorno de foco ao fechar menu ou dialog, toast anunciado sem roubar o foco, nenhum id duplicado, alvos de 44px.
- **Três larguras:** 375px (celular), 1024px (tablet) e 1920px (TV), com navegação só por setas e Enter.
- **Gente de verdade:** depois das Fases 1–3, repetir a rodada de simulação (`simular-usuarios`) e, principalmente, testar com 3–5 pessoas reais da turma (participante e comissão). A simulação é especulação, não validação.

## 6. Ordem e tamanho

| Fase | Esforço | Depende de |
|---|---|---|
| 0 Fundação + correções rápidas | P–M | — |
| 1 Navegação global | G | 0 |
| 2 Participante | G | 0, 1 |
| 3 Comissão | G | 0, 1 |
| 4 Tesouraria | G | 0, 1 |
| 5 Master | M | 0 |
| 6 Público, onboarding e conta | M | 0 (a parte de `/conta` também depende de 1) |
| 7 Limpeza e documentação | M | todas |

As fases 2, 3, 4 e 5 podem andar em paralelo entre as 4 pessoas do grupo depois que a 0 e a 1 estiverem prontas.

---

## 7. Cobertura — todas as 38 rotas

| Rota | Fase |
|---|---|
| shell / layouts (`app-shell.tsx`, 6 `layout.tsx`) | 1 |
| `/` | 6 |
| `/entrar` | 6 |
| `/esqueci-senha` | 0, 6 |
| `/redefinir-senha` | 6 |
| `/termos` | 6 |
| `/privacidade` | 0, 6 |
| `/evento/[token]` | 0, 6 |
| `/convite` | 6 |
| `/conta` | 1, 6 |
| `/conta/meus-dados` | 6 |
| `/dashboard` | 2 |
| `/avisos` | 2 |
| `/minha-situacao` | 2, 4 |
| `/tarefas` | 2 |
| `/votacoes` | 2 |
| `/votacoes/[catalogoId]` | 2 |
| `/votacoes/relatorio` | 2 |
| `/duvidas` | 2 |
| `/terceiros` | 1, 2 |
| `/registro` | 1, 2 |
| `/admin` | 3 |
| `/admin/membros` | 3 |
| `/admin/presenca` | 3 |
| `/admin/presenca/lista` | 3 |
| `/admin/turma` | 3 |
| `/admin/turma/historico` | 3 |
| `/admin/turma/registro` | 1 |
| `/admin/votacoes` | 3 |
| `/admin/votacoes/nova` | 3 |
| `/admin/votacoes/[catalogoId]` | 0, 3 |
| `/admin/votacoes/votos/[enqueteId]` | 0, 3 |
| `/admin/tesouraria` | 4 |
| `/admin/tesouraria/saidas` | 4 |
| `/admin/tesouraria/[usuarioId]` | 4 |
| `/master` | 0, 5 |
| `/master/turmas` | 5 |
| `/master/turmas/[turmaId]` | 5 |
| `/master/usuarios` | 5 |
| **nova** `/admin/evento` | 3 |
| **nova** `/admin/tesouraria/plano` | 4 |

---

## 8. Situação da implementação (21/11/2026, branch `ux-simplificacao`)

Todas as fases (0 a 7) foram implementadas. O dono aprovou a remoção do caminho interno do PSI no texto de `/privacidade` e a reescrita dos passos de teste afetados pelo menu "⋯".

| Fase | Situação | Observações |
|---|---|---|
| 0 Fundação | Feita | Kit em `src/components/features/` (`menu-acoes`, `cabecalho-pagina`, `abas-rota`, `campo-busca`, `filtros-pilula`, `link-voltar`) + componentes shadcn novos, toast (Sonner), token `--warning`, 9 correções. |
| 1 Navegação | Feita | ADR-0025. `src/lib/menu.ts`, seletor de turma, menu da pessoa, "Mais", grupo "Comissão", `/admin/evento`. |
| 2 Participante | Feita | Ficou de fora: filtro "Minhas" em Tarefas (pede parâmetro novo em `listarTarefas`) e "Desfazer" no toast de Destacar/Respondida (o "⋯" desfaz em um clique). |
| 3 Comissão | Feita | Ficou de fora: acrescentar várias opções de uma vez ao editar pergunta (`atualizarEnquete` aceita uma `novaOpcao` por envio). `campos-fixar-decisao` mantém os controles nativos (os testes usam `input[name=opcaoId]`). |
| 4 Tesouraria | Feita | Nova aba-rota `/admin/tesouraria/plano`. "Importar" só libera depois de uma prévia sem problema. |
| 5 Master | Feita | Troca de papel com AlertDialog; paginação na página (a query não mudou). |
| 6 Público, convite e conta | Feita | Na aba "Criar conta", o Google fica desabilitado até a pessoa marcar o aceite dos termos, para a mesma caixa cobrir os dois caminhos de cadastro. Novo `?criar=1` em `/convite`. |
| 7 Limpeza e documentação | Feita | Sem `vitrine-*` nas telas internas. `DESIGN.md`, `MASTER.md`, `design.json`, Organograma e `docs/IA.md` atualizados. |

**Bugs encontrados e corrigidos durante os testes**
- O Switch do catálogo padrão enviava a action duas vezes por clique (o checkbox oculto do Radix dentro do `<form>`).
- Na gaveta do celular, o primeiro Esc fechava a dica (tooltip) em vez da gaveta.

**Pendente:** validação com pessoas reais (seção 5).
