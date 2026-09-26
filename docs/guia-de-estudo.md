# Guia de Estudo e Roteiro — App Formandos

Guia para quem está criando o primeiro projeto com Next.js e React. Cobre os assuntos que o projeto exige, na ordem em que aparecem, com o que estudar em cada etapa e onde ler.

Fontes analisadas: `README.md`, `docs/catalogo-enquetes.md` e a documentação embarcada do Next.js instalado (`node_modules/next/dist/docs/`).

> **Regra do projeto (`AGENTS.md`):** este é o Next.js **16.3.6** com React **19.2.8**. Ele tem mudanças que quebram o que se aprende em tutoriais antigos. Na dúvida, leia a doc local em `node_modules/next/dist/docs/01-app/` antes de copiar código da internet.

---

## 1. Estado atual do projeto

| Item | Situação |
|---|---|
| Next.js 16.3.6 + React 19.2.8 + TypeScript + Tailwind v4 | Instalado (create-next-app) |
| React Compiler | Ativo em `next.config.ts` (`reactCompiler: true`) |
| `src/app` | Só o template padrão (`layout.tsx`, `page.tsx`, `globals.css`) |
| Alias `@/*` → `./src/*` | Configurado em `tsconfig.json` |
| Banco, autenticação, shadcn/ui, Recharts | **Não instalados** |
| `db/schema.sql` e seed (citados no README) | **Não existem ainda** |
| `.env*` | Já ignorado pelo `.gitignore` |

---

## 2. Decisões do grupo

Respostas às dúvidas levantadas na primeira versão deste guia.

| # | Tema | Decisão |
|---|---|---|
| 1 | Biblioteca de autenticação | **Better Auth** (estável), no lugar do Auth.js/NextAuth, que segue em beta na v5. |
| 2 | Login | Somente "Entrar com Google" (OAuth). Sem e-mail e sem senha. **É gratuito** (ver abaixo). |
| 3 | Nomes das categorias | Seguem `docs/catalogo-enquetes.md`. README já ajustado. |
| 4 | Pergunta neutra/negativa | É uma opção normal com marca `exclusiva`. Em pergunta múltipla, marcá-la desmarca as outras. |
| 5 | Pergunta 5.2 | Passa a ser **Seleção Múltipla**. |
| 6 | Typo em 8.2 | Corrigir para "Nenhum ritual protocolar". |
| 7 | Votos | **Identificados**: o ADM vê quem votou. O formando **pode mudar** o voto. |
| 8 | Turmas por aluno | Uma por vez. Ver recomendação abaixo. |
| 9 | Rotas | Reorganizadas: ver "Mapa de rotas" ao fim desta seção. |
| 10 | Catálogos | Existe o catálogo **padrão** (8 categorias) e o ADM pode criar catálogos **personalizados**. |

### Autenticação: Better Auth + Google (decisões 1 e 2)

**Custo do Google.** O login com Google é **gratuito**. Criar o projeto e o ID do cliente OAuth no Google Cloud Console não tem tarifa de uso. Limites que existem:

- **Modo "Testing"** (padrão de um projeto novo): máximo de **100 usuários de teste** cadastrados à mão, e a autorização expira em 7 dias.
- **Modo "In production"**: ao publicar o app na tela de consentimento, qualquer conta Google entra. Se o app pedir **só** os escopos básicos (`openid`, `email`, `profile`), a doc do Google diz que **não há verificação, não há limite de usuários, não aparece aviso** e a autorização não expira em 7 dias.

Portanto: durante o desenvolvimento, use o modo Testing e cadastre os 4 membros como usuários de teste. Antes do uso real, clique em "Publicar app". Não peça nenhum escopo além dos três básicos. Não vejo motivo para voltar a e-mail e senha.

Fontes: [Manage App Audience (Google)](https://support.google.com/cloud/answer/15549945?hl=en) e [Google OAuth 100 User Limit (Unipile)](https://www.unipile.com/google-oauth-100-user-limit/). Ponto não verificado: se o Google Cloud pede cartão de crédito ao criar a conta ou o projeto. Para OAuth básico não deveria, mas confirmem na hora de criar.

**Se um dia precisarem de e-mail e senha:** o Better Auth também suporta, de graça, com `emailAndPassword: { enabled: true }`. Dá para adicionar depois sem trocar de biblioteca.

**Better Auth na prática** (conferido na doc oficial em 2026-09-25):

- Variáveis: `BETTER_AUTH_SECRET` (mínimo 32 caracteres) e `BETTER_AUTH_URL`, mais `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`.
- Banco: recebe um `Pool` do pacote `pg` (`betterAuth({ database: new Pool(...) })`). Então o projeto usa `pg` como driver.
- Tabelas: o próprio Better Auth cria as suas (`user`, `session`, `account`, `verification`) com `npx auth@latest migrate`. **A tabela `usuarios` do rascunho de modelo passa a ser a tabela `user` dele.** As tabelas do domínio (`membros`, `votos`…) apontam para `user.id`.
- Rota: `src/app/api/auth/[...all]/route.ts` usando `toNextJsHandler(auth)`.
- Next 16: o Better Auth funciona com `proxy.ts`. O `getSessionCookie()` só checa se o cookie existe. A doc dele mesmo avisa que **isso não é seguro** e manda validar em cada página e ação com `auth.api.getSession({ headers: await headers() })`. É o que o guia já recomendava.
- Server Actions: instalar o plugin `nextCookies()`, como **último** plugin da lista.

### Recomendação para a decisão 8 (uma turma por aluno)

Recomendo **manter a tabela `membros`** (usuário, turma, papel) e impor a regra "uma turma" com `UNIQUE (usuario_id)`.

- **Por quê:** guardar `turma_id` direto em `usuarios` parece mais simples, mas mistura conta com turma e complica o papel (o papel vale por turma). Com `membros`, permitir várias turmas no futuro é só remover a restrição `UNIQUE`.
- **Efeito nas rotas:** como o aluno só tem uma turma, a URL **não precisa** de `[turmaId]`. O servidor descobre a turma pelo usuário logado. Isso simplifica bastante todas as telas.
- **Fluxo:** login → sem turma? vai para `/convite` (digitar código ou criar turma) → com turma? vai para `/dashboard`.
- **Ponto aberto:** o aluno pode **sair** da turma para entrar em outra? Sugiro que sim (ação "Sair da turma"), e que o ADM possa remover membros. E se o único ADM sair? Bloquear até promover outro.

### Interpretação da decisão 10 (catálogos)

Entendi assim; confirme:

- **Catálogo padrão:** global, igual para todas as turmas, somente leitura. Contém as 8 categorias e 16 perguntas de `catalogo-enquetes.md`. Vem do *seed* do banco. Toda turma nova já o enxerga.
- **Catálogo personalizado:** pertence a **uma turma**. Só o ADM cria e edita. Tem nome, categorias próprias e perguntas próprias (única ou múltipla).
- **Votos** ficam sempre ligados à turma, pois o catálogo padrão é compartilhado e cada turma tem votos e relatório próprios.

Pergunta em aberto: o ADM pode **ocultar** perguntas do catálogo padrão para a sua turma? Se sim, precisamos de uma tabela de itens ocultos. Sugiro deixar para depois do MVP.

### Mapa de rotas (decisão 9)

Mudanças em relação ao README: sem `[turmaId]` na URL (uma turma por aluno), telas de entrada separadas, votações divididas por catálogo, e o painel `/admin` dividido em subrotas. Um *endpoint* de API de verdade existe **só um** (o do login). Todas as mutações (votar, upvote, responder…) são **Server Actions**, que não têm URL própria.

```
src/
├─ proxy.ts                          Redireciona quem não está logado (checagem rápida, não é a segurança final)
└─ app/
   ├─ layout.tsx                     Layout raiz (fonte, html, body)
   ├─ (publico)/
   │  ├─ page.tsx                    /                Apresentação + botão "Entrar com Google"
   │  └─ entrar/page.tsx             /entrar          Tela de login
   ├─ (onboarding)/                  Logado, mas sem turma
   │  └─ convite/page.tsx            /convite         Digitar código de convite OU criar turma
   ├─ (app)/                         Logado e com turma. layout.tsx = menu/barra lateral
   │  ├─ dashboard/page.tsx          /dashboard       Contagem regressiva, data/local, programação
   │  ├─ tarefas/page.tsx            /tarefas         Lista e progresso de tarefas
   │  ├─ votacoes/
   │  │  ├─ page.tsx                 /votacoes                       Catálogos (padrão + personalizados) e progresso do aluno
   │  │  ├─ [catalogoId]/page.tsx    /votacoes/[catalogoId]          Categorias e enquetes do catálogo, para votar
   │  │  └─ relatorio/page.tsx       /votacoes/relatorio             Relatório consolidado (gráficos)
   │  ├─ duvidas/page.tsx            /duvidas         Enviar dúvida, upvote, ver respostas
   │  └─ terceiros/page.tsx          /terceiros       Vitrine de fornecedores
   ├─ (admin)/admin/                 Só papel admin. layout.tsx próprio + checagem de admin
   │  ├─ page.tsx                    /admin                          Resumo do painel
   │  ├─ membros/page.tsx            /admin/membros                  Listar, remover, promover a admin
   │  ├─ convite/page.tsx            /admin/convite                  Ver e regenerar o código de convite
   │  ├─ evento/page.tsx             /admin/evento                   Editar data, local e programação
   │  ├─ duvidas/page.tsx            /admin/duvidas                  Responder, destacar, marcar como respondida
   │  └─ votacoes/
   │     ├─ page.tsx                 /admin/votacoes                 Catálogos personalizados da turma
   │     ├─ nova/page.tsx            /admin/votacoes/nova            Criar catálogo personalizado
   │     ├─ [catalogoId]/page.tsx    /admin/votacoes/[catalogoId]    Editar catálogo, categorias, perguntas
   │     └─ votos/[enqueteId]/page.tsx  /admin/votacoes/votos/[enqueteId]   Ver quem votou em cada opção
   └─ api/auth/[...all]/route.ts    /api/auth/*      Único Route Handler (Better Auth, login Google)
```

Parênteses como `(app)` são *route groups*: organizam pastas e layouts **sem** aparecer na URL.

**Regras de acesso por grupo:**

| Grupo | Precisa de login | Precisa de turma | Precisa de admin |
|---|---|---|---|
| `(publico)` | não | não | não |
| `(onboarding)` | sim | **não** (se já tem turma, vai para `/dashboard`) | não |
| `(app)` | sim | sim | não |
| `(admin)` | sim | sim | **sim** |

O `proxy.ts` só checa "tem sessão?". A checagem de turma e de admin fica nos `layout.tsx` **e** dentro de cada Server Action e cada leitura de dados, porque o layout sozinho não protege as ações.

Observação sobre `/admin/votacoes/votos/[enqueteId]`: como o ADM vê quem votou, essa página guarda dado pessoal dos colegas. Vale avisar isso na tela de votação ("o organizador vê quem votou").

---

## 3. Assuntos que o projeto aborda (o que estudar)

### 3.1 Fundamentos de web e TypeScript
- HTML semântico, CSS básico, JavaScript moderno (`async/await`, `map/filter/reduce`, desestruturação, módulos).
- TypeScript: tipos, `interface`/`type`, tipos de props, `unknown` vs `any`. O projeto está com `strict: true`.

### 3.2 React
- Componentes, JSX, props, `children`.
- Estado (`useState`), efeitos (`useEffect`), listas e `key`, formulários controlados e não controlados.
- Regras dos Hooks e hooks customizados (pasta `src/hooks`).
- **React Compiler** (ativo no projeto): memoriza componentes automaticamente. Na prática, você quase não precisa de `useMemo`/`useCallback`, mas precisa seguir as regras do React (componentes puros, sem mutar estado).
- Fonte oficial: https://react.dev/learn

### 3.3 Next.js App Router
Leia, nesta ordem, em `node_modules/next/dist/docs/01-app/01-getting-started/`:

| Assunto | Arquivo | Onde usa no projeto |
|---|---|---|
| Estrutura de pastas | `02-project-structure.md` | Toda a árvore `src/` |
| Layouts e páginas | `03-layouts-and-pages.md` | Cada rota do README |
| Navegação (`Link`, `useRouter`) | `04-linking-and-navigating.md` | Menu lateral, redirects |
| **Server vs Client Components** | `05-server-and-client-components.md` | Todo componente novo |
| Busca de dados | `06-fetching-data.md` | Listar enquetes, dúvidas |
| **Mutação de dados (Server Actions)** | `07-mutating-data.md` | Votar, dar upvote, responder |
| Cache e revalidação | `08-caching.md`, `09-revalidating.md` | Atualizar lista após votar |
| Tratamento de erros | `10-error-handling.md` | `error.tsx`, `not-found.tsx` |
| CSS / Tailwind | `11-css.md` | Estilização |
| Imagens e fontes | `12-images.md`, `13-fonts.md` | Logo, avatar, fontes |
| Metadados | `14-metadata-and-og-images.md` | Título e SEO |
| Route Handlers | `15-route-handlers.md` | Rota da API do Better Auth |
| **Proxy** | `16-proxy.md` | Proteger rotas por login |

Conceitos que mais confundem iniciantes:

- **Server Component é o padrão.** Roda só no servidor, pode consultar o banco direto, não usa `useState` nem `onClick`. Adicione `"use client"` só no componente que precisa de interatividade, e o mais baixo possível na árvore.
- **Server Action** = função com `"use server"` chamada por um `<form action={...}>` ou por um botão. Substitui a API REST para mutações. **Trate cada Server Action como um endpoint público:** valide a entrada e cheque a permissão dentro dela, sempre.
- **Rotas dinâmicas** (`[id]`) recebem `params` como **Promise** nesta versão: `const { id } = await params`. Tutoriais antigos mostram sem `await`.
- **Proxy substitui Middleware** no Next 16. O arquivo é `proxy.ts` (na raiz de `src/`), e a função exportada se chama `proxy`. Serve para checagem rápida (ex.: "está logado?"), **não** como única barreira de segurança.
- **Route groups** `(nome)` organizam pastas sem alterar a URL. Bom para separar `(auth)` de `(app)`.
- **Layouts** aninhados: um `layout.tsx` em `src/app/(app)/` pode ter a barra lateral que serve `/dashboard`, `/votacoes` etc.
- **Cache Components** e `"use cache"` são recursos novos e opcionais. Não ative agora. Comece com o comportamento padrão.

### 3.4 Estilo: Tailwind CSS v4 e shadcn/ui
- Tailwind v4 configura o tema em CSS (`@theme` no `globals.css`), não mais em `tailwind.config.js`. O projeto já segue isso.
- shadcn/ui **não é uma biblioteca instalada**: um comando copia o código dos componentes para `src/components/ui`, e o código passa a ser seu. Depende de Radix UI, `class-variance-authority`, `clsx` e `tailwind-merge`.
- Componentes previstos: `Card`, `Dialog`, `ToggleGroup`, `Select`, `DropdownMenu`, `Progress`, `Badge`. Instale cada um só quando for usar.
- Design responsivo: o público usa celular. Comece pelo layout mobile.
- Acessibilidade: o Radix já cuida de foco e teclado, mas use `label` nos campos e contraste adequado.

### 3.5 Banco de dados PostgreSQL com SQL puro
- Modelagem relacional: tabelas, chave primária, chave estrangeira, `UNIQUE`, `CHECK`, índices.
- SQL: `SELECT`, `JOIN`, `GROUP BY`, `INSERT ... ON CONFLICT`, transações.
- Driver: `pg` (o Better Auth exige um `Pool` dele). **Sempre use consultas parametrizadas** (nunca concatene texto do usuário no SQL), para evitar SQL injection: `pool.query('select * from turmas where id = $1', [id])`.
- Um arquivo `src/lib/db.ts` cria a conexão uma vez e é importado pelas actions e pelas funções de leitura.
- Migrações: `db/schema.sql` usa `create table if not exists`, então repete sem erro, mas **não altera tabelas que já existem**. Quando o esquema mudar depois do MVP em uso, passe a numerar arquivos (`001_init.sql`, `002_...`) para o grupo aplicar as mudanças na mesma ordem.
- Onde rodar o banco: o PostgreSQL 18 já roda localmente nesta máquina (conexão por socket Unix, sem senha). O Docker **não está instalado**. Opções: PostgreSQL local (instalado pelo sistema) ou um Postgres gratuito na nuvem (Neon, Supabase, etc.). A nuvem facilita para o grupo de 4 usar o mesmo banco de desenvolvimento, mas exige cuidado com o que é dado real.

**Modelo de dados** (implementado em `db/schema.sql`; as tabelas do Better Auth vêm de `npm run db:auth`):

```
usuarios        (id uuid, name, email, emailVerified, image, createdAt, updatedAt)   -- do Better Auth (modelName "usuarios"; colunas em camelCase, exigem aspas no SQL)
session, account, verification                                                       -- do Better Auth

turmas          (id, nome, codigo_convite UNIQUE, data_evento, local_evento, criado_por -> usuarios.id)
membros         (turma_id, usuario_id UNIQUE -> usuarios.id, papel CHECK ('admin','participante'))   PK (turma_id, usuario_id)
                -- UNIQUE (usuario_id) = uma turma por aluno. Remover essa restrição libera várias turmas.

catalogos       (id, turma_id NULL, nome)              -- turma_id NULL = catálogo padrão (global); preenchido = personalizado
categorias      (id, catalogo_id, nome, ordem)
enquetes        (id, categoria_id, titulo, tipo CHECK ('unica','multipla'), ordem)
opcoes          (id, enquete_id, texto, exclusiva BOOL, ordem)
votos           (turma_id, opcao_id, usuario_id)       PK (opcao_id, usuario_id)
                -- votos identificados; mudar voto = apagar os antigos do usuário nessa enquete e inserir os novos, em uma transação

duvidas         (id, turma_id, autor_id, conteudo, resposta, respondida BOOL, destaque BOOL, created_at)
duvida_upvotes  (duvida_id, usuario_id)                PK (duvida_id, usuario_id)
                -- respondida e destaque são independentes: uma dúvida respondida também pode estar em destaque

tarefas         (id, turma_id, titulo, descricao, status CHECK ('pendente','em_andamento','concluida'), responsavel_id, prazo)
fornecedores    (id, nome, categoria, descricao, contato, imagem_url)   -- global por enquanto (ponto em aberto: quem cadastra?)
```

**Comandos do banco** (leem o `.env.local`; podem ser repetidos sem duplicar dados):

| Comando | O que faz |
|---|---|
| `npm run db:auth` | Cria as tabelas do Better Auth (`usuarios`, `session`, `account`, `verification`). **Rodar primeiro.** |
| `npm run db:schema` | Aplica `db/schema.sql` (tabelas do domínio). |
| `npm run db:seed` | Insere o catálogo padrão (8 categorias, 16 enquetes, 84 opções) lendo `docs/catalogo-enquetes.md`. `-- --dry` só mostra o que leria. |

Se `DATABASE_URL` já estiver definida no shell, ela tem prioridade sobre o `.env.local`. Isso permite testar em um banco descartável.

O relatório automatizado sai de um `SELECT opcao, COUNT(*) ... GROUP BY opcao`. Não precisa de tabela própria.

### 3.6 Autenticação e autorização
Três conceitos separados (a doc `02-guides/authentication.md` explica):

1. **Autenticação:** quem é o usuário (login Google).
2. **Sessão:** como lembrar dele entre requisições (cookie).
3. **Autorização:** o que ele pode fazer (papel `admin` ou `participante` **naquela turma**).

Pontos-chave:
- O papel vale **por turma**, não global. Por isso está na tabela `membros`.
- Como cada aluno tem uma turma só, as funções descobrem a turma pelo usuário logado, sem receber `turmaId` da tela. Isso evita que alguém troque o id no formulário para mexer em outra turma.
- Centralize as checagens num *Data Access Layer* (funções como `getUsuarioAtual()`, `getMembro()`, `exigirAdmin()`), e chame-as em toda Server Action e toda leitura protegida. A doc do Next recomenda isso e o pacote `server-only` para impedir que esse código vá parar no navegador.
- Esconder um botão no front **não** protege nada. A checagem tem de estar na Server Action.
- Código de convite: gere com `crypto.randomBytes` (aleatório e difícil de adivinhar), único, e considere expiração ou opção de regenerar.
- Só há login com Google, via Better Auth (lista de bibliotecas recomendadas pela doc do Next). Detalhes na seção 2.
- Sem senha no projeto: não há hash nem recuperação de senha para implementar.

### 3.7 Formulários e validação
- `<form action={serverAction}>` e o hook `useActionState` (React 19) para mostrar erros.
- Validação com **Zod** (recomendo instalar): valida no servidor o que chega do formulário.
- `useFormStatus` ou `useOptimistic` para o upvote responder na hora, antes de o servidor confirmar.
- Doc: `02-guides/forms.md`.

### 3.8 Gráficos (Recharts)
- Biblioteca de componentes React. Precisa de `"use client"`.
- Os dados vêm de uma query SQL feita no Server Component e passados como props para o gráfico.
- Comece com barras horizontais por opção (é o que enquete pede), com rótulos e percentuais. Evite gráfico de pizza com muitas fatias.

### 3.9 Regras de negócio específicas do app
- **Enquete de seleção única:** um voto por usuário por enquete. Ao votar de novo, substitui o anterior.
- **Seleção múltipla:** vários votos por usuário. Opção `exclusiva` limpa as demais. Ao mudar, o conjunto novo substitui o antigo.
- **Voto identificado:** o ADM vê quem votou em cada opção. O formando vê só os totais (defina se ele também vê a porcentagem antes de votar).
- **Upvote:** um por usuário por dúvida, alternável. A lista ordena por votos, com dúvidas em destaque fixadas no topo.
- **Status da dúvida:** `aberta`, `respondida`, `destaque`. Só admin muda.
- **Seed do catálogo padrão:** script que lê `catalogo-enquetes.md` (8 categorias, 16 perguntas) e insere **uma vez** no banco, com `turma_id` nulo. Todas as turmas enxergam esse catálogo.
- **Catálogos personalizados:** só o admin da turma cria e edita. Aparecem só para aquela turma.
- **Turma:** ao criar, o usuário vira admin. Ao entrar por código, vira participante. Não pode sair sendo o último admin.

### 3.10 Qualidade, Git e trabalho em equipe
- Git com branches por funcionalidade e Pull Requests, já que são 4 pessoas.
- Commits pequenos e com mensagem clara (padrão *Conventional Commits*: `feat:`, `fix:`).
- ESLint e Prettier. **O projeto ainda não tem ESLint** (o `package.json` não tem script `lint`). Considere adicionar.
- Testes: comece pelo básico (funções puras de `src/lib`). Testes de ponta a ponta (Playwright) ficam para depois.
- Variáveis de ambiente: nunca comite `.env.local`. Crie um `.env.example` sem segredos para o grupo.

### 3.11 Deploy
- Vercel é o caminho mais simples para Next.js. Precisa de banco acessível pela internet e das variáveis de ambiente configuradas.
- Antes de publicar, siga `02-guides/production-checklist.md`.
- Login Google exige cadastrar a URL de callback de produção no Google Cloud Console.

---

## 4. Roteiro sugerido (passo a passo)

Cada etapa termina com algo que você consegue ver funcionando. Faça uma de cada vez.

| Etapa | O que fazer | Resultado visível |
|---|---|---|
| **0. Base** | Estudar 3.1–3.3. Rodar `npm run dev`. Trocar o texto da `page.tsx`. | Site local mudando |
| **1. Layout** | Limpar o template. Criar `layout.tsx` com barra lateral/menu e as rotas vazias do README. Instalar shadcn/ui. | Navegação entre páginas vazias |
| **2. UI com dados falsos** | Montar `/votacoes` e `/duvidas` com dados fixos em arquivos `.ts`. Nenhum banco ainda. | Telas bonitas e clicáveis |
| **3. Banco** | Instalar Postgres, criar `schema.sql`, `src/lib/db.ts`, script de seed do catálogo. | Dados aparecendo do banco |
| **4. Login** | Better Auth com Google, `npx auth@latest migrate`, `proxy.ts` protegendo rotas. | Entrar e sair |
| **5. Turmas e convite** | Criar turma (vira admin), gerar código, entrar por código. Papéis em `membros`. | Duas contas na mesma turma |
| **6. Votação** | Server Action de votar. Regras de única/múltipla. | Voto persistido |
| **7. Relatório** | Query de contagem + Recharts. | Gráfico por pergunta |
| **8. Dúvidas** | Enviar, upvote, ordenação. Depois painel de resposta/destaque do admin. | Q&A completo |
| **9. Dashboard, tarefas, terceiros** | Restante do MVP. | MVP completo |
| **10. Admin** | Gestão de membros, edição do evento, enquetes personalizadas. | Painel admin |
| **11. Acabamento** | Erros, carregamento (`loading.tsx`), responsivo, acessibilidade, testes. | Pronto para uso |
| **12. Deploy** | Vercel + banco em nuvem + Google callback. | URL pública |

Sugestão de divisão para 4 pessoas depois da etapa 1: uma pessoa por área (votações, dúvidas, admin/turmas, dashboard/tarefas/terceiros), com a etapa 3–5 (banco, login, turmas) feitas juntas, porque tudo depende delas.

---

## 5. Ferramentas que ajudam (plugins, skills, MCP)

Nada abaixo está instalado por mim. Decida o que quer.

### Já disponíveis nesta sessão (skills)
- **`/run`**: sobe o app e confirma que a mudança funciona de verdade.
- **`/code-review`**: revisa o diff em busca de bugs. Use antes de cada Pull Request.
- **`/security-review`**: revisão de segurança das mudanças. Importante aqui (autorização em Server Actions, SQL, convites).
- **`/simplify`**: limpeza de código repetido depois que a funcionalidade funciona.
- **`/init`**: gera/atualiza um `CLAUDE.md` com a arquitetura do projeto.
- **`caveman:safe-refactor`, `caveman:surgical-patch`, `caveman:lean-build`, `caveman:investigate-first`**: fluxos para refatorar, corrigir bug, construir funcionalidade sem exagero e diagnosticar erros.
- **`/fewer-permission-prompts`**: reduz as confirmações de permissão em comandos de leitura.
- **`claude-in-chrome`**: controla o Chrome para testar as telas.

### Recomendo adicionar
1. **`next-devtools-mcp`** (oficial, Next.js 16+): dá ao agente acesso aos erros de build e runtime do `next dev` em tempo real, e aponta para a doc da versão instalada. Configuração de uma linha em `.mcp.json`, descrita em `02-guides/mcp.md`:
   ```json
   { "mcpServers": { "next-devtools": { "command": "npx", "args": ["-y", "next-devtools-mcp@latest"] } } }
   ```
2. **Playwright MCP**: testar telas no navegador. Alternativa: a skill `claude-in-chrome`, que já existe.
3. **MCP do shadcn/ui**: permite buscar e instalar componentes por conversa. Confirme o comando atual na doc do shadcn antes de usar.
4. **Pacotes do projeto**: `zod` (validação), `server-only` (proteção de código de servidor), `better-auth`, `pg`, `recharts`, e ESLint/Prettier.

### Opcional
- **Skill própria do projeto** (com `skill-creator`): guardar as convenções do grupo (nomes de tabelas, como escrever uma Server Action, padrão de checagem de admin). Só vale a pena depois das primeiras funcionalidades.
- **MCP de PostgreSQL** para consultar o banco por conversa: útil, mas dá acesso ao banco. Use só com banco de desenvolvimento.

---

## 6. Erros comuns de quem está começando

1. Colocar `"use client"` em tudo. Perde as vantagens do servidor.
2. Usar `useEffect` + `fetch` para carregar dados. Neste projeto, leia no Server Component.
3. Esquecer `await params` em rotas dinâmicas.
4. Confiar em esconder botão para proteger função de admin.
5. Montar SQL concatenando strings.
6. Comitar `.env.local` ou segredos.
7. Copiar código de tutorial do Next 12–14 (`pages/`, `middleware.ts`, `getServerSideProps`). Aqui é App Router e `proxy.ts`.
8. Criar todas as telas e todo o banco antes de testar. Faça fatias verticais pequenas (uma tela + seu banco + sua action).

---

## 7. Links úteis

- React: https://react.dev/learn
- Next.js (local, versão exata): `node_modules/next/dist/docs/`
- TypeScript: https://www.typescriptlang.org/docs/handbook/
- Tailwind v4: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- PostgreSQL: https://www.postgresql.org/docs/current/tutorial.html
- Better Auth: https://www.better-auth.com/docs
- Recharts: https://recharts.org
- Zod: https://zod.dev
