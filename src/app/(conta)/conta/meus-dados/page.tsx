import type { Metadata } from "next";
import { BotaoImprimir } from "@/components/features/botao-imprimir";
import { LinkVoltar } from "@/components/features/link-voltar";
import { exigirSessao } from "@/lib/dal";
import { formatarDataHora, formatarPrazo } from "@/lib/datas";
import { getMeusDados } from "@/lib/usuarios";

export const metadata: Metadata = { title: "Meus dados" };

// "Meus dados" legível (ADR-0007): o mesmo conteúdo do JSON de /conta/exportar,
// em seções, com "Salvar como PDF". O JSON continua para levar a outro serviço.
// Nada aqui se recolhe: imprimir é o objetivo da página, e seção fechada não
// sairia no PDF.

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

// Nome de coluna do banco → rótulo para quem lê. Chave nova sem rótulo aqui
// ainda aparece, com o "_" trocado por espaço.
const ROTULOS: Record<string, string> = {
  nome: "Nome",
  email: "Email",
  imagem: "Foto",
  email_verificado: "Email confirmado",
  criada_em: "Criada em",
  criado_em: "Criado em",
  consentimento_em: "Aceite dos termos em",
  receber_emails: "Recebe emails da turma",
  turma: "Turma",
  papel: "Papel",
  desde: "Na turma desde",
  categoria: "Categoria",
  pergunta: "Pergunta",
  opcao: "Opção escolhida",
  votado_em: "Votado em",
  status: "Situação",
  acompanhantes: "Acompanhantes",
  observacao: "Observação",
  nomesDosAcompanhantes: "Nomes dos acompanhantes",
  conteudo: "Texto",
  resposta: "Resposta",
  respondida: "Respondida",
  destaque: "Em destaque",
  duvida: "Dúvida",
  autor: "Quem enviou",
  titulo: "Título",
  descricao: "Descrição",
  prazo: "Prazo",
  tipo: "Tipo",
  valor: "Valor",
  pago_em: "Pago em",
  forma: "Forma de pagamento",
  pago_por: "Quem pagou",
  referencia: "Referência",
  motivo_recusa: "Motivo da recusa",
  registrado_em: "Registrado em",
  numero: "Parcela",
  vencimento: "Vencimento",
  tentado_em: "Tentado em",
  acao: "Ação",
  entidade: "Sobre",
  entidade_id: "Identificador",
  detalhe: "Detalhes",
  atualizada_em: "Última atividade",
  expira_em: "Expira em",
  ip: "Endereço IP",
  agente: "Navegador",
};

const rotulo = (chave: string) => ROTULOS[chave] ?? chave.replace(/_/g, " ");

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function valor(chave: string, v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (v instanceof Date) return formatarDataHora.format(v);
  if (typeof v === "boolean") return v ? "sim" : "não";
  if (typeof v === "number") return chave === "valor" ? reais.format(v) : String(v);
  // Acompanhantes: [{nome, tipo}] → "Ana (adulto), Bia (criança)".
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    return v
      .map((item) =>
        item && typeof item === "object" && "nome" in item
          ? `${(item as { nome: string }).nome}${"tipo" in item ? ` (${(item as { tipo: string }).tipo})` : ""}`
          : valor(chave, item),
      )
      .join(", ");
  }
  // Detalhe da auditoria: um objeto livre, mostrado como "campo: valor".
  if (typeof v === "object") {
    const partes = Object.entries(v as Record<string, unknown>).map(([k, x]) => `${rotulo(k)}: ${valor(k, x)}`);
    return partes.length ? partes.join("; ") : "—";
  }
  const texto = String(v);
  // Datas em texto ISO vindas do banco.
  if (/^\d{4}-\d{2}-\d{2}T/.test(texto)) {
    const d = new Date(texto);
    if (!Number.isNaN(d.getTime())) return formatarDataHora.format(d);
  }
  // Dia sem hora (pago_em, vencimento, prazo): "AAAA-MM-DD" → "DD/MM/AAAA".
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return formatarPrazo(texto);
  if (chave === "valor" && !Number.isNaN(Number(texto))) return reais.format(Number(texto));
  // Códigos internos ("em_andamento", "nao_vou") ficam legíveis.
  if (/^[a-z]+(_[a-z]+)+$/.test(texto)) return texto.replace(/_/g, " ");
  return texto;
}

function Campos({ dados }: { dados: Record<string, unknown> }) {
  return (
    <dl className="grid gap-x-3 gap-y-0.5 sm:grid-cols-[12rem_1fr]">
      {Object.entries(dados).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{rotulo(k)}</dt>
          <dd className="wrap-break-word">{valor(k, v)}</dd>
        </div>
      ))}
    </dl>
  );
}

export default async function MeusDadosPage() {
  const { user } = await exigirSessao();
  const dados = (await getMeusDados(user.id)) as unknown as Record<string, unknown>;
  const conta = (dados.conta ?? {}) as Record<string, unknown>;

  return (
    <div className="mx-auto w-full max-w-3xl print:max-w-none">
      {/* O único "voltar" da página; o layout não tem outro. */}
      <LinkVoltar href="/conta" className="print:hidden">
        Minha conta
      </LinkVoltar>
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
        <div className="mt-3 text-sm">
          <Campos dados={conta} />
        </div>
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
                    <Campos dados={l} />
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
