import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BotaoImprimir } from "@/components/features/botao-imprimir";
import { exigirSessao } from "@/lib/dal";
import { formatarDataHora } from "@/lib/datas";
import { getMeusDados } from "@/lib/usuarios";

export const metadata: Metadata = { title: "Meus dados" };

// "Meus dados" legível (ADR-0007): o mesmo conteúdo do JSON de /conta/exportar,
// em seções, com "Salvar como PDF". O JSON continua para levar a outro serviço.

const SECOES: [string, string][] = [
  ["turmas", "Turmas"],
  ["votos", "Votos"],
  ["presencas", "Presença"],
  ["duvidas", "Dúvidas que você enviou"],
  ["upvotes_dados", "Dúvidas que você apoiou"],
  ["tarefas_responsavel", "Tarefas sob sua responsabilidade"],
  ["avisos_criados", "Avisos que você publicou"],
  ["pagamentos", "Pagamentos"],
  ["planos_de_parcelas", "Planos de parcelas das suas turmas"],
  ["tentativas_convite", "Tentativas de código de convite"],
  ["sessoes", "Sessões (aparelhos conectados)"],
  ["auditoria", "Registro de ações feitas por você"],
];

// Nomes de coluna do banco para o leitor: "registrado_em" → "registrado em".
const rotulo = (chave: string) => chave.replace(/_/g, " ");

function valor(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (v instanceof Date) return formatarDataHora.format(v);
  if (typeof v === "boolean") return v ? "sim" : "não";
  if (typeof v === "object") return JSON.stringify(v);
  const texto = String(v);
  // Datas em texto ISO vindas do banco.
  if (/^\d{4}-\d{2}-\d{2}T/.test(texto)) {
    const d = new Date(texto);
    if (!Number.isNaN(d.getTime())) return formatarDataHora.format(d);
  }
  return texto;
}

export default async function MeusDadosPage() {
  const { user } = await exigirSessao();
  const dados = (await getMeusDados(user.id)) as unknown as Record<string, unknown>;
  const conta = (dados.conta ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto w-full max-w-3xl print:max-w-none">
      <Link
        href="/conta"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-4" aria-hidden /> Minha conta
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Gerado em {formatarDataHora.format(new Date())}</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Meus dados no Formandos</h1>
        </div>
        <BotaoImprimir />
      </div>
      <p className="mt-2 text-sm text-muted-foreground print:hidden">
        Tudo o que o Formandos guarda sobre você (LGPD, art. 18). Para levar a outro serviço, use o JSON em Minha
        conta.
      </p>

      <section className="mt-8">
        <h2 className="border-b pb-1 text-lg font-semibold">Conta</h2>
        <dl className="mt-3 grid gap-1 text-sm sm:grid-cols-[12rem_1fr]">
          {Object.entries(conta).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{rotulo(k)}</dt>
              <dd className="wrap-break-word">{valor(v)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {SECOES.map(([chave, titulo]) => {
        const linhas = (dados[chave] ?? []) as Record<string, unknown>[];
        return (
          <section key={chave} className="mt-8 break-inside-avoid-page">
            <h2 className="border-b pb-1 text-lg font-semibold">
              {titulo} <span className="text-sm font-normal text-muted-foreground">({linhas.length})</span>
            </h2>
            {linhas.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nada registrado.</p>
            ) : (
              <ul className="mt-2 divide-y text-sm">
                {linhas.map((l, i) => (
                  <li key={i} className="break-inside-avoid py-2">
                    <dl className="grid gap-x-3 sm:grid-cols-[12rem_1fr]">
                      {Object.entries(l).map(([k, v]) => (
                        <div key={k} className="contents">
                          <dt className="text-muted-foreground">{rotulo(k)}</dt>
                          <dd className="wrap-break-word">{valor(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
