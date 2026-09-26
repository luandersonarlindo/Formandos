# Formandos 🎓

**Formandos** é uma aplicação de gestão administrativa de formaturas e eventos desenvolvida com React e Next.js. O app proporciona autonomia, praticidade e organização para que turmas e comissões organizadoras planeiem todos os recursos necessários para a realização do evento.

> **Estado do projeto:** o MVP está implementado e testado localmente. O deploy está preparado em [`docs/deploy.md`](docs/deploy.md), mas ainda não foi executado.

---

## 🚀 Visão Geral e Âmbito (MVP)

O aplicativo funciona como um *hub* central de organização, dividindo as responsabilidades de forma clara entre a **Comissão Organizadora / Administradores** (professores/representantes) e os **Participantes** (formandos/alunos).

* **Acesso Restrito por Turma:** Autenticação exclusivamente com a conta Google ("Entrar com Google"). Cada utilizador pertence a **uma única turma por vez**. O acesso a uma turma é feito através de um **código de convite privado** gerado pelo administrador.

* **Gestão de Permissões (RBAC):** Somente os Administradores possuem privilégios para criar catálogos de enquetes personalizados, responder e destacar dúvidas, definir data/local do evento e gerir membros.

* **Motor de Decisão (Enquetes por Categoria):**
  * O **catálogo padrão** vem pré-configurado, dividido em 8 categorias (*Espaço do Evento*, *Comida & Gastronomia*, *Bebidas & Bar*, *Música & Atrações*, *Experiência Visual & Recordações*, *Estrutura, Segurança & Recepção*, *Traje & Identidade Visual*, *Rituais & Pré-Eventos*).
  * O administrador pode criar **catálogos personalizados** para a sua turma, com categorias e perguntas próprias.
  * Opções de resposta descritivas e interativas (evitando o tradicional "sim/não"), com suporte a seleção única, múltipla escolha e opção neutra/negativa (*exclusiva*).
  * Os votos são **identificados**: o administrador vê quem votou em cada opção. Os participantes podem **alterar o voto**.
* **Relatórios Automatizados:** Processamento dos votos para gerar um relatório consolidado sobre as preferências da turma.

* **Módulo de Perguntas e Respostas (Q&A - estilo *Letmeask*):**
  * Canal direto onde os formandos enviam dúvidas sobre o evento.
  * **Sistema de Upvotes:** Os alunos votam nas perguntas mais relevantes de outros colegas para dar visibilidade às dúvidas comuns.
  * **Destaque e Resposta do ADM:** A comissão responde oficialmente e pode marcar a dúvida como *"Respondida"* ou *"Em Destaque"*.

* **Tarefas e Dashboard:** contagem regressiva para a festa, data, local, programação e indicadores da turma; lista de tarefas com responsável, prazo e progresso.

* **Vitrine de Terceiros (Marketplace):** Catálogo para conectar a turma a prestadores de serviços (buffet, músicos, equipa de apoio/mordomos, fotógrafos), cadastrados pelo administrador de cada turma.

---

## 👥 Membros do Projeto

* **Luanderson Arlindo**
* **Luiz Orlando**
* **José Renato**
* **Vinícius**

---

## 🛠️ Tecnologias Utilizadas

* **React 19:** Construção de interfaces declarativas baseadas em componentes.
* **Next.js 16 (App Router):** Roteamento, renderização no servidor e *Server Actions*. O antigo *Middleware* chama-se **Proxy** (`proxy.ts`) nesta versão.
* **PostgreSQL:** Base de dados relacional principal, acessada diretamente por consultas SQL nativas (sempre parametrizadas) no lado do servidor via driver `pg`.
* **Better Auth:** Autenticação de utilizadores (login social exclusivo com Google). Guarda utilizadores e sessões no próprio PostgreSQL.
* **Tailwind CSS v4:** Estilização utilitária moderna e responsiva.
* **shadcn/ui + Radix UI:** Componentes de interface acessíveis e reutilizáveis, copiados para `src/components/ui` conforme o uso (`Button`, `Card`, `Badge`, `Input`, `Label`, `Textarea`, `Progress`, `Skeleton`).
* **Recharts:** Visualização de dados e gráficos para os relatórios automatizados das enquetes.
* **Zod:** Validação dos dados recebidos pelas Server Actions.
* **Vitest:** Testes unitários das funções puras.

---

## 📂 Estrutura de Domínios (Next.js App Router)

Cada utilizador pertence a uma única turma, por isso as URLs **não** levam o identificador da turma: o servidor descobre a turma pelo utilizador autenticado. As pastas entre parênteses são *route groups* e não aparecem na URL.

| Grupo | Acesso | Rotas |
|---|---|---|
| `(publico)` | Qualquer pessoa | `/` (apresentação), `/entrar` (login com Google) |
| `(onboarding)` | Autenticado, sem turma | `/convite` (informar código de convite ou criar turma) |
| `(app)` | Autenticado, com turma | `/dashboard`, `/tarefas`, `/votacoes`, `/votacoes/[catalogoId]`, `/votacoes/relatorio`, `/duvidas`, `/terceiros` |
| `(admin)` | Administrador da turma | `/admin`, `/admin/membros`, `/admin/convite`, `/admin/evento`, `/admin/duvidas`, `/admin/votacoes`, `/admin/votacoes/nova`, `/admin/votacoes/[catalogoId]`, `/admin/votacoes/votos/[enqueteId]` |
| API | — | `/api/auth/[...all]` (único *Route Handler*, usado pelo Better Auth) |

* `/dashboard` - Visão geral da turma, contagem decrescente e programação oficial da festa.
* `/tarefas` - Lista e acompanhamento do progresso das tarefas organizacionais.
* `/votacoes` - Catálogos de enquetes (padrão e personalizados), votação por categoria e relatórios automatizados.
* `/duvidas` - Fórum de Perguntas & Respostas (estilo *Letmeask*) com envio de dúvidas e votação em perguntas da comunidade.
* `/terceiros` - Vitrine de fornecedores e prestadores de serviços.
* `/admin` - Painel exclusivo para ADMs: gestão de membros e código de convite, resposta e moderação de dúvidas, catálogos personalizados, consulta de quem votou e edição dos dados do evento.

> As mutações (votar, dar upvote, responder, gerar convite…) são **Server Actions** e não têm URL própria.

---

## 🏛️ Arquitetura e Organização

O projeto adota uma arquitetura em camadas focada em simplicidade e eficácia:

* **`/src/proxy.ts`:** Redireciona para o login quem não tem sessão. É uma verificação rápida, **não** a barreira final de segurança.
* **`/src/app`:** Rotas, layouts, telas de erro (`error.tsx`, `global-error.tsx`), carregamento (`loading.tsx`) e `not-found.tsx`.
* **`/src/components/ui`:** Componentes genéricos da biblioteca shadcn/ui.
* **`/src/components/features`:** Componentes de domínio (menu lateral, cartão de votação, gráfico da enquete, botão de upvote, formulários de tarefa, fornecedor, evento e catálogo, contagem regressiva…).
* **`/src/actions` (Server Actions):** Mutações e execução de *queries* SQL puras diretamente no PostgreSQL, por área: `turmas.ts`, `votos.ts`, `duvidas.ts`, `tarefas.ts`, `terceiros.ts`, `evento.ts`, `catalogos.ts` e `admin.ts`. **Toda Server Action valida a entrada (Zod) e confere a permissão do utilizador.**
* **`/src/lib/db.ts`:** Conexão direta com o PostgreSQL (`Pool` do `pg`) e a função `transacao`.
* **`/src/lib/auth.ts` e `auth-client.ts`:** Configuração do Better Auth (provedor Google) no servidor e no navegador. A tabela de utilizadores chama-se `usuarios`.
* **`/src/lib/dal.ts`:** *Data Access Layer* com as verificações centralizadas: `exigirSessao()`, `getMembro()`, `exigirMembro()` e `exigirAdmin()`.
* **`/src/lib` (consultas e utilitários):** consultas de leitura por área (`votacoes.ts`, `relatorio.ts`, `duvidas.ts`, `tarefas.ts`, `terceiros.ts`, `dashboard.ts`, `admin.ts`) e funções puras (`convite.ts`, `datas.ts`), estas com testes em `*.test.ts`.
* **`/db`:** `schema.sql` (tabelas do domínio), `apply-schema.mjs` e `seed.mjs` (catálogo padrão, lido de `docs/catalogo-enquetes.md`).
* **`/docs`:** catálogo de enquetes, guia de estudo e guia de deploy.

---

## ❓ Módulo de Dúvidas (Funcionamento do Q&A)

Inspirado no projeto **Letmeask (NLW-06)**, a área `/duvidas` possui as seguintes mecânicas:

1. **Envio de Pergunta:** O aluno envia uma dúvida (ex: *"Quando será o prazo final para enviar as fotos do telão?"*).
2. **Engajamento (Upvote):** Outros formandos que possuem a mesma dúvida clicam no ícone de *Like*. A lista reordena automaticamente colocando as perguntas mais votadas no topo.
3. **Moderação ADM** (em `/admin/duvidas`): A comissão organizadora acessa com permissão administrativa para:
   * **Fixar / Destacar:** Coloca perguntas cruciais no topo da tela.
   * **Responder:** Adiciona a resposta oficial da comissão.
   * **Marcar como Respondida:** Altera o status visual da pergunta para manter a organização.

---

## 📋 Catálogos de Enquetes

O sistema trabalha com dois tipos de catálogo:

* **Catálogo padrão:** pré-configurado, igual para todas as turmas e somente leitura. Está descrito em [`docs/catalogo-enquetes.md`](docs/catalogo-enquetes.md) (8 categorias e 16 perguntas).
* **Catálogos personalizados:** criados pelo administrador de uma turma, visíveis apenas para essa turma, com categorias e perguntas próprias.

As 8 categorias do catálogo padrão:

1. **Espaço do Evento:** Estilo do local e prioridade geográfica.
2. **Comida & Gastronomia:** Formato do serviço, restrições/alergias alimentares e menu de fim de noite.
3. **Bebidas & Bar:** Modalidade do bar e preferências da pista.
4. **Música & Atrações:** Atração principal e ritmos musicais.
5. **Experiência Visual & Recordações:** Formato de registo fotográfico/vídeo e itens de animação.
6. **Estrutura, Segurança & Recepção:** Equipa de apoio prioritária (segurança, mestre de cerimónias, manobristas).
7. **Traje & Identidade Visual:** Estilo de traje recomendado e linha decorativa.
8. **Rituais & Pré-Eventos:** Eventos prévios e rituais tradicionais da cerimónia.

---

## ⚙️ Como Executar o Projeto

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/luandersonarlindo/Formandos.git
   cd Formandos
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   # ou
   pnpm install
   ```

3. **Criar as credenciais do Google (gratuito):**
   No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, configure a tela de consentimento OAuth e crie um *ID do cliente OAuth* (tipo "Aplicativo da Web"). Em *URIs de redirecionamento autorizados*, adicione `http://localhost:3000/api/auth/callback/google`. Use apenas os escopos básicos (`openid`, `email`, `profile`).

4. **Configurar as Variáveis de Ambiente:**
   Copie `.env.example` para `.env.local` na raiz do projeto (nunca o comite) e preencha a string de conexão do PostgreSQL e as credenciais do Better Auth. Gere o segredo com `openssl rand -base64 32`:
   ```env
   DATABASE_URL="postgres://usuario:senha@localhost:5432/formandos"   # ou por socket: postgresql://usuario@localhost/formandos?host=/var/run/postgresql
   BETTER_AUTH_SECRET="gere_um_valor_aleatorio_com_32_ou_mais_caracteres"
   BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="seu_google_client_id"
   GOOGLE_CLIENT_SECRET="seu_google_client_secret"
   ```

5. **Criar o banco e as tabelas** (nesta ordem):
   ```bash
   createdb formandos        # ou crie o banco pelo seu cliente PostgreSQL
   npm run db:auth           # tabelas do Better Auth: usuarios, session, account, verification
   npm run db:schema         # tabelas do domínio (db/schema.sql): turmas, membros, catálogos, enquetes, votos, dúvidas…
   npm run db:seed           # catálogo padrão, lido de docs/catalogo-enquetes.md
   ```
   Os três comandos podem ser repetidos sem problema: só criam o que falta. O `db:seed` não duplica o catálogo.

6. **Rodar os testes** (opcional):
   ```bash
   npm test
   ```
   Os testes unitários cobrem as funções puras de `src/lib` (código de convite e datas).

7. **Executar o ambiente de desenvolvimento:**
   ```bash
   npm run dev
   ```

8. **Aceder à aplicação:**
   Abra `http://localhost:3000` no seu navegador.

### Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build e servidor de produção |
| `npm test` | Testes unitários (Vitest) |
| `npm run db:auth` | Tabelas do Better Auth |
| `npm run db:schema` | Tabelas do domínio (`db/schema.sql`) |
| `npm run db:seed` | Catálogo padrão (`-- --dry` só mostra o que leria) |

Se `DATABASE_URL` já estiver definida no shell, ela tem prioridade sobre o `.env.local`.

---

## 🚀 Deploy

O grupo escolheu o **Render** (aplicação e banco PostgreSQL). O passo a passo está em [`docs/deploy-render.md`](docs/deploy-render.md), com a configuração em [`render.yaml`](render.yaml). O guia geral, com a alternativa Vercel, checklist e segurança, está em [`docs/deploy.md`](docs/deploy.md).

> O PostgreSQL do plano gratuito do Render **expira 30 dias depois de criado**. Veja a seção 6 do guia antes de contar com ele.

---

## 🛡️ Segurança e Acessibilidade

* Toda página protegida e toda Server Action validam sessão, turma e papel em `src/lib/dal.ts`. O `proxy.ts` é só a primeira barreira.
* Entradas validadas com Zod; consultas SQL sempre parametrizadas.
* Tentativas de código de convite inválido são limitadas (10 a cada 15 minutos por utilizador). Não há limite de envio de dúvidas nem de votos por utilizador.
* Cabeçalhos de segurança (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) configurados em `next.config.ts`.
* Link "Pular para o conteúdo", títulos por página, tabela alternativa nos gráficos e mensagens de erro anunciadas para leitores de ecrã.
* Telas de carregamento (`loading.tsx`), erro (`error.tsx`, `global-error.tsx`) e página não encontrada em português.

---

## 🔗 Referências de Design e Estrutura

* **NLW-06-ReactJS (Rocketseat - Letmeask):** [Repositório GitHub](https://github.com/rocketseat-education/nlw-06-reactjs)
* **Figma (Letmeask):** [Layout de Referência](https://www.figma.com/design/2r8K23o2jmF2z17AtBilZe/Letmeask--Community-%253Fnode-id%253D0-1%2526p%253Df%2526t%253D8VVmpO1EYRbg9LfF-0)
* **Better Auth:** [Documentação](https://www.better-auth.com/docs)
* **Guia de estudo do projeto:** [`docs/guia-de-estudo.md`](docs/guia-de-estudo.md)
