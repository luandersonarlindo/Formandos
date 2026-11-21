# ADR-0025: Navegação única por papel

**Status:** Aceito
**Data:** 2026-11-21
**Decisores:** grupo do Formandos (dono do produto)
**Origem:** `docs/ux/plano-simplificacao.md`, decisões D-01, D-02, D-09 e D-10, e a auditoria de UX em `docs/ux/auditoria/A-shell-publico-conta.md`.

## Contexto

- Participante e comissão tinham dois menus em duas "áreas": `(app)` com 9 itens e `(admin)` com outros 4 ou 5. O admin ia e voltava por "Administrar a turma" e "Voltar para a turma", links no rodapé da sidebar.
- "Votações" aparecia nos dois menus com destinos diferentes (votar e editar catálogos).
- Avisos, Dúvidas, Tarefas e Terceiros já eram administrados nas telas do participante. Membros, Presença, Catálogos e Turma ficavam na outra área. O admin precisava saber em qual área estava cada coisa.
- "Minha conta", "Gestão da plataforma" e o tema ficavam espalhados: links soltos que sumiam com a sidebar recolhida e um botão no cabeçalho de todas as telas.

## Decisão

1. **Um menu só por turma** (`src/lib/menu.ts`, `menuDaTurma`), usado pelos layouts `(app)`, `(admin)` e `(conta)` quando há turma:
   - Principal: Início, Votações, Avisos, Dúvidas, Minha situação. Observador não vê Minha situação (ADR-0012).
   - "Mais" (recolhível): Tarefas, Fornecedores, Registro da turma.
   - "Comissão" (só admin): Membros, Evento e presença, Catálogos, Tesouraria (só para quem é da tesouraria, ADR-0005) e Turma.
2. **Rotas e guards não mudam.** `/admin/*` continua exigindo `exigirAdmin`, e a tesouraria continua exigindo `exigirTesouraria`. O menu só mostra o caminho a quem já tem acesso.
3. **Topo da sidebar:** seletor de turma num menu suspenso, sempre visível. No celular, o nome da turma no cabeçalho é o próprio seletor. Não há barra inferior (D-02).
4. **Rodapé da sidebar:** menu da pessoa com Minha conta, Tema, Gestão da plataforma (master) e Sair.
5. **Nomes:** "Dashboard" passa a se chamar "Início"; "Terceiros" passa a se chamar "Fornecedores" (a URL `/terceiros` continua); o item "Votações" da comissão passa a se chamar "Catálogos". O "Relatório" vira a aba "Resultados" de Votações, e a URL `/votacoes/relatorio` continua.
6. **Rotas novas e redirecionadas:** `/admin/evento` (dados e programação do evento, com a aba Presença em `/admin/presenca`). `/admin/turma/registro` redireciona para `/registro`.
7. **Master:** a área `/master` continua com menu próprio (é da plataforma, não da turma), e o menu da pessoa ganha "Voltar para a turma".

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Manter duas áreas e renomear "Votações" do admin | Mantém o vai e volta e o modelo mental de "onde fica cada coisa". |
| Interruptor "Modo comissão" | Esconde ferramentas atrás de um estado que a pessoa precisa lembrar de ligar e desligar. |
| Barra inferior no celular | Recusada pelo dono do produto (D-02). Ela disputa espaço com os botões de envio e com o teclado virtual. |

## Consequências

**Fica melhor**
- O participante vê 5 itens e "Mais", em vez de 9.
- O admin chega a qualquer ferramenta de qualquer tela, sem trocar de área.
- Conta, tema e sair ficam no mesmo lugar e não somem com a sidebar recolhida.

**Fica pior ou mais difícil**
- A sidebar do admin fica mais longa (grupo Comissão). Em telas baixas, ela rola.
- Os testes de fluxo que clicavam em "Sair", "Minhas turmas" e "Administrar a turma" foram reescritos para abrir os menus suspensos.

**Arquivos**
- `src/lib/menu.ts`, `src/components/features/app-shell.tsx`, `seletor-turma.tsx`, `menu-usuario.tsx`, `grupo-mais.tsx`, `sidebar-nav-link.tsx`.
- Layouts `src/app/(app)/layout.tsx`, `(admin)/admin/layout.tsx`, `(conta)/layout.tsx` e `(master)/master/layout.tsx`.
- `src/app/(admin)/admin/evento/page.tsx` e `(admin)/admin/turma/registro/page.tsx`.
