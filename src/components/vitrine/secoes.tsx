import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleHelp,
  ClipboardList,
  Crown,
  GraduationCap,
  KeyRound,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  Vote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const REPOSITORIO = "https://github.com/luandersonarlindo/Formandos";

type Sessao = { logado: boolean };

function BotaoEntrar({ logado, tamanho = "default" }: Sessao & { tamanho?: "default" | "lg" }) {
  return (
    <Button asChild size={tamanho}>
      <Link href={logado ? "/dashboard" : "/entrar"}>
        {logado ? "Abrir meu painel" : "Entrar"}
        <ArrowRight aria-hidden />
      </Link>
    </Button>
  );
}

function Titulo({ selo, titulo, texto }: { selo: string; titulo: string; texto?: string }) {
  return (
    <div data-reveal className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium tracking-wide text-[var(--vitrine-a)] uppercase">{selo}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-balance md:text-4xl">{titulo}</h2>
      {texto && <p className="mt-3 text-muted-foreground text-pretty">{texto}</p>}
    </div>
  );
}

export function Cabecalho({ logado }: Sessao) {
  const links = [
    ["#recursos", "Recursos"],
    ["#como-funciona", "Como funciona"],
    ["#papeis", "Perfis"],
    ["#equipe", "Equipe"],
  ];
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Formandos <span aria-hidden>🎓</span>
        </Link>
        <nav aria-label="Seções da página" className="hidden items-center gap-6 text-sm md:flex">
          {links.map(([href, rotulo]) => (
            <a key={href} href={href} className="text-muted-foreground transition-colors hover:text-foreground">
              {rotulo}
            </a>
          ))}
        </nav>
        <BotaoEntrar logado={logado} />
      </div>
    </header>
  );
}

const PALAVRAS = [
  { t: "Organize", g: false },
  { t: "a", g: false },
  { t: "formatura", g: false },
  { t: "da", g: false },
  { t: "sua", g: true },
  { t: "turma,", g: true },
  { t: "do", g: false },
  { t: "convite", g: false },
  { t: "à", g: false },
  { t: "festa.", g: false },
];

const RESULTADO_EXEMPLO = [
  { rotulo: "Salão de festas", valor: 46 },
  { rotulo: "Chácara", valor: 27 },
  { rotulo: "Casa de eventos na praia", valor: 18 },
  { rotulo: "Outro", valor: 9 },
];

export function Hero({ logado }: Sessao) {
  return (
    <section className="vitrine-fundo-hero relative overflow-hidden">
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <span data-hero="selo" className="inline-flex">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" aria-hidden /> Gestão de formaturas e eventos
            </Badge>
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            {PALAVRAS.map((p, i) => (
              <span key={i}>
                <span
                  data-hero="palavra"
                  className={`inline-block ${p.g ? "vitrine-texto-gradiente" : ""}`}
                >
                  {p.t}
                </span>{" "}
              </span>
            ))}
          </h1>
          <p data-hero="texto" className="mt-5 max-w-xl text-lg text-muted-foreground text-pretty">
            Enquetes, dúvidas, tarefas e fornecedores da turma num só lugar. A comissão decide com dados, e os formandos participam de verdade.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span data-hero="botao">
              <BotaoEntrar logado={logado} tamanho="lg" />
            </span>
            <span data-hero="botao">
              <Button asChild size="lg" variant="outline">
                <a href="#recursos">Conhecer os recursos</a>
              </Button>
            </span>
          </div>
          <p data-hero="texto" className="mt-4 text-sm text-muted-foreground">
            Entre com a sua conta Google ou com email e senha.
          </p>
        </div>

        <div data-hero="painel" className="relative mx-auto w-full max-w-md" aria-label="Exemplo de relatório de enquete">
          {/* Enfeites ao redor do painel, longe do texto. */}
          <span aria-hidden data-flutuar className="absolute -top-8 -right-3 text-4xl">🎓</span>
          <span aria-hidden data-flutuar className="absolute top-1/2 -left-2 text-3xl md:-left-8">🎉</span>
          <span aria-hidden data-flutuar className="absolute -right-2 -bottom-8 text-4xl md:-right-6">🥂</span>
          <span aria-hidden data-flutuar className="absolute -bottom-6 left-6 text-2xl">✨</span>
          <div className="rounded-2xl border bg-card p-5 shadow-xl shadow-[color-mix(in_oklch,var(--vitrine-a)_18%,transparent)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Espaço do Evento</p>
                <p className="font-medium">Qual estilo de local a turma prefere?</p>
              </div>
              <BarChart3 className="size-5 text-[var(--vitrine-a)]" aria-hidden />
            </div>
            <ul className="mt-5 space-y-3">
              {RESULTADO_EXEMPLO.map((r, i) => (
                <li key={r.rotulo}>
                  <div className="flex justify-between text-sm">
                    <span>{r.rotulo}</span>
                    <span className="text-muted-foreground">{r.valor}%</span>
                  </div>
                  <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      data-barra={r.valor}
                      data-atraso={i * 120}
                      className="h-full rounded-full bg-gradient-to-r from-[var(--vitrine-a)] to-[var(--vitrine-b)]"
                      style={{ width: `${r.valor}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Exemplo ilustrativo do relatório automático.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const RECURSOS = [
  {
    icone: Vote,
    titulo: "Enquetes por categoria",
    texto: "Catálogo padrão com 8 categorias e perguntas de escolha única ou múltipla. Os votos são identificados e cada pessoa pode mudar o seu.",
  },
  {
    icone: BarChart3,
    titulo: "Relatório automático",
    texto: "Os votos viram um relatório consolidado com gráficos, para a comissão decidir com base no que a turma realmente prefere.",
  },
  {
    icone: CircleHelp,
    titulo: "Dúvidas com upvote",
    texto: "Os formandos enviam perguntas e votam nas mais relevantes. A comissão responde oficialmente e destaca o que importa.",
  },
  {
    icone: ClipboardList,
    titulo: "Dashboard e tarefas",
    texto: "Contagem regressiva, data, local e programação da festa, mais uma lista de tarefas com responsável, prazo e progresso.",
  },
  {
    icone: Store,
    titulo: "Vitrine de terceiros",
    texto: "Buffet, músicos, fotógrafos e equipe de apoio cadastrados pelo administrador, para a turma conhecer as opções.",
  },
  {
    icone: ShieldCheck,
    titulo: "Acesso por convite",
    texto: "Cada turma tem um código de convite privado. Administradores gerem membros, papéis e o que a turma enxerga.",
  },
];

export function Recursos() {
  return (
    <section id="recursos" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 md:py-24">
      <Titulo
        selo="Recursos"
        titulo="Tudo o que a comissão precisa, sem planilha perdida"
        texto="Cada área do app resolve uma parte da organização da formatura."
      />
      <div data-grupo className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECURSOS.map(({ icone: Icone, titulo, texto }) => (
          <article key={titulo} data-item className="vitrine-cartao rounded-xl border bg-card p-6">
            <span className="grid size-11 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--vitrine-a)_12%,transparent)] text-[var(--vitrine-a)]">
              <Icone className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold">{titulo}</h3>
            <p className="mt-2 text-sm text-muted-foreground text-pretty">{texto}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const PASSOS = [
  { icone: UserRound, titulo: "Entre", texto: "Use sua conta Google ou crie uma conta com email e senha. O email é confirmado por um link." },
  { icone: KeyRound, titulo: "Junte-se à turma", texto: "Informe o código de convite do administrador, ou crie uma turma nova e convide os colegas." },
  { icone: Vote, titulo: "Participe", texto: "Vote nas enquetes, envie dúvidas, dê upvote nas dos colegas e acompanhe as tarefas." },
  { icone: PartyPopper, titulo: "Decida e comemore", texto: "A comissão consulta o relatório, responde as dúvidas e fecha os detalhes da festa." },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-muted/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl px-4">
        <Titulo selo="Como funciona" titulo="Do primeiro acesso à festa em quatro passos" />
        <ol data-grupo className="relative mt-12 space-y-8 pl-14">
          <span aria-hidden className="absolute top-2 bottom-2 left-5 w-0.5 bg-border" />
          <span
            aria-hidden
            data-linha
            className="absolute top-2 bottom-2 left-5 w-0.5 bg-gradient-to-b from-[var(--vitrine-a)] to-[var(--vitrine-b)]"
          />
          {PASSOS.map(({ icone: Icone, titulo, texto }, i) => (
            <li key={titulo} data-item className="relative">
              <span className="absolute top-0 -left-14 grid size-10 place-items-center rounded-full border-2 bg-background text-sm font-semibold text-[var(--vitrine-a)]">
                {i + 1}
              </span>
              <div className="rounded-xl border bg-card p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Icone className="size-4 text-[var(--vitrine-a)]" aria-hidden /> {titulo}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground text-pretty">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const NUMEROS = [
  { valor: 8, rotulo: "categorias no catálogo padrão" },
  { valor: 16, rotulo: "perguntas prontas para votar" },
  { valor: 84, rotulo: "opções de resposta descritivas" },
  { valor: 3, rotulo: "níveis de acesso" },
];

const CATEGORIAS = [
  "Espaço do Evento",
  "Comida & Gastronomia",
  "Bebidas & Bar",
  "Música & Atrações",
  "Experiência Visual & Recordações",
  "Estrutura, Segurança & Recepção",
  "Traje & Identidade Visual",
  "Rituais & Pré-Eventos",
];

export function Catalogo() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
      <Titulo
        selo="Catálogo de enquetes"
        titulo="Perguntas que vão além do sim ou não"
        texto="A turma já começa com um catálogo pronto. O administrador ainda pode criar catálogos próprios."
      />
      <dl data-grupo className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {NUMEROS.map((n) => (
          <div key={n.rotulo} data-item className="rounded-xl border bg-card p-6 text-center">
            <dt className="order-2 mt-1 text-sm text-muted-foreground">{n.rotulo}</dt>
            <dd className="vitrine-texto-gradiente text-5xl font-semibold tabular-nums" data-contar={n.valor}>
              {n.valor}
            </dd>
          </div>
        ))}
      </dl>
      <ul data-grupo className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Categorias do catálogo padrão">
        {CATEGORIAS.map((c) => (
          <li key={c} data-item>
            <Badge variant="outline" className="px-3 py-1.5 text-sm">
              {c}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}

const PAPEIS = [
  {
    icone: UserRound,
    titulo: "Participante",
    itens: ["Vota nas enquetes e pode mudar o voto", "Envia dúvidas e dá upvote nas dos colegas", "Acompanha tarefas, programação e fornecedores"],
  },
  {
    icone: ShieldCheck,
    titulo: "Administrador da turma",
    itens: ["Gera o código de convite e gere os membros", "Responde e destaca dúvidas, define data e local", "Cria catálogos próprios e vê quem votou", "Pode administrar várias turmas"],
  },
  {
    icone: Crown,
    titulo: "Administrador master",
    itens: ["Enxerga todas as turmas e usuários", "Gere papéis e membros de qualquer turma", "Exclui turmas e contas, com confirmação"],
  },
];

export function Papeis() {
  return (
    <section id="papeis" className="scroll-mt-20 bg-muted/40 py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4">
        <Titulo selo="Perfis" titulo="Cada pessoa vê o que precisa" texto="Três níveis de acesso mantêm a organização e a segurança da plataforma." />
        <div data-grupo className="mt-12 grid gap-4 md:grid-cols-3">
          {PAPEIS.map(({ icone: Icone, titulo, itens }) => (
            <article key={titulo} data-item className="vitrine-cartao rounded-xl border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-lg bg-[color-mix(in_oklch,var(--vitrine-b)_14%,transparent)] text-[var(--vitrine-b)]">
                <Icone className="size-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-semibold">{titulo}</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {itens.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--vitrine-a)]" />
                    {i}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const TECNOLOGIAS = [
  "Next.js 16",
  "React 19",
  "PostgreSQL",
  "Better Auth",
  "Tailwind CSS 4",
  "shadcn/ui",
  "Recharts",
  "Zod",
  "Anime.js",
  "Vitest",
];

const EQUIPE = ["Luanderson Arlindo", "Luiz Orlando", "José Renato", "Vinícius"];

function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function Equipe() {
  return (
    <section id="equipe" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 md:py-24">
      <Titulo selo="Quem faz" titulo="Feito por estudantes, para turmas de verdade" />
      <ul data-grupo className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {EQUIPE.map((nome) => (
          <li key={nome} data-item className="vitrine-cartao rounded-xl border bg-card p-6 text-center">
            <span
              aria-hidden
              className="mx-auto grid size-14 place-items-center rounded-full bg-gradient-to-br from-[var(--vitrine-a)] to-[var(--vitrine-b)] text-lg font-semibold text-white"
            >
              {iniciais(nome)}
            </span>
            <p className="mt-3 text-sm font-medium">{nome}</p>
          </li>
        ))}
      </ul>

      <div data-reveal className="mt-14 text-center">
        <p className="text-sm font-medium text-muted-foreground">Tecnologias</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Tecnologias utilizadas">
          {TECNOLOGIAS.map((t) => (
            <li key={t}>
              <Badge variant="secondary" className="px-3 py-1">
                {t}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ChamadaFinal({ logado }: Sessao) {
  return (
    <section className="px-4 pb-16 md:pb-24">
      <div
        data-reveal
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[var(--vitrine-a)] to-[var(--vitrine-b)] px-6 py-14 text-center text-white"
      >
        <GraduationCap className="mx-auto size-9" aria-hidden />
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Pronto para organizar a formatura da sua turma?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/85 text-pretty">
          Entre, junte-se à sua turma com o código de convite e comece a decidir em conjunto.
        </p>
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <Link href={logado ? "/dashboard" : "/entrar"}>
            {logado ? "Abrir meu painel" : "Entrar agora"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function Rodape() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
        <p>Formandos 🎓 · Gestão administrativa de formaturas e eventos</p>
        <nav aria-label="Links do projeto" className="flex gap-5">
          <a href={REPOSITORIO} className="hover:text-foreground" rel="noreferrer" target="_blank">
            Código no GitHub
          </a>
          <a href={`${REPOSITORIO}/blob/main/docs/guia-de-estudo.md`} className="hover:text-foreground" rel="noreferrer" target="_blank">
            Guia do projeto
          </a>
        </nav>
      </div>
    </footer>
  );
}
