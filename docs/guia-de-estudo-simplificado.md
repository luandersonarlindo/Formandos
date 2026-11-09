# Guia de Estudo Simplificado — App Formandos

Versão explicada do `docs/guia-de-estudo.md`. O conteúdo é o mesmo, mas aqui cada tecnologia vem com três respostas:

1. **O que é** (em palavras simples).
2. **Por que o projeto usa** (qual problema ela resolve aqui).
3. **Onde ver no código** (o arquivo real do projeto).

Serve para quem nunca usou Next.js, React, PostgreSQL, OAuth, SMTP etc. Não é preciso ler tudo de uma vez: use o **Glossário** (seção 1) como dicionário e volte a ele sempre que aparecer um termo novo.

> **Situação (07/11/2026):** o MVP está pronto e publicado (Vercel + banco Neon), incluindo a parte de LGPD. Este guia é material de estudo: ele explica o que já foi feito, para que qualquer pessoa do grupo entenda e consiga mexer.

> **Atenção:** o projeto usa **Next.js 16.3.8** e **React 19.2.8**. Muitos tutoriais da internet são de versões antigas e ensinam coisas que **não funcionam mais** aqui (por exemplo `middleware.ts`, pasta `pages/`, `getServerSideProps`). Na dúvida, leia a documentação que vem junto com o projeto, em `node_modules/next/dist/docs/01-app/`. Ela é exatamente da versão instalada.

---

## Sumário

1. Glossário (termos que aparecem no projeto)
2. Visão geral: como as peças se encaixam
3. As tecnologias, uma por uma (o que é e por que usamos)
4. Como o app está organizado (pastas e rotas)
5. Login, sessão e permissões, passo a passo
6. Banco de dados explicado
7. Formulários, validação e Server Actions
8. Regras de negócio do app
9. LGPD e segurança
10. Testes e qualidade
11. Roteiro de estudo
12. Erros comuns de quem está começando
13. Links úteis

---

## 1. Glossário

Termos em ordem alfabética. Cada um tem uma explicação curta e, quando cabe, onde aparece no projeto.

| Termo | O que significa |
|---|---|
| **API** | "Interface de programação". Um jeito de um programa conversar com outro. Na web, normalmente é uma URL que recebe e devolve dados (geralmente em JSON) em vez de uma página. |
| **App Router** | O sistema de rotas atual do Next.js: cada pasta dentro de `src/app/` vira um pedaço da URL. Substituiu o antigo "Pages Router" (pasta `pages/`). |
| **Auditoria (trilha de)** | Registro permanente de ações importantes (quem fez, o quê, quando). Serve para investigar problemas e para cumprir a LGPD. Tabela `auditoria`. |
| **Autenticação** | Descobrir **quem** é a pessoa (login). |
| **Autorização** | Decidir o que essa pessoa **pode fazer** (ex.: só admin apaga dúvida dos outros). |
| **Back-end / servidor** | A parte do sistema que roda num computador da hospedagem, não no celular do usuário. Tem acesso ao banco e aos segredos. |
| **Better Auth** | Biblioteca que cuida do login (Google e e-mail/senha), das sessões e da recuperação de senha. |
| **Breakpoint** | Largura de tela a partir da qual o layout muda. Ex.: `md` = 768px. Abaixo disso o menu lateral vira uma gaveta. |
| **Build** | Processo que transforma o código-fonte na versão otimizada que vai para produção (`npm run build`). |
| **Cache** | Guardar um resultado para não precisar calcular de novo. Ex.: `cache()` do React evita consultar a sessão duas vezes na mesma requisição. |
| **CDN / Hospedagem** | Onde o site fica no ar. Aqui é a **Vercel**. |
| **Client Component** | Componente React que roda **no navegador**. Necessário para cliques, estado e animações. Marcado com `"use client"` no topo do arquivo. |
| **Commit / Branch / Pull Request** | Conceitos do Git. Commit = um "salvamento" com descrição. Branch = linha de trabalho paralela. Pull Request (PR) = pedido para juntar uma branch na principal, com revisão dos colegas. |
| **Cookie** | Pequeno texto que o navegador guarda e reenvia ao site em toda requisição. É assim que o site "lembra" que você está logado. |
| **CSP** (Content Security Policy) | Cabeçalho de segurança que diz ao navegador de onde o site pode carregar scripts, imagens etc. Dificulta ataques de injeção de script. |
| **CSS / Tailwind** | CSS define a aparência (cores, tamanhos). Tailwind é um jeito de escrever CSS com classes prontas direto no HTML, como `p-4 text-sm`. |
| **Deploy** | Publicar a aplicação para que ela fique acessível na internet. |
| **DAL** (Data Access Layer) | "Camada de acesso a dados". Um arquivo central (`src/lib/dal.ts`) com funções que checam sessão e permissão. Todo acesso protegido passa por ele. |
| **DPO** | "Encarregado de dados" exigido pela LGPD. Pessoa/canal de contato para assuntos de dados pessoais. |
| **Driver** | Pacote que deixa o código conversar com o banco. Aqui é o `pg`. |
| **E2E** (End-to-End) | Teste "de ponta a ponta": abre um navegador de verdade e clica nas telas como um usuário faria. |
| **Endpoint** | Uma URL específica de uma API. |
| **`.env.local` / variável de ambiente** | Arquivo (e mecanismo) para guardar configurações e **segredos** (senha do banco, chave do Google) fora do código. **Nunca vai para o Git.** |
| **Front-end / cliente** | A parte que roda no navegador do usuário. Tudo que vai para o cliente pode ser visto por qualquer pessoa. |
| **Hash (de senha)** | Transformação de mão única: a senha vira um texto embaralhado que não pode ser revertido. O banco guarda o hash, nunca a senha. |
| **Hook** | Função especial do React que começa com `use` (`useState`, `useEffect`...). Só pode ser usada dentro de componentes. |
| **HSTS** | Cabeçalho que obriga o navegador a usar sempre HTTPS (conexão criptografada) com o site. |
| **HTTP / HTTPS** | Protocolo que o navegador usa para pedir páginas ao servidor. O "S" indica conexão criptografada. |
| **JSON** | Formato de texto para dados: `{ "nome": "Ana", "idade": 20 }`. |
| **JSX** | Sintaxe que mistura HTML dentro do JavaScript: `<h1>Olá {nome}</h1>`. É como o React descreve a tela. |
| **Layout** | Arquivo `layout.tsx`: a "moldura" (menu, cabeçalho) que envolve várias páginas. |
| **LGPD** | Lei Geral de Proteção de Dados (Lei 13.709/2018). Regras para coletar, guardar e apagar dados pessoais no Brasil. |
| **MCP** (Model Context Protocol) | Protocolo que dá a assistentes de IA (como o Claude Code) acesso a ferramentas externas, como os erros do `next dev`. |
| **Migração (migration)** | Script que cria ou altera tabelas do banco, para todos terem o mesmo esquema. |
| **MVP** | "Produto mínimo viável": a primeira versão com o essencial funcionando. |
| **Neon** | Serviço que hospeda PostgreSQL na nuvem. É o banco de produção. |
| **Node.js / npm** | Node roda JavaScript fora do navegador (no servidor). npm é o gerenciador de pacotes: `npm install`, `npm run dev`. |
| **OAuth** | Protocolo que permite "Entrar com Google": o Google confirma quem é a pessoa e avisa o nosso app, **sem** o app ver a senha do Google. |
| **ORM** | Biblioteca que gera SQL a partir de objetos (ex.: Prisma, Drizzle). **Este projeto não usa ORM**: escreve SQL direto. |
| **Pool (de conexões)** | Conjunto de conexões com o banco que ficam abertas e são reaproveitadas, em vez de abrir uma nova a cada consulta (abrir é lento). |
| **Props** | Os "parâmetros" de um componente React: `<Botao texto="Salvar" />`. |
| **Proxy** (`proxy.ts`) | Arquivo do Next 16 que roda **antes** de cada requisição. Aqui só redireciona para o login quem não tem cookie de sessão. Substitui o antigo `middleware.ts`. |
| **Query / consulta** | Um comando SQL enviado ao banco. |
| **Rate limit / throttle** | Limitar quantas vezes algo pode ser feito num intervalo (ex.: 10 códigos de convite errados a cada 15 minutos). Impede abuso e "chute" de códigos. |
| **Renderizar** | Gerar o HTML da tela a partir dos componentes. |
| **Rota** | Uma URL do site (`/dashboard`, `/duvidas`). |
| **Route group** | Pasta com parênteses, como `(app)`. Organiza arquivos e layouts **sem** aparecer na URL. |
| **Route Handler** | Arquivo `route.ts` que responde a uma URL com dados (não com página). Ex.: `/conta/exportar` devolve um JSON para download. |
| **RSC payload** | Os dados que o servidor envia ao navegador junto com a página. Tudo que estiver nele pode ser lido pelo usuário (por isso o orçamento só entra nele para admin). |
| **Schema (esquema)** | A estrutura do banco: tabelas, colunas e regras. Fica em `db/schema.sql`. Também se usa "schema" para as regras de validação do Zod. |
| **Seed** | Script que preenche o banco com dados iniciais. Aqui insere o catálogo padrão de enquetes (`db/seed.mjs`). |
| **Server Action** | Função que roda **no servidor**, marcada com `"use server"`, chamada diretamente por um formulário ou botão. É como o app grava dados (votar, enviar dúvida...). |
| **Server Component** | Componente React que roda **só no servidor**. É o padrão no Next. Pode consultar o banco direto e não envia seu código ao navegador. |
| **Sessão** | O "estar logado". O servidor cria uma sessão no login e o navegador guarda um cookie que aponta para ela. |
| **SGSI** | Sistema de Gestão de Segurança da Informação. Conjunto de políticas e documentos sobre segurança (inspirado na ISO 27001). Está em `docs/auditoria-direitos/`. |
| **shadcn/ui** | Coleção de componentes prontos (botão, cartão, menu) que são **copiados** para dentro do projeto. |
| **SMTP** | Protocolo padrão para **enviar e-mails** (ver seção 3.9). |
| **SQL** | Linguagem para consultar e alterar bancos relacionais: `select`, `insert`, `update`, `delete`. |
| **SQL injection** | Ataque em que o usuário digita um pedaço de SQL num campo e o sistema executa. Evitado com consultas parametrizadas (`$1`, `$2`). |
| **Transação** | Grupo de comandos no banco que acontecem **todos ou nenhum**. Se um falhar, tudo volta atrás (rollback). |
| **TypeScript** | JavaScript com tipos. O editor avisa erros antes de rodar, como passar texto onde se espera número. |
| **UUID** | Identificador aleatório e único, como `3f2a...-...`. Usado como `id` nas tabelas. Difícil de adivinhar. |
| **Vercel** | Empresa/plataforma que hospeda o app em produção. Criada pelos mesmos autores do Next.js. |
| **Zod** | Biblioteca de validação: descreve o formato esperado dos dados e rejeita o que não bate. |

---

## 2. Visão geral: como as peças se encaixam

Pense no app como um restaurante:

- **Navegador (cliente)** = o salão, onde o cliente vê o cardápio e faz o pedido.
- **Next.js no servidor** = a cozinha. Recebe o pedido, prepara e entrega o prato (a página).
- **PostgreSQL** = a despensa, onde tudo fica guardado.
- **Better Auth** = o porteiro, que confere quem entrou.
- **SMTP** = o carteiro, que leva e-mails para fora.

O caminho de uma ação comum, como **enviar uma dúvida**:

```
1. Usuário digita a dúvida e clica "Enviar" (navegador)
2. O <form> chama a Server Action enviarDuvida (servidor)
3. A action chama exigirMembroEditavel()  -> confere login, turma e se a turma não está arquivada
4. Zod valida o texto (5 a 500 caracteres)
5. O código grava no banco com uma consulta parametrizada, dentro de uma transação
6. revalidatePath("/duvidas") manda o Next refazer a lista
7. A tela mostra "Dúvida enviada."
```

Esse código está em `src/actions/duvidas.ts`. Quase toda escrita do app segue esse mesmo modelo de 7 passos. Entendendo esse arquivo, você entende a maior parte do projeto.

---

## 3. As tecnologias, uma por uma

Lista do `package.json` com o motivo de cada escolha.

### 3.1 TypeScript

**O que é:** JavaScript com tipos. Você declara "esta variável é texto" e o editor reclama se você tentar usá-la como número.

**Por que usamos:** são 4 pessoas mexendo no mesmo código. Os tipos funcionam como documentação que o computador confere: se alguém muda o formato de um dado, o TypeScript aponta todos os lugares que quebraram. O projeto usa `strict: true` (modo mais rigoroso).

**O mínimo para entender o projeto:**

```ts
// "type" descreve o formato de um objeto
type Membro = {
  usuarioId: string;
  papel: "admin" | "participante"; // só aceita um desses dois textos
  dataEvento: Date | null;         // pode ser data ou vazio
};
```

- `unknown` vs `any`: `any` desliga a verificação (evite). `unknown` obriga você a checar o tipo antes de usar (mais seguro).
- Rode `npm run typecheck` para verificar o projeto inteiro.

### 3.2 React 19

**O que é:** biblioteca para construir telas a partir de **componentes**, que são funções que devolvem JSX.

```tsx
function Saudacao({ nome }: { nome: string }) {
  return <h1>Olá, {nome}!</h1>;
}
```

**Por que usamos:** é o padrão de mercado e o Next.js é construído em cima dele.

**Conceitos básicos:**

- **Props:** dados que o componente recebe (`nome` acima).
- **Estado (`useState`):** dado que muda e redesenha a tela (ex.: menu aberto/fechado). Só em Client Components.
- **Efeitos (`useEffect`):** código que roda depois da tela aparecer (ex.: animação). **Não** use para buscar dados neste projeto (ver seção 12).
- **`key` em listas:** ao fazer `lista.map(...)`, cada item precisa de uma `key` única para o React saber qual item mudou.

**React Compiler (ativo no projeto):** uma ferramenta que otimiza os componentes automaticamente. Em tutoriais você verá muito `useMemo` e `useCallback` para "evitar redesenhar". Aqui você quase não precisa deles. Em troca, siga as regras do React: componentes não devem alterar variáveis de fora nem modificar o estado diretamente (use sempre a função `setAlgo`).

**Hooks do React 19 usados no projeto:**

- `useActionState`: liga um formulário a uma Server Action e guarda a resposta (erro ou sucesso) para mostrar na tela. Usado em `form-acao.tsx`.
- `useOptimistic`: mostra o resultado **antes** do servidor confirmar. No botão de upvote (`botao-upvote.tsx`) o número sobe na hora do clique; se o servidor falhar, volta.

### 3.3 Next.js 16 (App Router)

**O que é:** um framework em cima do React. O React sozinho só desenha telas. O Next acrescenta rotas (URLs), servidor, acesso a banco, build otimizado e deploy.

**Por que usamos:** com ele, front-end e back-end ficam **no mesmo projeto e na mesma linguagem**. Não é preciso criar uma API separada (em Express, por exemplo) e depois chamá-la pelo front. Para um grupo pequeno e iniciante, isso corta metade do trabalho.

**Conceitos que mais confundem (leia com calma):**

**a) Server Component é o padrão.**
Todo componente em `src/app/` roda no servidor, a menos que o arquivo comece com `"use client"`. Server Component pode fazer `await pool.query(...)` direto e o código dele **não vai** para o navegador (mais rápido e mais seguro). Mas ele não tem `onClick` nem `useState`.

Regra prática: comece sem `"use client"`. Só adicione no **menor** componente que precisa de interação (um botão, um gráfico), não na página inteira.

**b) Server Action substitui a API.**
Em vez de criar `POST /api/duvidas` e chamar com `fetch`, você escreve uma função com `"use server"` e coloca no formulário:

```tsx
<form action={enviarDuvida}> ... </form>
```

O Next cria a "ponte" sozinho. **Cuidado:** apesar de parecer uma função comum, qualquer pessoa pode chamá-la pela internet com dados inventados. Por isso, **toda** Server Action do projeto checa a permissão e valida os dados logo no começo.

**c) Rotas por pastas.**
`src/app/(app)/duvidas/page.tsx` vira a URL `/duvidas`. O `(app)` não aparece porque é um *route group* (só organiza).

**d) Parâmetros dinâmicos são Promise.**
Numa rota como `votacoes/[catalogoId]/page.tsx`, nesta versão é preciso `await`:

```tsx
export default async function Page({ params }: { params: Promise<{ catalogoId: string }> }) {
  const { catalogoId } = await params; // tutoriais antigos não têm esse await
}
```

**e) `proxy.ts` no lugar de `middleware.ts`.**
Roda antes de cada requisição. Aqui ele só confere "existe cookie de sessão?". Se não existe, manda para `/entrar`. Ele **não** é a segurança de verdade (ver seção 5).

**f) Arquivos especiais:** `layout.tsx` (moldura), `page.tsx` (a página), `loading.tsx` (tela de carregando), `error.tsx` (tela de erro), `not-found.tsx` (404), `route.ts` (devolve dados em vez de página).

**g) `revalidatePath`:** depois de gravar algo, diz ao Next "a página X mudou, monte de novo". Sem isso, a tela poderia mostrar a lista antiga.

**h) Cache Components / `"use cache"`:** recurso novo e opcional. O projeto **não** usa. Ignore por enquanto.

### 3.4 Tailwind CSS v4

**O que é:** em vez de escrever um arquivo CSS separado, você aplica classes prontas no próprio elemento:

```tsx
<div className="rounded-lg bg-card p-4 text-sm md:p-6">...</div>
```

`p-4` = espaçamento interno; `md:p-6` = espaçamento maior a partir de 768px de largura.

**Por que usamos:** é rápido, mantém o visual consistente (todos usam a mesma escala de tamanhos e cores) e evita CSS "esquecido" que ninguém sabe se ainda é usado.

**Diferença da v4:** as cores e tamanhos do tema ficam no `globals.css`, dentro de `@theme`, e não mais em `tailwind.config.js`. Tutoriais antigos mostram o arquivo de configuração; aqui ele não existe.

**Mobile first:** o público usa principalmente o celular. Escreva as classes pensando no celular e acrescente `md:` e `lg:` para telas maiores.

### 3.5 shadcn/ui, Radix UI e lucide-react

**O que é:** o shadcn/ui é uma coleção de componentes (Button, Card, Sidebar, DropdownMenu...). Diferente de uma biblioteca comum, ele **copia o código** para `src/components/ui/`. O código passa a ser nosso e pode ser alterado.

**Por que usamos:**
- Componentes bonitos e acessíveis sem começar do zero.
- Por baixo, ele usa o **Radix UI**, que já resolve o difícil: navegação por teclado, foco, leitores de tela.
- Como o código é nosso, dá para customizar (o projeto já alterou `button.tsx` e `input.tsx`).

Pacotes de apoio: `class-variance-authority` (variações de um componente, como botão "primário" e "perigo"), `clsx`/`tailwind-merge` (juntar classes sem conflito, via função `cn()` em `src/lib/utils.ts`) e `lucide-react` (ícones).

### 3.6 PostgreSQL e o pacote `pg`

**O que é:** PostgreSQL é um **banco de dados relacional**: guarda os dados em tabelas (linhas e colunas) ligadas entre si por chaves. `pg` é o driver que deixa o Node conversar com ele.

**Por que PostgreSQL:** é gratuito, muito confiável e garante regras direto no banco (ex.: "papel só pode ser admin ou participante"). Os dados do app são naturalmente relacionados (turma tem membros, membro tem votos), o que combina com o modelo relacional.

**Por que SQL puro (sem ORM):**
- O Better Auth já pede um `Pool` do `pg`, então o driver já estava no projeto.
- Escrever SQL obriga a aprender SQL, conhecimento que vale em qualquer emprego e linguagem.
- Menos uma camada "mágica" para depurar.

O preço é ter cuidado com segurança (seção 6.3) e escrever os tipos à mão.

Detalhes do banco na seção 6.

### 3.7 Better Auth

**O que é:** biblioteca de autenticação. Cuida do login, da criação de sessão, do hash da senha, da confirmação de e-mail e do "esqueci a senha".

**Por que usamos:**
- **Nunca** é uma boa ideia escrever login do zero: é fácil errar e deixar brechas.
- A alternativa mais conhecida, Auth.js (NextAuth) v5, ainda estava em versão beta. O Better Auth é estável.
- Funciona direto com o `pg` e com o `proxy.ts` do Next 16.

Onde ver: `src/lib/auth.ts` (configuração) e `src/app/api/auth/[...all]/route.ts` (a única rota de API "de verdade" do app, que o Better Auth usa por dentro). Detalhes na seção 5.

### 3.8 Login com Google (OAuth)

**O que é OAuth, em passos:**

```
1. Usuário clica "Entrar com Google"
2. O app manda o usuário para uma página do Google
3. O usuário faz login NO GOOGLE (o app nunca vê a senha)
4. O Google pergunta: "Permitir que Formandos veja seu nome e e-mail?"
5. O Google devolve o usuário para o app com um código
6. O app troca esse código pelos dados (nome, e-mail, foto) e cria a sessão
```

**Por que usamos:** quase todo estudante tem conta Google. Não precisa criar senha nova e o e-mail já vem confirmado.

**Custo:** gratuito. Limites:
- **Modo "Testing"** (projeto novo no Google Cloud): até 100 usuários de teste cadastrados à mão, e a autorização expira em 7 dias.
- **Modo "In production"**: qualquer conta Google entra. Se o app pedir **só** os escopos básicos (`openid`, `email`, `profile`), o Google não exige verificação e não há limite de usuários.

**Escopo** = permissão pedida ao Google. O app pede só os três básicos; pedir mais (ex.: acesso ao Drive) exigiria verificação do Google.

Se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` não estiverem configurados, o botão do Google some e só o e-mail e senha funciona.

### 3.9 E-mail: SMTP e Nodemailer

**O que é SMTP:** *Simple Mail Transfer Protocol*, o protocolo padrão da internet para **enviar** e-mails. Funciona como uma agência dos correios: o app entrega a mensagem a um **servidor SMTP** (do Gmail, por exemplo), e esse servidor se encarrega de levá-la até a caixa de entrada do destinatário.

Para usar um servidor SMTP, você precisa de:

| Variável | Para que serve | Exemplo com Gmail |
|---|---|---|
| `SMTP_HOST` | Endereço do servidor | `smtp.gmail.com` |
| `SMTP_PORT` | "Porta" (canal) de conexão | `465` (criptografado) ou `587` |
| `SMTP_USER` | Usuário da conta de envio | o e-mail da conta |
| `SMTP_PASS` | Senha da conta de envio | uma **senha de app** (ver abaixo) |
| `EMAIL_FROM` | Remetente que aparece no e-mail | `Formandos <conta@gmail.com>` |

**Senha de app (Gmail):** o Google não deixa usar a senha normal da conta em programas. É preciso ativar a verificação em duas etapas e gerar uma "senha de app", uma senha especial só para esse uso. Contas institucionais (da faculdade) podem ter isso bloqueado.

**Nodemailer:** pacote do Node que fala SMTP por nós. Em vez de implementar o protocolo, chamamos `transporter.sendMail({ to, subject, html })`.

**Por que o app precisa enviar e-mail:**
- **Confirmar o e-mail** no cadastro por senha (prova que o e-mail existe e é da pessoa).
- **"Esqueci a senha"**: envia o link para criar uma senha nova.
- **Boas-vindas** depois do cadastro.

**Sem SMTP configurado** (comum em desenvolvimento): o e-mail é apenas impresso no terminal onde roda o `npm run dev`. Dá para copiar o link de lá. Em produção, sem SMTP, ninguém consegue confirmar o cadastro por senha.

Onde ver: `src/lib/email.ts`.

### 3.10 Zod

**O que é:** biblioteca para descrever o formato esperado de um dado e verificar se o dado bate:

```ts
const esquemaDuvida = z.object({
  conteudo: z.string().trim().min(5, "Mínimo de 5 caracteres.").max(500),
});

const dados = esquemaDuvida.safeParse({ conteudo: texto });
if (!dados.success) return { erro: dados.error.issues[0].message };
// a partir daqui, dados.data.conteudo é garantidamente um texto de 5 a 500 caracteres
```

**Por que usamos:** tudo que chega de um formulário pode ter sido alterado pelo usuário (é fácil com as ferramentas do navegador). O atributo `required` ou `maxLength` no HTML ajuda o usuário honesto, mas não protege nada. O Zod valida **no servidor**, onde ninguém mexe. Também já devolve as mensagens de erro em português.

### 3.11 Recharts

**O que é:** biblioteca de gráficos feita para React.

**Por que usamos:** o relatório de votações mostra o resultado de cada enquete em barras. O Recharts se integra bem com React e é bem documentado.

**Como funciona aqui:**
1. A página (Server Component) faz a consulta SQL de contagem (`src/lib/relatorio.ts`).
2. Passa os números como props para `grafico-enquete.tsx`.
3. O gráfico é Client Component (`"use client"`), porque desenha no navegador e tem interação (tooltip).

Escolhas de design: barras horizontais ordenadas da mais votada para a menos votada (pizza com muitas fatias é difícil de ler) e um botão "Ver como tabela" para quem usa leitor de tela.

### 3.12 Outras bibliotecas

| Pacote | O que faz | Por que está no projeto |
|---|---|---|
| `server-only` | Gera erro de build se um arquivo de servidor for importado por um Client Component | Impede que o código do `dal.ts` (com acesso ao banco) vá parar no navegador por engano |
| `disposable-domains` | Lista de domínios de e-mail temporário (tipo "10minutemail") | Bloquear cadastros falsos/descartáveis |
| `animejs` | Animações | Animações da vitrine (página inicial) |
| `tw-animate-css` | Animações prontas em classes Tailwind | Abrir/fechar menus e gavetas do shadcn |
| `vitest` | Roda testes automatizados | `npm test` (seção 10) |
| `babel-plugin-react-compiler` | O React Compiler | Otimização automática (seção 3.2) |

### 3.13 Vercel e Neon (produção)

**Vercel:** plataforma que hospeda o app. Cada `git push` na branch principal pode gerar um novo deploy automático. Feita pelos criadores do Next, então tudo funciona sem configuração extra.

**Neon:** PostgreSQL na nuvem, com plano gratuito. A Vercel não guarda banco, então o banco de produção fica no Neon.

**Por que esse par:** ambos têm plano gratuito suficiente para o projeto e exigem pouca configuração. Antes de cada build, o `prebuild` roda `db/migrate.mjs` para criar/atualizar as tabelas no Neon.

O passo a passo está no README, seção "Deploy na Vercel com o Neon".

---

## 4. Como o app está organizado

### 4.1 Pastas principais

```
src/
├─ app/          Rotas (cada pasta = pedaço da URL)
├─ actions/      Server Actions: tudo que GRAVA dados (votar, enviar dúvida...)
├─ lib/          Funções de apoio: leitura do banco, regras, DAL, e-mail
├─ components/   Componentes reutilizáveis (ui/ = shadcn)
└─ proxy.ts      Checagem rápida de login antes de cada requisição
db/
├─ schema.sql    Estrutura das tabelas do app
├─ migrate.mjs   Cria tabelas do Better Auth + schema.sql
└─ seed.mjs      Insere o catálogo padrão de enquetes
```

Regra simples de onde colocar código:
- **Lê** dados do banco? `src/lib/`.
- **Grava** dados? `src/actions/`.
- É **tela**? `src/app/`.

### 4.2 Mapa de rotas

Os grupos entre parênteses definem **quem pode entrar**:

| Grupo | Exemplo de rota | Precisa de login | Precisa de turma | Precisa ser admin |
|---|---|---|---|---|
| `(publico)` | `/`, `/entrar`, `/privacidade` | não | não | não |
| `(onboarding)` | `/convite` | sim | não (quem já tem turma vai para `/dashboard`) | não |
| `(app)` | `/dashboard`, `/votacoes`, `/duvidas` | sim | sim | não |
| `(admin)` | `/admin/membros`, `/admin/votacoes` | sim | sim | **sim** |
| `(conta)` | `/conta` | sim | não | não |
| `(master)` | `/master` | sim | não | **master** (e-mail listado em `ADMIN_MASTER_EMAILS`) |

Lista completa das rotas:

```
/                                  Vitrine do projeto
/entrar                            Login (Google ou e-mail e senha)
/esqueci-senha, /redefinir-senha   Recuperar ou criar senha
/convite                           Digitar código de convite ou criar turma
/dashboard                         Resumo da turma, evento, programação
/tarefas                           Tarefas da comissão
/votacoes                          Catálogos de enquetes
/votacoes/[catalogoId]             Votar nas enquetes de um catálogo
/votacoes/relatorio                Gráficos com o resultado
/duvidas                           Perguntas com upvote e moderação
/terceiros                         Fornecedores
/admin/membros                     Membros e código de convite
/admin/turma                       Arquivar ou excluir a turma
/admin/presenca                    Quem confirmou presença
/admin/votacoes/...                Criar e editar catálogos, ver quem votou
/conta                             Dados pessoais, exportar, excluir conta
/conta/exportar                    Download dos dados em JSON (LGPD)
/privacidade, /termos              Documentos legais
```

**Por que não tem `[turmaId]` na URL?** O servidor descobre a turma pela pessoa logada (e por um cookie de "turma ativa", sempre conferido no banco). Isso deixa as URLs simples e impede um truque comum: trocar o id na URL para espiar outra turma.

---

## 5. Login, sessão e permissões, passo a passo

### 5.1 Três conceitos diferentes

1. **Autenticação:** quem é você? (login com Google ou senha)
2. **Sessão:** como o site lembra de você nas próximas páginas? (cookie)
3. **Autorização:** o que você pode fazer? (papel `admin` ou `participante` **naquela turma**, ou `master` na plataforma toda)

### 5.2 As duas "portas" de segurança

```
Requisição chega
   │
   ▼
proxy.ts ──── sem cookie? ──► redireciona para /entrar
   │ (tem cookie)
   ▼
Página / Server Action
   │
   ▼
dal.ts: exigirSessao(), exigirMembro(), exigirAdmin()...
   └── confere NO BANCO se a sessão é válida e qual o papel na turma
```

**Por que duas portas?** O `proxy.ts` só olha se o cookie **existe**. Ele não confere se é válido (um cookie falso passaria). Ele serve para mandar rápido o visitante não logado para o login. A segurança de verdade está no `dal.ts`, chamado **em toda página protegida e toda Server Action**.

Trecho real de `src/lib/dal.ts`:

```ts
import "server-only"; // garante que este arquivo nunca vai para o navegador

export const getSessao = cache(async () =>
  auth.api.getSession({ headers: await headers() }), // valida no banco
);

export async function exigirSessao() {
  const sessao = await getSessao();
  if (!sessao) redirect("/entrar");
  return sessao;
}
```

`cache()` faz com que, se várias partes da mesma página chamarem `getSessao()`, o banco seja consultado só uma vez.

### 5.3 Esconder botão não é segurança

Mesmo que o botão "Apagar" só apareça para admin, um participante pode chamar a Server Action manualmente. Por isso a checagem `exigirAdmin()` fica **dentro** da action. O botão escondido é só conveniência visual.

### 5.4 Login por e-mail e senha

Alternativa para quando o Google não está disponível. É uma senha **do app**, não a do Google.

- **Hash:** o Better Auth guarda só o hash da senha. Nem quem tem acesso ao banco descobre a senha.
- **Confirmação:** depois do cadastro, chega um link por e-mail (via SMTP). Sem clicar, o login é recusado com o erro `EMAIL_NOT_VERIFIED`. Configurado com `requireEmailVerification: true` em `src/lib/auth.ts`.
- **Conta Google que quer senha:** usa "Esqueci a senha". O link cria a senha **na mesma conta**. No banco, a tabela `account` passa a ter duas linhas para o mesmo usuário: uma `google` e uma `credential`.
- **Proteção contra roubo de conta:** uma conta por senha que ainda não confirmou o e-mail **não** é unida a uma conta Google com o mesmo e-mail. Sem essa regra, alguém poderia cadastrar o e-mail de outra pessoa e "herdar" a conta dela.

### 5.5 Variáveis de ambiente do login

| Variável | O que é |
|---|---|
| `BETTER_AUTH_SECRET` | Chave secreta (mínimo 32 caracteres) usada para assinar os cookies. Se vazar, alguém pode forjar sessões. |
| `BETTER_AUTH_URL` | Endereço do site (ex.: `http://localhost:3000`). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciais do app no Google Cloud (opcionais). |
| `SMTP_*`, `EMAIL_FROM` | Envio de e-mail (seção 3.9). |
| `ADMIN_MASTER_EMAILS` | E-mails de quem administra a plataforma inteira. |

Todas ficam no `.env.local`, que **nunca** vai para o Git.

### 5.6 Papéis

- **Participante:** vota, envia dúvidas, confirma presença.
- **Admin da turma:** tudo do participante e mais: gerencia membros, catálogos, evento, tarefas, fornecedores, modera dúvidas. O papel vale **por turma** (por isso fica na tabela `membros`, não na tabela de usuários).
- **Master:** gestor da plataforma inteira (`/master`). Não é um papel salvo no banco; vem da variável `ADMIN_MASTER_EMAILS` e só vale com e-mail confirmado. Toda action em `src/actions/master.ts` começa com `exigirMaster()`.

### 5.7 Código de convite

- 8 caracteres gerados com `randomInt` do módulo `node:crypto` (`src/lib/convite.ts`). É aleatoriedade criptográfica, difícil de adivinhar. `Math.random()` **não** serve para isso, porque seus resultados podem ser previstos.
- No máximo 10 tentativas erradas a cada 15 minutos, por usuário e por IP. Sem esse limite, um robô poderia testar milhões de códigos.

---

## 6. Banco de dados explicado

### 6.1 Conceitos básicos

- **Tabela:** como uma planilha. Cada **linha** é um registro, cada **coluna** é um campo.
- **Chave primária (PK):** coluna (ou conjunto) que identifica a linha de forma única. Ex.: `id`.
- **Chave estrangeira (FK):** coluna que aponta para a PK de outra tabela. Ex.: `membros.turma_id` aponta para `turmas.id`. O banco impede apontar para uma turma que não existe.
- **`UNIQUE`:** proíbe valores repetidos. Ex.: dois convites com o mesmo código.
- **`CHECK`:** regra simples. Ex.: `papel CHECK (papel in ('admin','participante'))`.
- **Índice:** "sumário" que acelera buscas numa coluna.
- **`JOIN`:** juntar dados de duas tabelas numa consulta.
- **`GROUP BY` + `count`:** agrupar e contar (usado no relatório de votos).
- **`INSERT ... ON CONFLICT`:** "insira; se já existir, faça outra coisa". Útil para não duplicar.

**Por que regras no banco e não só no código?** Se um bug no código tentar gravar algo errado, o banco recusa. É uma segunda rede de proteção.

### 6.2 A conexão (`src/lib/db.ts`)

```ts
export const pool = globalForDb.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX ?? 5),  // no máximo 5 conexões abertas
  statement_timeout: 8000,                     // consulta que passar de 8s é cancelada
});
```

- **Por que um Pool:** abrir conexão com o banco é lento. O pool mantém algumas abertas e reaproveita.
- **Por que `globalThis`:** em desenvolvimento, o Next recarrega os arquivos a cada alteração. Sem isso, cada recarga abriria um pool novo e esgotaria as conexões.
- **`transacao(fn)`:** abre uma transação, roda `fn` e faz `commit`. Se algo der erro, faz `rollback` (desfaz tudo).

Exemplo de quando a transação é necessária: **mudar o voto**. São dois passos (apagar o voto antigo e inserir o novo). Sem transação, uma falha no meio deixaria a pessoa sem voto nenhum.

### 6.3 Consultas parametrizadas (contra SQL injection)

**Errado (nunca faça):**

```ts
pool.query(`select * from turmas where codigo = '${codigoDigitado}'`);
```

Se alguém digitar `' or '1'='1`, a consulta passa a devolver **todas** as turmas.

**Certo (como o projeto faz):**

```ts
pool.query("select * from turmas where codigo_convite = $1", [codigoDigitado]);
```

O `$1` é preenchido pelo driver de forma segura: o texto digitado é tratado sempre como **dado**, nunca como comando.

### 6.4 As tabelas

**Do Better Auth** (criadas por `npm run db:migrate`):

| Tabela | Guarda |
|---|---|
| `usuarios` | Conta: nome, e-mail, foto, se o e-mail foi confirmado, data do aceite dos termos. As colunas estão em camelCase (`"emailVerified"`), por isso precisam de aspas no SQL. |
| `session` | Sessões ativas (logins). |
| `account` | Formas de login de cada usuário (`google`, `credential`). |
| `verification` | Tokens temporários (confirmar e-mail, redefinir senha). |

**Do app** (`db/schema.sql`):

| Tabela | Guarda | Observação |
|---|---|---|
| `turmas` | Dados da turma e do evento | `arquivada_em` preenchido = turma só leitura |
| `membros` | Quem está em qual turma e com qual papel | PK `(turma_id, usuario_id)` |
| `tentativas_convite` | Códigos de convite errados | Para o limite de tentativas |
| `catalogos` | Conjuntos de enquetes | `turma_id` vazio = catálogo padrão, de todas as turmas |
| `categorias` | Grupos de enquetes dentro do catálogo | Têm `ordem` |
| `enquetes` | As perguntas | `tipo`: `unica` ou `multipla` |
| `opcoes` | As respostas possíveis | `exclusiva`: marcar desmarca as outras |
| `votos` | Quem votou em qual opção | PK `(opcao_id, usuario_id)`: um voto por opção por pessoa |
| `decisoes` | Opção vencedora fixada pela comissão | Enquete decidida não aceita votos |
| `avisos` | Mural de recados | |
| `presencas` | Vou / talvez / não + acompanhantes | |
| `duvidas` | Perguntas da turma | `respondida` e `destaque` são independentes |
| `duvida_upvotes` | Quem deu upvote em qual dúvida | Um por pessoa |
| `tarefas` | Tarefas da comissão | Status: pendente, em andamento, concluída |
| `fornecedores` | Terceiros (buffet, foto...) | `valor_orcado` e `status` só para admin |
| `programacao` | Horários da festa | |
| `auditoria` | Registro de ações sensíveis | Nunca editada nem apagada; guardada por 5 anos |
| `throttle` | Contador para limitar ações repetidas | Linhas com mais de 1 dia são limpas |

**Por que a tabela `membros` em vez de uma coluna `turma_id` em `usuarios`?** Porque o papel (admin/participante) é **por turma**. E porque, quando o grupo decidiu que admins podem estar em várias turmas, bastou remover uma restrição `UNIQUE`. Se a turma estivesse dentro de `usuarios`, seria preciso reestruturar o banco.

### 6.5 Comandos

| Comando | O que faz | Quando usar |
|---|---|---|
| `npm run db:migrate` | Cria as tabelas do Better Auth e roda `db/schema.sql` | Primeira vez; também roda sozinho antes do build na Vercel |
| `npm run db:schema` | Só roda `db/schema.sql` | Depois de alterar o esquema, em desenvolvimento |
| `npm run db:seed` | Insere o catálogo padrão (10 categorias, 23 enquetes, 129 opções) a partir de `docs/catalogos-modelo/catalogo-enquetes.md` | Banco novo. Rodar de novo só acrescenta o que falta. `-- --dry` só mostra o que faria |

Os comandos leem o `.env.local`. Se `DATABASE_URL` estiver definida no terminal, ela tem prioridade (útil para testar num banco descartável).

**Limite do `schema.sql`:** ele usa `create table if not exists`, então pode rodar várias vezes. Mas **não altera** uma tabela que já existe. Para mudanças em tabelas existentes, use `alter table ... add column if not exists` (como o projeto já faz em alguns pontos) ou, no futuro, arquivos de migração numerados (`001_...sql`, `002_...sql`).

**Em desenvolvimento:** cada pessoa roda o PostgreSQL instalado no próprio computador. Não há Docker.

---

## 7. Formulários, validação e Server Actions

Padrão de toda Server Action do projeto (exemplo real resumido de `src/actions/duvidas.ts`):

```ts
"use server";

export async function enviarDuvida(_estado: EstadoForm, formData: FormData) {
  // 1. Quem é e o que pode fazer? (DAL)
  const membro = await exigirMembroEditavel();

  // 2. Os dados estão no formato certo? (Zod)
  const dados = esquemaDuvida.safeParse({ conteudo: formData.get("conteudo") });
  if (!dados.success) return { erro: dados.error.issues[0].message };

  // 3. Grava no banco (SQL parametrizado, em transação, com limite de frequência)
  await transacao(async (db) => {
    await db.query(
      "insert into duvidas (turma_id, autor_id, conteudo) values ($1, $2, $3)",
      [membro.turmaId, membro.usuarioId, dados.data.conteudo],
    );
  });

  // 4. Atualiza a tela
  revalidatePath("/duvidas");
  return { ok: "Dúvida enviada." };
}
```

Repare: a `turmaId` vem de `membro` (do servidor), **não** do formulário. Assim o usuário não consegue trocar o id para gravar em outra turma.

**Do lado da tela:**
- `FormAcao` (`form-acao.tsx`) é um formulário genérico que usa `useActionState` para mostrar a mensagem de erro ou sucesso que a action devolveu. Evita repetir esse código em cada tela.
- `useOptimistic` no upvote faz o número mudar na hora do clique.

Leitura recomendada: `node_modules/next/dist/docs/01-app/02-guides/forms.md`.

---

## 8. Regras de negócio do app

### Votações
- **Enquete de seleção única:** um voto por pessoa. Votar de novo troca o voto.
- **Seleção múltipla:** várias opções. Uma opção **exclusiva** (ex.: "Nenhum") desmarca as outras.
- **Mudar voto:** apaga os votos antigos da pessoa naquela enquete e insere os novos, numa transação.
- **Voto identificado:** o admin vê quem votou em cada opção. Os participantes veem só os totais. A tela de votação avisa isso.
- **Decisão:** o admin pode fixar a opção vencedora. Depois disso a enquete não aceita votos. "Reabrir" apaga a decisão.

### Catálogos
- **Padrão:** 10 categorias e 23 perguntas, igual para todas as turmas, só leitura. Vem do seed. Cada turma pode ligar ou desligar (`usar_catalogo_padrao`); desligar não apaga nada, só esconde.
- **Personalizado:** criado pelo admin para a turma dele, do zero ou a partir de um **modelo** (Ensino Médio, Educação Infantil e ABC, Pós-graduação e MBA, Área da Saúde, em `docs/catalogos-modelo/`).
- **Editar pergunta com votos:** o tipo (única/múltipla) só muda enquanto não houver votos, e uma opção com votos não é removida. Assim, editar nunca apaga voto de ninguém.

### Dúvidas
- Upvote: um por pessoa, clicar de novo remove.
- Ordem: as em destaque primeiro, depois por número de votos.
- O autor edita ou apaga a própria dúvida. O admin responde, destaca, reabre e apaga qualquer uma.

### Turmas
- Quem cria a turma vira admin. Quem entra por código vira participante.
- Participante fica em uma turma por vez. Admin pode estar em várias (seletor na barra lateral).
- O último admin não pode sair enquanto houver outros membros: precisa promover alguém antes. Se o último membro sai, a turma é apagada.
- Sair ou ser removido apaga, numa transação, os votos, a presença, as dúvidas e os upvotes da pessoa **naquela turma**. Tarefas e avisos ficam sem autor.
- **Turma arquivada:** vira só leitura. As actions recusam alterações (via `exigirMembroEditavel` e `exigirAdminEditavel`), e a tela desativa os campos.

### Outros
- **Presença:** vou / talvez / não. Só "vou" conta acompanhantes, até o limite definido pelo admin (0 a 20, padrão 5).
- **Fornecedores:** valor orçado e status só aparecem para admin. Para participantes, esses campos nem são buscados no banco, então não chegam ao navegador de jeito nenhum.
- **Tarefas:** admin cria, edita e apaga. O responsável só muda o andamento da própria tarefa.

---

## 9. LGPD e segurança

### 9.1 O que a LGPD exige e como o app atende

| Exigência | O que significa | Como o app faz |
|---|---|---|
| Base legal / consentimento | Precisa haver um motivo legal para guardar os dados | Cadastro por senha exige marcar "Aceito os Termos e a Política de Privacidade"; a data fica em `usuarios.consentimento_em` |
| Transparência | A pessoa precisa saber o que é coletado | Páginas `/privacidade` e `/termos` |
| Acesso e portabilidade | A pessoa pode pedir seus dados | `/conta/exportar` baixa tudo em JSON |
| Correção | A pessoa pode corrigir dados | `/conta` permite mudar o nome |
| Eliminação | A pessoa pode pedir para apagar | Botão de excluir conta em `/conta` |
| Encarregado (DPO) | Canal de contato | Informado em `/conta` |

### 9.2 Outras proteções

- **E-mail descartável bloqueado** (`src/lib/email-validacao.ts`): impede cadastros com e-mails temporários e sugere correção de erros comuns, como `gmial.com`.
- **Trilha de auditoria** (`src/lib/auditoria.ts`): registra troca de papel, remoção de membro, exclusão de conta e de turma. Só o servidor escreve; nada é editado ou apagado.
- **Limite de frequência** (`src/lib/throttle.ts`): impede que alguém dispare uma ação milhares de vezes.
- **Cabeçalhos de segurança** (HSTS, CSP) configurados no Next.
- **Healthcheck** `/api/healthz`: URL que a hospedagem consulta para saber se o app está vivo.

### 9.3 Documentação do SGSI

Em `docs/auditoria-direitos/`: `PSI.md` (política de segurança), `SoA.md` (93 controles da ISO 27001 e se cada um se aplica), `riscos.md` (matriz probabilidade × impacto) e `auditoria.md`.

---

## 10. Testes e qualidade

### 10.1 Testes unitários (Vitest)

**O que é teste unitário:** código que testa uma função isolada. Ex.: "dado este código de convite, a função de validação aceita?".

**Por que Vitest:** é rápido, funciona com TypeScript sem configuração e tem a mesma sintaxe do Jest (o mais conhecido), então tutoriais de Jest servem.

```bash
npm test   # 14 arquivos, 158 testes, todos em src/lib/*.test.ts
```

Os testes ficam ao lado do arquivo testado: `convite.ts` e `convite.test.ts`.

### 10.2 Testes de ponta a ponta (E2E)

`scripts/teste/fluxos.mjs` abre o Chrome de verdade e executa 73 passos (criar turma, convidar, votar, etc.). Instruções em `scripts/teste/README.md`.

### 10.3 Git em equipe

- Uma **branch** por funcionalidade, juntada por **Pull Request** com revisão de um colega.
- Commits pequenos, no padrão *Conventional Commits*: `feat:` (funcionalidade nova), `fix:` (correção), `docs:` (documentação).
- **Nunca** comite `.env.local` nem senhas. Use um `.env.example` sem valores secretos para mostrar quais variáveis existem.

### 10.4 Pendências

- **ESLint** (ferramenta que aponta código suspeito) e **Prettier** (formata o código automaticamente) ainda não foram adicionados. Vale adicionar.
- `.mcp.json` com o `next-devtools-mcp` ainda não foi criado.

---

## 11. Roteiro de estudo

Cada etapa termina com algo visível funcionando. Todas já foram feitas no projeto; use o arquivo indicado para estudar como ficou.

| Etapa | Estude | Veja no projeto |
|---|---|---|
| 0. Base | HTML, CSS, JavaScript moderno (`async/await`, `map`, desestruturação), TypeScript básico, React básico | `npm run dev` e altere um texto em `src/app/(publico)/page.tsx` |
| 1. Layout | Layouts, páginas, `Link`, route groups, shadcn | `src/app/(app)/layout.tsx` |
| 2. Banco | SQL, tabelas, chaves, Pool | `db/schema.sql`, `src/lib/db.ts` |
| 3. Login | OAuth, sessões, cookies, Better Auth, proxy | `src/lib/auth.ts`, `src/proxy.ts`, `src/lib/dal.ts` |
| 4. Turmas e convite | Autorização por papel, transações | `src/actions/turmas.ts`, `src/lib/vinculos.ts` |
| 5. Votação | Server Actions, Zod, transações | `src/actions/votos.ts` |
| 6. Relatório | `GROUP BY`, `left join`, Recharts | `src/lib/relatorio.ts`, `grafico-enquete.tsx` |
| 7. Dúvidas | `useOptimistic`, `revalidatePath` | `src/actions/duvidas.ts`, `botao-upvote.tsx` |
| 8. Admin | Checagem de admin em toda action | `src/actions/admin.ts`, `src/actions/catalogos.ts` |
| 9. Acabamento | `error.tsx`, `loading.tsx`, acessibilidade, testes | `src/app/error.tsx`, `src/lib/*.test.ts` |
| 10. Deploy | Variáveis de ambiente, Vercel, Neon | README, seção "Deploy na Vercel com o Neon" |
| 11. LGPD | Consentimento, exportação, auditoria | `src/app/(conta)/conta/`, `src/lib/auditoria.ts` |

Documentação do Next para ler, em ordem, em `node_modules/next/dist/docs/01-app/01-getting-started/`:

| Arquivo | Assunto |
|---|---|
| `02-project-structure.md` | Estrutura de pastas |
| `03-layouts-and-pages.md` | Layouts e páginas |
| `04-linking-and-navigating.md` | `Link` e navegação |
| `05-server-and-client-components.md` | **Server vs Client (o mais importante)** |
| `06-fetching-data.md` | Buscar dados |
| `07-mutating-data.md` | **Server Actions** |
| `08-caching.md`, `09-revalidating.md` | Cache e `revalidatePath` |
| `10-error-handling.md` | Telas de erro |
| `11-css.md` | CSS e Tailwind |
| `15-route-handlers.md` | `route.ts` |
| `16-proxy.md` | `proxy.ts` |

---

## 12. Erros comuns de quem está começando

| Erro | Por que é ruim | O que fazer |
|---|---|---|
| Colocar `"use client"` em tudo | Todo o código vai para o navegador; perde acesso direto ao banco e a página fica mais pesada | Só no menor componente que precisa de clique ou estado |
| `useEffect` + `fetch` para carregar dados | A tela aparece vazia, depois pisca com os dados; exige criar uma API | Buscar no Server Component com `await` |
| Esquecer `await params` | O valor vem como Promise e o código quebra | `const { id } = await params` |
| Esconder botão para proteger função de admin | A action pode ser chamada direto, sem o botão | Checar `exigirAdmin()` dentro da action |
| Montar SQL juntando textos | SQL injection | Usar `$1`, `$2` e a lista de valores |
| Comitar `.env.local` | Segredos expostos no GitHub para sempre (o histórico guarda) | Conferir o `.gitignore`; se vazou, trocar as chaves |
| Copiar tutorial do Next 12 a 14 | `pages/`, `middleware.ts`, `getServerSideProps` não se aplicam | Consultar a doc local em `node_modules/next/dist/docs/` |
| Fazer todo o banco e todas as telas antes de testar | Erros aparecem todos juntos no fim | Fatias pequenas: uma tela + sua tabela + sua action, e testar |
| Confiar no `proxy.ts` como segurança | Ele só vê se o cookie existe, não se é válido | Usar sempre as funções do `dal.ts` |
| Pegar `turmaId` do formulário | O usuário pode trocar o valor e mexer em outra turma | Pegar a turma de `exigirMembro()` |

---

## 13. Links úteis

- React (tutorial oficial, em inglês): https://react.dev/learn
- Next.js (versão exata do projeto): `node_modules/next/dist/docs/`
- TypeScript: https://www.typescriptlang.org/docs/handbook/
- Tailwind v4: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- PostgreSQL (tutorial): https://www.postgresql.org/docs/current/tutorial.html
- Better Auth: https://www.better-auth.com/docs
- Nodemailer: https://nodemailer.com
- Recharts: https://recharts.org
- Zod: https://zod.dev
- Vitest: https://vitest.dev
- LGPD (texto da lei): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm

Para o restante das decisões do grupo e os detalhes técnicos completos, veja o guia original: `docs/guia-de-estudo.md`.
