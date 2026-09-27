# Formandos 🎓

**Formandos** é uma aplicação de gestão administrativa de formaturas e eventos desenvolvida com React e Next.js. O app proporciona autonomia, praticidade e organização para que turmas e comissões organizadoras planeiem todos os recursos necessários para a realização do evento.

> **Estado do projeto:** o MVP está implementado e roda localmente (veja "Como Executar o Projeto"). O projeto não está hospedado: o código fica no GitHub.

---

## 🚀 Visão Geral e Âmbito (MVP)

O aplicativo funciona como um *hub* central de organização, dividindo as responsabilidades de forma clara entre a **Comissão Organizadora / Administradores** (professores/representantes) e os **Participantes** (formandos/alunos).

* **Acesso Restrito por Turma:** Login com a conta Google ("Entrar com Google") ou com **email e senha** (com confirmação do email pelo link enviado). Um participante pertence a **uma turma**; quem é **administrador** em alguma turma pode participar de **várias** (entrando por convite ou criando outras) e escolhe a turma em uso num seletor na barra lateral. O acesso a uma turma é feito através de um **código de convite privado** gerado pelo administrador.

* **Administrador master:** gestor de toda a plataforma. Vê todas as turmas e usuários, gere membros e papéis em qualquer turma, exclui turmas e usuários. Quem é master é definido pela variável `ADMIN_MASTER_EMAILS` (não há tela para isso).

* **Gestão de Permissões (RBAC):** Somente os Administradores possuem privilégios para criar catálogos de enquetes personalizados, responder e destacar dúvidas, definir os detalhes do evento, fixar decisões, gerir membros e arquivar ou excluir a turma.

* **Motor de Decisão (Enquetes por Categoria):**
  * O **catálogo padrão** vem pré-configurado, dividido em 10 categorias (*Formato do Evento*, *Espaço do Evento*, *Comida & Gastronomia*, *Bebidas & Bar*, *Música & Atrações*, *Experiência Visual & Recordações*, *Estrutura, Segurança & Recepção*, *Traje & Identidade Visual*, *Rituais & Pré-Eventos*, *Orçamento & Arrecadação*).
  * O administrador pode criar **catálogos personalizados** para a sua turma, com categorias e perguntas próprias, ou partir de um **modelo** por perfil de turma (Ensino Médio, Educação Infantil e ABC, Pós-graduação e MBA, Área da Saúde).
  * Opções de resposta descritivas e interativas (evitando o tradicional "sim/não"), com suporte a seleção única, múltipla escolha e opção neutra/negativa (*exclusiva*).
  * Os votos são **identificados**: o administrador vê quem votou em cada opção. Os participantes podem **alterar o voto**.
  * O administrador pode **fixar a decisão** da turma em uma pergunta: a escolha aparece no dashboard de todos e a votação daquela pergunta é encerrada (dá para reabrir).
* **Relatórios Automatizados:** Processamento dos votos para gerar um relatório consolidado sobre as preferências da turma.

* **Módulo de Perguntas e Respostas (Q&A - estilo *Letmeask*):**
  * Canal direto onde os formandos enviam dúvidas sobre o evento.
  * **Sistema de Upvotes:** Os alunos votam nas perguntas mais relevantes de outros colegas para dar visibilidade às dúvidas comuns.
  * **Destaque e Resposta do ADM:** A comissão responde oficialmente e pode marcar a dúvida como *"Respondida"* ou *"Em Destaque"*.

* **Tarefas e Dashboard:** contagem regressiva para a festa, descrição, data e horário de término, local com endereço, botão *Como chegar*, traje, observações do local, decisões da turma, programação e indicadores; lista de tarefas com responsável, prazo e progresso.

* **Confirmação de presença:** cada membro diz se vai ao evento (vou, talvez, não vou) e quantos acompanhantes leva; o painel `/admin/presenca` mostra o total de pessoas esperadas, com filtro e paginação.

* **Arquivar e excluir a turma:** o administrador pode **arquivar** a turma (todo o registro continua disponível, mas só para leitura e sem novos membros) e desarquivar depois, ou **excluí-la** de vez, digitando o nome para confirmar. Cada pessoa também pode **excluir a própria conta** (`/conta`).

* **Listas grandes:** dúvidas (10 por página), membros (20, com busca por nome ou email sem diferenciar acentos) e, no master, usuários e turmas (20) são paginados pela URL (`?pagina=2`).

* **Vitrine de Terceiros (Marketplace):** Catálogo para conectar a turma a prestadores de serviços (buffet, músicos, equipa de apoio/mordomos, fotógrafos), cadastrados pelo administrador de cada turma. O administrador também registra valor orçado e status (cotando, contratado, descartado) de cada fornecedor, com o total orçado e comprometido no topo da página; participantes não veem esses valores.

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
* **Better Auth:** Autenticação de utilizadores (login com Google e com email e senha). Guarda utilizadores e sessões no próprio PostgreSQL.
* **Anime.js:** Animações da página inicial (entrada do topo, revelação ao rolar, contadores e barras). O conteúdo é renderizado no servidor e a animação é só um acréscimo; quem pede "menos movimento" no sistema vê a página parada.
* **Nodemailer:** Envio de emails por SMTP (confirmação de conta, definir senha e boas-vindas).
* **Tailwind CSS v4:** Estilização utilitária moderna e responsiva.
* **shadcn/ui + Radix UI:** Componentes de interface acessíveis e reutilizáveis, copiados para `src/components/ui` conforme o uso (`Button`, `Card`, `Badge`, `Input`, `Label`, `Textarea`, `Progress`, `Skeleton`).
* **Recharts:** Visualização de dados e gráficos para os relatórios automatizados das enquetes.
* **Zod:** Validação dos dados recebidos pelas Server Actions.
* **Vitest:** Testes unitários das funções puras.

---

## 📂 Estrutura de Domínios (Next.js App Router)

As URLs **não** levam o identificador da turma: o servidor descobre a turma em uso pelo utilizador autenticado (turma escolhida no seletor, guardada num cookie e sempre conferida no banco). As pastas entre parênteses são *route groups* e não aparecem na URL.

| Grupo | Acesso | Rotas |
|---|---|---|
| `(publico)` | Qualquer pessoa | `/` (vitrine do projeto, com animações), `/entrar` (login com Google ou email e senha), `/esqueci-senha`, `/redefinir-senha` |
| `(onboarding)` | Autenticado, sem turma | `/convite` (informar código de convite ou criar turma) |
| `(conta)` | Autenticado (com ou sem turma) | `/conta` (ver e excluir a própria conta) |
| `(app)` | Autenticado, com turma | `/dashboard`, `/tarefas`, `/votacoes`, `/votacoes/[catalogoId]`, `/votacoes/relatorio`, `/duvidas`, `/terceiros` |
| `(master)` | Administrador master (`ADMIN_MASTER_EMAILS`); para os demais a página não existe (404) | `/master`, `/master/turmas`, `/master/turmas/[turmaId]`, `/master/usuarios` |
| `(admin)` | Administrador da turma | `/admin`, `/admin/membros`, `/admin/convite`, `/admin/evento`, `/admin/turma` (arquivar, desarquivar e excluir), `/admin/presenca`, `/admin/duvidas`, `/admin/votacoes`, `/admin/votacoes/nova`, `/admin/votacoes/[catalogoId]`, `/admin/votacoes/votos/[enqueteId]` |
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
* **`/src/actions` (Server Actions):** Mutações e execução de *queries* SQL puras diretamente no PostgreSQL, por área: `turmas.ts`, `gestao-turma.ts`, `conta.ts`, `votos.ts`, `decisoes.ts`, `duvidas.ts`, `tarefas.ts`, `terceiros.ts`, `evento.ts`, `presenca.ts`, `terceiros.ts`, `catalogos.ts`, `admin.ts` e `master.ts`. **Toda Server Action valida a entrada (Zod) e confere a permissão do utilizador.**
* **`/src/lib/db.ts`:** Conexão direta com o PostgreSQL (`Pool` do `pg`) e a função `transacao`.
* **`/src/lib/auth.ts` e `auth-client.ts`:** Configuração do Better Auth (Google e email e senha) no servidor e no navegador. A tabela de utilizadores chama-se `usuarios`.
* **`/src/lib/email.ts`:** Envio de emails por SMTP e os textos dos emails. Sem `SMTP_HOST`, o email é escrito no terminal do servidor.
* **`/src/lib/dal.ts`:** *Data Access Layer* com as verificações centralizadas: `exigirSessao()`, `getMembro()`, `exigirMembro()`, `exigirAdmin()` e `exigirMaster()`. `src/lib/master.ts` decide quem é master e `src/lib/plataforma.ts` traz as consultas de todas as turmas.
* **`/src/lib` (consultas e utilitários):** consultas de leitura por área (`votacoes.ts`, `relatorio.ts`, `duvidas.ts`, `tarefas.ts`, `terceiros.ts`, `dashboard.ts`, `admin.ts`) e funções puras (`convite.ts`, `datas.ts`), estas com testes em `*.test.ts`.
* **`/db`:** `schema.sql` (tabelas do domínio), `apply-schema.mjs` e `seed.mjs` (catálogo padrão, lido de `docs/catalogo-enquetes.md`) e `catalogo-md.mjs` (leitor dos catálogos em Markdown).
* **`/docs`:** catálogo de enquetes, catálogos-modelo (`catalogos-modelo/`) e guia de estudo.

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

* **Catálogo padrão:** pré-configurado, igual para todas as turmas e somente leitura. Está descrito em [`docs/catalogo-enquetes.md`](docs/catalogo-enquetes.md) (10 categorias e 23 perguntas).
* **Catálogos personalizados:** criados pelo administrador de uma turma, visíveis apenas para essa turma, com categorias e perguntas próprias. Podem começar do zero ou de um **modelo** pronto, em [`docs/catalogos-modelo/`](docs/catalogos-modelo): Ensino Médio, Educação Infantil e ABC, Pós-graduação e MBA, e Cursos da Área da Saúde. O modelo é copiado para a turma e pode ser editado.

As 10 categorias do catálogo padrão:

1. **Formato do Evento:** Formato da comemoração, horário e duração, e cerimônia de colação.
2. **Espaço do Evento:** Estilo do local e prioridade geográfica.
3. **Comida & Gastronomia:** Formato do serviço, restrições/alergias alimentares e menu de fim de noite.
4. **Bebidas & Bar:** Modalidade do bar e preferências da pista.
5. **Música & Atrações:** Atração principal e ritmos musicais.
6. **Experiência Visual & Recordações:** Formato de registo fotográfico/vídeo e itens de animação.
7. **Estrutura, Segurança & Recepção:** Equipa de apoio prioritária (segurança, mestre de cerimónias, manobristas) e cuidados com os convidados (acessibilidade, crianças, sustentabilidade).
8. **Traje & Identidade Visual:** Estilo de traje recomendado, linha decorativa e tema da festa.
9. **Rituais & Pré-Eventos:** Eventos prévios e rituais tradicionais da cerimónia.
10. **Orçamento & Arrecadação:** Formas de arrecadar e onde priorizar o orçamento.

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

3. **Criar as credenciais do Google (gratuito, opcional):**
   Sem elas, o botão do Google some e só o login por email e senha funciona. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto, configure a tela de consentimento OAuth e crie um *ID do cliente OAuth* (tipo "Aplicativo da Web"). Em *URIs de redirecionamento autorizados*, adicione `http://localhost:3000/api/auth/callback/google`. Use apenas os escopos básicos (`openid`, `email`, `profile`).

4. **Configurar as Variáveis de Ambiente:**
   Copie `.env.example` para `.env.local` na raiz do projeto (nunca o comite) e preencha a string de conexão do PostgreSQL e as credenciais do Better Auth. Gere o segredo com `openssl rand -base64 32`:
   ```env
   DATABASE_URL="postgres://usuario:senha@localhost:5432/formandos"   # ou por socket: postgresql://usuario@localhost/formandos?host=/var/run/postgresql
   BETTER_AUTH_SECRET="gere_um_valor_aleatorio_com_32_ou_mais_caracteres"
   BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="seu_google_client_id"
   GOOGLE_CLIENT_SECRET="seu_google_client_secret"
   # Administradores master (emails separados por vírgula, com email confirmado)
   ADMIN_MASTER_EMAILS="voce@gmail.com"
   # Envio de email (veja o passo abaixo)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="seu@gmail.com"
   SMTP_PASS="senha_de_app_de_16_letras"
   EMAIL_FROM="Formandos <seu@gmail.com>"
   ```

   **Envio de email (necessário para o login por email e senha).** O cadastro só vale depois de o utilizador clicar no link de confirmação enviado por email, e o mesmo envio serve para "Esqueci a senha" e para o email de boas-vindas. Sem `SMTP_HOST`, o email não é enviado: o texto (com o link) aparece só no terminal do servidor, e quem cria conta por email e senha não recebe o link e não consegue entrar. O login com Google não depende disso. Com Gmail:
   1. Ative a verificação em duas etapas na conta que vai enviar os emails.
   2. Gere uma *senha de app* em [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) e use-a em `SMTP_PASS` (nunca a senha normal da conta).
   3. Contas institucionais (Google Workspace) podem ter esse recurso bloqueado pelo administrador. Nesse caso use um Gmail pessoal.

   Quem entrou pelo Google e quer também usar email e senha usa **"Esqueci a senha"** na tela de login: o link enviado por email cria a senha na mesma conta, com os mesmos dados.

5. **Criar o banco e as tabelas** (nesta ordem):
   ```bash
   createdb formandos        # ou crie o banco pelo seu cliente PostgreSQL
   npm run db:auth           # tabelas do Better Auth: usuarios, session, account, verification
   npm run db:schema         # tabelas do domínio (db/schema.sql): turmas, membros, catálogos, enquetes, votos, dúvidas…
   npm run db:seed           # catálogo padrão, lido de docs/catalogo-enquetes.md
   ```
   Os três comandos podem ser repetidos sem problema: só criam o que falta. O `db:seed` não duplica o catálogo e, se o Markdown ganhar perguntas ou opções, acrescenta as novas sem apagar nada (os votos já dados continuam valendo).

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
| `npm run typecheck` | Gera os tipos das rotas do Next e confere o TypeScript. Numa cópia recém-clonada, rode este comando (ou `npm run dev`) antes de abrir o editor: os tipos `PageProps` e `LayoutProps` só existem depois disso |
| `npm test` | Testes unitários (Vitest) |
| `npm run db:auth` | Tabelas do Better Auth |
| `npm run db:schema` | Tabelas do domínio (`db/schema.sql`) |
| `npm run db:seed` | Catálogo padrão (`-- --dry` só mostra o que leria) |

Se `DATABASE_URL` já estiver definida no shell, ela tem prioridade sobre o `.env.local`.

---

## 🛡️ Segurança e Acessibilidade

* Toda página protegida e toda Server Action validam sessão, turma e papel em `src/lib/dal.ts`. O `proxy.ts` é só a primeira barreira.
* O login por email e senha exige confirmar o email pelo link enviado. Um Google já verificado não se junta a uma conta local não verificada.
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
